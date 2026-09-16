package com.medev.modules.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medev.modules.ai.dto.AiEducationDto;
import com.medev.modules.ai.dto.AiExperienceDto;
import com.medev.modules.ai.dto.AiOnboardingRequest;
import com.medev.modules.ai.dto.AiOnboardingResponse;
import com.medev.modules.ai.dto.AiParsedResumeDto;
import com.medev.modules.ai.embedding.JinaEmbeddingClient;
import com.medev.modules.ai.embedding.PgVectorRepository;
import com.medev.modules.profile.dto.ProfileDto;
import com.medev.modules.profile.dto.ProfileMapper;
import com.medev.modules.profile.entity.Experience;
import com.medev.modules.profile.entity.Profile;
import com.medev.modules.profile.repository.EducationRepository;
import com.medev.modules.profile.repository.ExperienceRepository;
import com.medev.modules.profile.repository.ProfileRepository;
import com.medev.modules.profile.repository.SkillRepository;
import com.medev.modules.profile.service.ProfileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.transaction.support.SimpleTransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class Milestone3HardeningTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @Mock
    private JinaEmbeddingClient jinaEmbeddingClient;

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private ExperienceRepository experienceRepository;

    @Mock
    private EducationRepository educationRepository;

    @Mock
    private SkillRepository skillRepository;

    @Mock
    private ProfileMapper profileMapper;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private TransactionTemplate transactionTemplate;

    @Mock
    private LlmProvider llmProvider;

    @Mock
    private PromptLoader promptLoader;

    private ObjectMapper objectMapper = new ObjectMapper();
    private PgVectorRepository pgVectorRepository;
    private ProfileService profileService;
    private AiOnboardingService aiOnboardingService;

    @BeforeEach
    void setUp() {
        pgVectorRepository = new PgVectorRepository(jdbcTemplate, objectMapper);
        profileService = new ProfileService(
                profileRepository,
                skillRepository,
                null,
                experienceRepository,
                educationRepository,
                null,
                profileMapper,
                eventPublisher
        );
        aiOnboardingService = new AiOnboardingService(
                llmProvider,
                objectMapper,
                promptLoader,
                profileRepository,
                skillRepository,
                experienceRepository
        );
    }

    @Test
    @DisplayName("Embedding Metadata Versioning: PgVectorRepository upsert serializes model, version, dimension, and chunkHash")
    void testEmbeddingMetadataVersioning_upsert() {
        float[] sampleEmbedding = new float[]{0.1f, 0.2f, 0.3f};
        PgVectorRepository.VectorItem item = new PgVectorRepository.VectorItem(
                "Role: Backend Engineer",
                "EXPERIENCE",
                "101",
                "hash-abc-123",
                "jina-embeddings-v2-base-en",
                "v2",
                768,
                sampleEmbedding
        );

        pgVectorRepository.upsert(1L, List.of(item));

        ArgumentCaptor<List<Object[]>> batchCaptor = ArgumentCaptor.forClass(List.class);
        verify(jdbcTemplate).batchUpdate(contains("INSERT INTO vector_store"), batchCaptor.capture());

        List<Object[]> args = batchCaptor.getValue();
        assertThat(args).hasSize(1);
        Object[] row = args.get(0);
        String metadataJson = (String) row[3];

        assertThat(metadataJson).contains("\"model\":\"jina-embeddings-v2-base-en\"");
        assertThat(metadataJson).contains("\"version\":\"v2\"");
        assertThat(metadataJson).contains("\"dimension\":768");
        assertThat(metadataJson).contains("\"chunkHash\":\"hash-abc-123\"");
        assertThat(metadataJson).contains("\"type\":\"EXPERIENCE\"");
        assertThat(metadataJson).contains("\"sourceId\":\"101\"");
    }

    @Test
    @DisplayName("Embedding Metadata Versioning: VectorizationService re-embeds when version is outdated (v1 -> v2)")
    void testVectorizationService_invalidatesOutdatedVersion() {
        VectorizationService vectorizationService = new VectorizationService(
                jinaEmbeddingClient,
                pgVectorRepository,
                profileRepository,
                transactionTemplate
        );

        lenient().when(transactionTemplate.execute(any())).thenAnswer(inv -> {
            TransactionCallback<?> cb = inv.getArgument(0);
            return cb.doInTransaction(new SimpleTransactionStatus());
        });

        Long userId = 1L;
        com.medev.modules.profile.entity.Project project = com.medev.modules.profile.entity.Project.builder()
                .id(1L)
                .name("MeDev")
                .techStack("Java, React")
                .description("Platform for devs")
                .build();
        Profile profile = Profile.builder()
                .id(1L)
                .projects(new java.util.LinkedHashSet<>(List.of(project)))
                .experiences(new java.util.LinkedHashSet<>())
                .build();

        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));

        // Mock existing chunk with OUTDATED version "v1"
        PgVectorRepository.ExistingVectorChunk outdatedChunk = new PgVectorRepository.ExistingVectorChunk(
                "chunk-old", "PROJECT", "1",
                com.medev.shared.util.CryptoUtils.sha256Hex("Project: MeDev. Tech Stack: Java, React. Description: Platform for devs"),
                "jina-embeddings-v2-base-en",
                "v1", // outdated version!
                768,
                new float[]{0.5f, 0.5f}
        );

        when(jdbcTemplate.query(anyString(), any(RowMapper.class), eq(userId)))
                .thenReturn(List.of(outdatedChunk));

        when(jinaEmbeddingClient.embed(anyList())).thenReturn(List.of(new float[]{0.9f, 0.9f}));

        vectorizationService.vectorizeUserProfile(userId);

        // Crucial verification: Since version was "v1", it MUST call external embedder for fresh "v2" vector
        verify(jinaEmbeddingClient).embed(anyList());
    }

    @Test
    @DisplayName("AI Fallbacks Cleanup: ProfileService skips dummy 'Company' and 'University' placeholders")
    void testProfileService_skipsDummyPlaceholders() {
        Long userId = 1L;
        Profile profile = Profile.builder()
                .id(1L)
                .build();

        when(profileRepository.findByUserIdForUpdate(userId)).thenReturn(Optional.of(profile));
        when(profileMapper.toDto(any(Profile.class))).thenReturn(new ProfileDto());

        AiParsedResumeDto parsed = new AiParsedResumeDto();

        // 1. Valid experience
        AiExperienceDto validExp = new AiExperienceDto();
        validExp.setCompany("Kaspi Bank");
        validExp.setPosition("Backend Lead");
        validExp.setStartDate("2022-01-01");

        // 2. Dummy placeholder experience
        AiExperienceDto dummyExp = new AiExperienceDto();
        dummyExp.setCompany("Company");
        dummyExp.setPosition("Software Engineer");

        parsed.setExperience(List.of(validExp, dummyExp));

        // 3. Valid education
        AiEducationDto validEdu = new AiEducationDto();
        validEdu.setInstitution("KazNU University");
        validEdu.setDegree("Bachelor");

        // 4. Dummy placeholder education
        AiEducationDto dummyEdu = new AiEducationDto();
        dummyEdu.setInstitution("University");
        dummyEdu.setDegree("N/A");

        parsed.setEducation(List.of(validEdu, dummyEdu));

        profileService.importParsedResume(userId, parsed);

        // Experience verification: only Kaspi Bank saved, "Company" skipped
        ArgumentCaptor<List<Experience>> expCaptor = ArgumentCaptor.forClass(List.class);
        verify(experienceRepository).saveAll(expCaptor.capture());
        List<Experience> savedExp = expCaptor.getValue();
        assertThat(savedExp).hasSize(1);
        assertThat(savedExp.get(0).getCompany()).isEqualTo("Kaspi Bank");

        // Education verification: only KazNU saved, "University" skipped
        ArgumentCaptor<List<com.medev.modules.profile.entity.Education>> eduCaptor = ArgumentCaptor.forClass(List.class);
        verify(educationRepository).saveAll(eduCaptor.capture());
        List<com.medev.modules.profile.entity.Education> savedEdu = eduCaptor.getValue();
        assertThat(savedEdu).hasSize(1);
        assertThat(savedEdu.get(0).getInstitution()).isEqualTo("KazNU University");
    }

    @Test
    @DisplayName("AI Fallbacks Cleanup: AiOnboardingService ignores dummy 'Company' experiences")
    void testAiOnboardingService_ignoresDummyCompany() {
        Long userId = 1L;
        Profile profile = Profile.builder().id(1L).build();
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(promptLoader.load(anyString())).thenReturn("System Prompt");

        AiOnboardingResponse aiResp = new AiOnboardingResponse();
        aiResp.setBio("Experienced engineer");
        aiResp.setHeadline("Full Stack Dev");

        AiOnboardingResponse.ExperienceDto dummy = new AiOnboardingResponse.ExperienceDto();
        dummy.setCompany("Company");
        dummy.setPosition("Software Engineer");

        AiOnboardingResponse.ExperienceDto valid = new AiOnboardingResponse.ExperienceDto();
        valid.setCompany("Google");
        valid.setPosition("Staff SRE");

        aiResp.setExperiences(List.of(dummy, valid));

        when(llmProvider.structuredCompletion(anyString(), anyString()))
                .thenReturn(assertJson(aiResp));

        AiOnboardingRequest request = new AiOnboardingRequest();
        request.setRole("Developer");
        request.setStack("Java");
        request.setRecentExperience("Building SaaS");

        aiOnboardingService.generateAndSaveProfile(userId, request);

        ArgumentCaptor<List<Experience>> expCaptor = ArgumentCaptor.forClass(List.class);
        verify(experienceRepository).saveAll(expCaptor.capture());
        List<Experience> saved = expCaptor.getValue();
        assertThat(saved).hasSize(1);
        assertThat(saved.get(0).getCompany()).isEqualTo("Google");
    }

    private String assertJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
