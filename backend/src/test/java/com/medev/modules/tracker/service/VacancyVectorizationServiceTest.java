package com.medev.modules.tracker.service;

import com.medev.modules.ai.embedding.JinaEmbeddingClient;
import com.medev.modules.ai.embedding.PgVectorRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VacancyVectorizationServiceTest {

    @Mock
    private JinaEmbeddingClient jinaEmbeddingClient;

    @Mock
    private PgVectorRepository pgVectorRepository;

    @InjectMocks
    private VacancyVectorizationService service;

    private final float[] vacancyVec = new float[]{0.8f, 0.6f};
    private final float[] profileVec = new float[]{0.8f, 0.6f};

    @Test
    @DisplayName("vectorizeAndMatch successfully computes similarity and delegates update to PgVectorRepository")
    void testVectorizeAndMatch_Success() {
        when(jinaEmbeddingClient.embed(anyList())).thenReturn(List.of(vacancyVec));
        when(pgVectorRepository.getAggregatedProfileVector(1L)).thenReturn(profileVec);

        service.vectorizeAndMatch(1L, 10L, "Senior Java Developer with Spring Boot and PostgreSQL");

        verify(pgVectorRepository).saveVacancyEmbedding(10L, vacancyVec);
        verify(pgVectorRepository).getAggregatedProfileVector(1L);
        // match_score update must go through PgVectorRepository — service must NOT use raw JdbcTemplate
        verify(pgVectorRepository).updateMatchScore(eq(10L), eq(100));
    }

    @Test
    @DisplayName("vectorizeAndMatch skips score calculation when user has no profile vector")
    void testVectorizeAndMatch_NullProfileVector() {
        when(jinaEmbeddingClient.embed(anyList())).thenReturn(List.of(vacancyVec));
        when(pgVectorRepository.getAggregatedProfileVector(1L)).thenReturn(null);

        service.vectorizeAndMatch(1L, 10L, "Senior Java Developer");

        verify(pgVectorRepository).saveVacancyEmbedding(10L, vacancyVec);
        verify(pgVectorRepository, never()).updateMatchScore(anyLong(), anyInt());
    }

    @Test
    @DisplayName("vectorizeAndMatch ignores null/blank inputs without touching any downstream service")
    void testVectorizeAndMatch_InvalidInputs() {
        service.vectorizeAndMatch(null, 10L, "JD");
        service.vectorizeAndMatch(1L, null, "JD");
        service.vectorizeAndMatch(1L, 10L, null);
        service.vectorizeAndMatch(1L, 10L, "   ");

        verifyNoInteractions(jinaEmbeddingClient, pgVectorRepository);
    }
}
