package com.medev.modules.ai.embedding;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PgVectorRepositoryTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    private ObjectMapper objectMapper = new ObjectMapper();
    private PgVectorRepository repository;

    @BeforeEach
    void setUp() {
        repository = new PgVectorRepository(jdbcTemplate, objectMapper);
    }

    @Test
    void formatVector_emptyOrNull_returnsEmptyBrackets() {
        assertThat(PgVectorRepository.formatVector(null)).isEqualTo("[]");
        assertThat(PgVectorRepository.formatVector(new float[]{})).isEqualTo("[]");
    }

    @Test
    void formatVector_validVector_formatsCorrectly() {
        float[] vector = new float[]{0.123f, -0.456f, 0.789f};
        String formatted = PgVectorRepository.formatVector(vector);
        assertThat(formatted).isEqualTo("[0.123,-0.456,0.789]");
    }

    @Test
    void upsert_nullUserId_doesNothing() {
        repository.upsert(null, List.of());
        verifyNoInteractions(jdbcTemplate);
    }

    @Test
    void upsert_emptyItems_deletesOldVectorsOnly() {
        repository.upsert(42L, List.of());
        verify(jdbcTemplate).update(eq("DELETE FROM vector_store WHERE metadata->>'userId' = ?"), eq("42"));
        verify(jdbcTemplate, never()).batchUpdate(anyString(), anyList());
    }

    @Test
    void upsert_withItems_deletesAndBatchInserts() {
        PgVectorRepository.VectorItem item = new PgVectorRepository.VectorItem(
                "Spring Boot Developer", "EXPERIENCE", "10", new float[]{0.5f, 0.5f}
        );

        repository.upsert(42L, List.of(item));

        verify(jdbcTemplate).update(eq("DELETE FROM vector_store WHERE metadata->>'userId' = ?"), eq("42"));
        verify(jdbcTemplate).batchUpdate(contains("INSERT INTO vector_store"), anyList());
    }

    @Test
    void findSimilar_validParams_executesQuery() {
        float[] queryVector = new float[]{0.1f, 0.2f};
        when(jdbcTemplate.query(anyString(), any(RowMapper.class), eq("42"), eq("[0.1,0.2]"), eq(3)))
                .thenReturn(List.of("Relevant project 1", "Relevant experience 2"));

        List<String> results = repository.findSimilar(42L, queryVector, 3);

        assertThat(results).hasSize(2);
        assertThat(results).containsExactly("Relevant project 1", "Relevant experience 2");
    }

    @Test
    void findSimilar_invalidParams_returnsEmptyList() {
        assertThat(repository.findSimilar(null, new float[]{0.1f}, 5)).isEmpty();
        assertThat(repository.findSimilar(42L, null, 5)).isEmpty();
        assertThat(repository.findSimilar(42L, new float[]{}, 5)).isEmpty();
        assertThat(repository.findSimilar(42L, new float[]{0.1f}, 0)).isEmpty();
        verifyNoInteractions(jdbcTemplate);
    }

    @Test
    void saveVacancyEmbedding_validParams_executesUpdate() {
        float[] vector = new float[]{0.1f, 0.2f};
        repository.saveVacancyEmbedding(100L, vector);

        verify(jdbcTemplate).update(
                eq("UPDATE job_applications SET job_embedding = ?::vector WHERE id = ?"),
                eq("[0.1,0.2]"),
                eq(100L)
        );
    }

    @Test
    void parseVector_validAndInvalidStrings() {
        assertThat(PgVectorRepository.parseVector(null)).isNull();
        assertThat(PgVectorRepository.parseVector("")).isNull();
        assertThat(PgVectorRepository.parseVector("[]")).isNull();

        float[] parsed = PgVectorRepository.parseVector("[0.5, -0.25, 0.75]");
        assertThat(parsed).isNotNull();
        assertThat(parsed).containsExactly(0.5f, -0.25f, 0.75f);
    }

    @Test
    void calculateCosineSimilarity_orthogonalAndParallelVectors() {
        float[] v1 = new float[]{1.0f, 0.0f};
        float[] v2 = new float[]{1.0f, 0.0f};
        float[] v3 = new float[]{0.0f, 1.0f};

        assertThat(PgVectorRepository.calculateCosineSimilarity(v1, v2)).isEqualTo(1.0f);
        assertThat(PgVectorRepository.calculateCosineSimilarity(v1, v3)).isEqualTo(0.0f);
        assertThat(PgVectorRepository.calculateCosineSimilarity(null, v1)).isEqualTo(0.0f);
    }
}
