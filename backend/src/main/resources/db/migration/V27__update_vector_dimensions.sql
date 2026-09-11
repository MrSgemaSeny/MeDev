-- Update embedding dimensions from 384 to 768 for Jina AI (jina-embeddings-v2-base-en)
DROP INDEX IF EXISTS vector_store_embedding_idx;
ALTER TABLE vector_store DROP COLUMN IF EXISTS embedding;
ALTER TABLE vector_store ADD COLUMN embedding vector(768);
CREATE INDEX ON vector_store USING HNSW (embedding vector_cosine_ops);
