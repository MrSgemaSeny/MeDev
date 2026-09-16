package com.medev.modules.ai.embedding;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PgVectorRepositoryAdversarialTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private PgVectorRepository repository;

    @BeforeEach
    void setUp() {
        repository = new PgVectorRepository(jdbcTemplate, objectMapper);
    }

    @Test
    @DisplayName("Tenant Isolation: findSimilar strictly scopes SQL query to user_id = ?")
    void testTenantIsolation_findSimilar_strictlyBindsUserId() {
        Long tenantA = 101L;
        float[] queryVector = new float[]{0.1f, 0.2f, 0.3f};

        ArgumentCaptor<String> sqlCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Object> argsCaptor = ArgumentCaptor.forClass(Object.class);

        when(jdbcTemplate.query(sqlCaptor.capture(), any(RowMapper.class), argsCaptor.capture(), anyString(), anyInt()))
                .thenReturn(List.of("Tenant A Secret Vector Data"));

        List<String> results = repository.findSimilar(tenantA, queryVector, 5);

        assertThat(results).containsExactly("Tenant A Secret Vector Data");
        String executedSql = sqlCaptor.getValue();

        // Must explicitly filter by user_id in the WHERE clause
        assertThat(executedSql).contains("WHERE user_id = ?");
        assertThat(executedSql).doesNotContain("metadata->>'userId'");

        // First bound parameter must strictly be tenantA's ID
        assertThat(argsCaptor.getValue()).isEqualTo(tenantA);
    }

    @Test
    @DisplayName("Tenant Isolation: upsert only deletes and inserts vectors for the designated user_id")
    void testTenantIsolation_upsert_strictlyBoundToUserId() {
        Long tenantA = 202L;
        PgVectorRepository.VectorItem item1 = new PgVectorRepository.VectorItem(
                "Document 1", "EXPERIENCE", "exp-1", new float[]{0.1f, 0.2f}
        );
        PgVectorRepository.VectorItem item2 = new PgVectorRepository.VectorItem(
                "Document 2", "EDUCATION", "edu-1", new float[]{0.3f, 0.4f}
        );

        repository.upsert(tenantA, List.of(item1, item2));

        // 1. Delete must be strictly bounded to tenantA
        verify(jdbcTemplate).update(eq("DELETE FROM vector_store WHERE user_id = ?"), eq(tenantA));

        // 2. Batch insert must populate user_id column
        ArgumentCaptor<String> insertSqlCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<List<Object[]>> batchArgsCaptor = ArgumentCaptor.forClass(List.class);

        verify(jdbcTemplate).batchUpdate(insertSqlCaptor.capture(), batchArgsCaptor.capture());

        String insertSql = insertSqlCaptor.getValue();
        assertThat(insertSql).contains("INSERT INTO vector_store (id, user_id, content, metadata, embedding)");

        List<Object[]> batch = batchArgsCaptor.getValue();
        assertThat(batch).hasSize(2);
        for (Object[] row : batch) {
            // Index 1 is user_id
            assertThat(row[1]).isEqualTo(tenantA);
        }
    }

    @Test
    @DisplayName("Tenant Isolation: getAggregatedProfileVector strictly averages embeddings for target user_id")
    void testTenantIsolation_getAggregatedProfileVector_scopedToUser() {
        Long tenantA = 303L;

        ArgumentCaptor<String> sqlCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Object> argsCaptor = ArgumentCaptor.forClass(Object.class);

        repository.getAggregatedProfileVector(tenantA);

        verify(jdbcTemplate).query(sqlCaptor.capture(), any(org.springframework.jdbc.core.ResultSetExtractor.class), argsCaptor.capture());

        assertThat(sqlCaptor.getValue()).contains("WHERE user_id = ?");
        assertThat(argsCaptor.getValue()).isEqualTo(tenantA);
    }

    @Test
    @DisplayName("Tenant Isolation: null userId safely short-circuits without executing any SQL")
    void testTenantIsolation_nullUserId_noDbInteraction() {
        assertThat(repository.findSimilar(null, new float[]{0.1f}, 5)).isEmpty();
        assertThat(repository.getAggregatedProfileVector(null)).isNull();
        repository.upsert(null, List.of());

        verifyNoInteractions(jdbcTemplate);
    }

    @Test
    @DisplayName("Migration V29 DDL verification: Relational integrity, FK cascade, and user_id index exist")
    void testV29MigrationDDL_verifiesIntegrityAndCascadeConstraints() throws IOException {
        Path migrationPath = Path.of("src/main/resources/db/migration/V29__security_and_architecture_hardening.sql");
        assertThat(migrationPath).exists();

        String ddl = Files.readString(migrationPath);

        // Verify relational column addition
        assertThat(ddl).containsIgnoringCase("ALTER TABLE vector_store ADD COLUMN IF NOT EXISTS user_id BIGINT");

        // Verify backfill from metadata
        assertThat(ddl).containsIgnoringCase("CAST(metadata->>'userId' AS BIGINT)");

        // Verify NOT NULL constraint
        assertThat(ddl).containsIgnoringCase("ALTER TABLE vector_store ALTER COLUMN user_id SET NOT NULL");

        // Verify Foreign Key constraint with ON DELETE CASCADE
        assertThat(ddl).containsIgnoringCase("ADD CONSTRAINT fk_vector_store_user_id");
        assertThat(ddl).containsIgnoringCase("FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE");

        // Verify B-tree index on user_id
        assertThat(ddl).containsIgnoringCase("CREATE INDEX IF NOT EXISTS idx_vector_store_user_id ON vector_store (user_id)");

        // Verify profile privacy by default
        assertThat(ddl).containsIgnoringCase("ALTER TABLE profiles ALTER COLUMN is_public SET DEFAULT FALSE");

        // Verify stripe webhook idempotency table
        assertThat(ddl).containsIgnoringCase("CREATE TABLE IF NOT EXISTS stripe_webhook_events");
    }
}
