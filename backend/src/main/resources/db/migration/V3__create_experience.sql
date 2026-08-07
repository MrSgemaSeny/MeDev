CREATE TABLE experience (
    id           BIGSERIAL PRIMARY KEY,
    profile_id   BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    company      VARCHAR(255) NOT NULL,
    position     VARCHAR(255) NOT NULL,
    description  TEXT,
    tech_stack   VARCHAR(500),            -- "Java, Spring Boot, PostgreSQL"
    start_date   DATE NOT NULL,
    end_date     DATE,                    -- NULL = по настоящее время
    is_current   BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
