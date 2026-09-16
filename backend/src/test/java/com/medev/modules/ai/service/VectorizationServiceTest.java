package com.medev.modules.ai.service;

import com.medev.modules.ai.embedding.JinaEmbeddingClient;
import com.medev.modules.ai.embedding.PgVectorRepository;
import com.medev.modules.profile.entity.Experience;
import com.medev.modules.profile.entity.Profile;
import com.medev.modules.profile.entity.Project;
import com.medev.modules.profile.repository.ProfileRepository;
import com.medev.shared.util.CryptoUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.support.SimpleTransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VectorizationServiceTest {

    @Mock
    private JinaEmbeddingClient jinaEmbeddingClient;

    @Mock
    private PgVectorRepository pgVectorRepository;

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private TransactionTemplate transactionTemplate;

    private VectorizationService vectorizationService;

    @BeforeEach
    void setUp() {
        vectorizationService = new VectorizationService(
                jinaEmbeddingClient,
                pgVectorRepository,
                profileRepository,
                transactionTemplate
        );

        lenient().when(transactionTemplate.execute(any())).thenAnswer(invocation -> {
            TransactionCallback<?> callback = invocation.getArgument(0);
            return callback.doInTransaction(new SimpleTransactionStatus());
        });
    }

    @Test
    void vectorizeUserProfile_withCachedChunks_skipsExternalEmbeddingCall() {
        Long userId = 1L;

        Project project = Project.builder()
                .id(10L)
                .name("MeDev SaaS")
                .techStack("Spring Boot, React")
                .description("Data-first SaaS for developers")
                .build();

        Profile profile = Profile.builder()
                .id(1L)
                .projects(new java.util.LinkedHashSet<>(List.of(project)))
                .experiences(new java.util.LinkedHashSet<>())
                .build();

        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));

        String expectedContent = "Project: MeDev SaaS. Tech Stack: Spring Boot, React. Description: Data-first SaaS for developers";
        String expectedHash = CryptoUtils.sha256Hex(expectedContent);
        float[] cachedEmbedding = new float[]{0.1f, 0.2f, 0.3f};

        PgVectorRepository.ExistingVectorChunk existingChunk = new PgVectorRepository.ExistingVectorChunk(
                "chunk-1", "PROJECT", "10", expectedHash, cachedEmbedding
        );
        when(pgVectorRepository.findExistingChunksByUserId(userId)).thenReturn(List.of(existingChunk));

        vectorizationService.vectorizeUserProfile(userId);

        // Crucial verification: zero calls to external Jina AI embedding API
        verifyNoInteractions(jinaEmbeddingClient);

        ArgumentCaptor<List<PgVectorRepository.VectorItem>> itemsCaptor = ArgumentCaptor.forClass(List.class);
        verify(pgVectorRepository).upsert(eq(userId), itemsCaptor.capture());

        List<PgVectorRepository.VectorItem> savedItems = itemsCaptor.getValue();
        assertThat(savedItems).hasSize(1);
        assertThat(savedItems.get(0).chunkHash()).isEqualTo(expectedHash);
        assertThat(savedItems.get(0).embedding()).isEqualTo(cachedEmbedding);
    }

    @Test
    void vectorizeUserProfile_withNewAndCachedChunks_onlyEmbedsNewChunk() {
        Long userId = 1L;

        Project cachedProject = Project.builder()
                .id(10L)
                .name("MeDev SaaS")
                .techStack("Spring Boot, React")
                .description("Data-first SaaS for developers")
                .build();

        Experience newExperience = Experience.builder()
                .id(20L)
                .position("Senior Architect")
                .company("Acme")
                .techStack("Java, Postgres")
                .description("Leading platform scalability")
                .build();

        Profile profile = Profile.builder()
                .id(1L)
                .projects(new java.util.LinkedHashSet<>(List.of(cachedProject)))
                .experiences(new java.util.LinkedHashSet<>(List.of(newExperience)))
                .build();

        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));

        String cachedContent = "Project: MeDev SaaS. Tech Stack: Spring Boot, React. Description: Data-first SaaS for developers";
        String cachedHash = CryptoUtils.sha256Hex(cachedContent);
        float[] cachedEmbedding = new float[]{0.1f, 0.2f, 0.3f};

        PgVectorRepository.ExistingVectorChunk existingChunk = new PgVectorRepository.ExistingVectorChunk(
                "chunk-1", "PROJECT", "10", cachedHash, cachedEmbedding
        );
        when(pgVectorRepository.findExistingChunksByUserId(userId)).thenReturn(List.of(existingChunk));

        float[] newEmbedding = new float[]{0.9f, 0.8f, 0.7f};
        when(jinaEmbeddingClient.embed(anyList())).thenReturn(List.of(newEmbedding));

        vectorizationService.vectorizeUserProfile(userId);

        // Embed is called strictly with 1 text item (the new experience)
        ArgumentCaptor<List<String>> embedCaptor = ArgumentCaptor.forClass(List.class);
        verify(jinaEmbeddingClient).embed(embedCaptor.capture());
        assertThat(embedCaptor.getValue()).hasSize(1);
        assertThat(embedCaptor.getValue().get(0)).contains("Senior Architect at Acme");

        ArgumentCaptor<List<PgVectorRepository.VectorItem>> itemsCaptor = ArgumentCaptor.forClass(List.class);
        verify(pgVectorRepository).upsert(eq(userId), itemsCaptor.capture());

        List<PgVectorRepository.VectorItem> savedItems = itemsCaptor.getValue();
        assertThat(savedItems).hasSize(2);
        assertThat(savedItems.get(0).embedding()).isEqualTo(cachedEmbedding);
        assertThat(savedItems.get(1).embedding()).isEqualTo(newEmbedding);
    }
}
