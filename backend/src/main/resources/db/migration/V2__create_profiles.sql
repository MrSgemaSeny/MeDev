CREATE TABLE profiles (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name       VARCHAR(255),
    headline        VARCHAR(500),          -- "Full Stack Developer | Spring Boot + React"
    summary         TEXT,
    avatar_url      VARCHAR(500),
    location        VARCHAR(255),
    website         VARCHAR(500),
    github_username VARCHAR(100),
    github_token    TEXT,                  -- encrypted, для API запросов
    telegram        VARCHAR(100),
    linkedin        VARCHAR(255),
    is_public       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);
