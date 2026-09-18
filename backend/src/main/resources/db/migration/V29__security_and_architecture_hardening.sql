-- V29__security_and_architecture_hardening.sql

-- 1. Profile privacy by default
ALTER TABLE profiles ALTER COLUMN is_public SET DEFAULT FALSE;

-- 2. RAG Tenant Isolation: add relational user_id to vector_store
ALTER TABLE vector_store ADD COLUMN IF NOT EXISTS user_id BIGINT;

-- Backfill user_id from metadata json for existing rows with regex guard
UPDATE vector_store 
SET user_id = CAST(metadata->>'userId' AS BIGINT) 
WHERE metadata IS NOT NULL 
  AND metadata->>'userId' IS NOT NULL 
  AND metadata->>'userId' ~ '^[0-9]+$';

-- Remove any corrupted or orphaned rows without valid userId present in users table
DELETE FROM vector_store 
WHERE user_id IS NULL 
   OR user_id NOT IN (SELECT id FROM users);

-- Enforce NOT NULL
ALTER TABLE vector_store ALTER COLUMN user_id SET NOT NULL;

-- Idempotent FK constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_vector_store_user_id'
    ) THEN
        ALTER TABLE vector_store 
            ADD CONSTRAINT fk_vector_store_user_id 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create B-Tree index for tenant boundary filtering
CREATE INDEX IF NOT EXISTS idx_vector_store_user_id ON vector_store (user_id);

-- 3. Persistent idempotency table for Stripe webhooks
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_id ON stripe_webhook_events (event_id);

