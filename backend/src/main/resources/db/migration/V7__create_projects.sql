CREATE TABLE projects (
    id              BIGSERIAL PRIMARY KEY,
    profile_id      BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    tech_stack      VARCHAR(500),
    github_url      VARCHAR(500),
    live_url        VARCHAR(500),
    stars           INTEGER DEFAULT 0,
    is_featured     BOOLEAN NOT NULL DEFAULT FALSE,  -- показывать в портфолио
    is_visible      BOOLEAN NOT NULL DEFAULT TRUE,   -- показывать в резюме
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
