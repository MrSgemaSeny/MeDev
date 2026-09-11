-- V28__add_vacancy_vector.sql
-- Adds pgvector column for vacancy embeddings (Plan B)
ALTER TABLE job_applications
    ADD COLUMN IF NOT EXISTS job_embedding vector(768);

CREATE INDEX IF NOT EXISTS idx_job_applications_embedding
    ON job_applications USING HNSW (job_embedding vector_cosine_ops);
