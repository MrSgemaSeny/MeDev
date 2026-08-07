CREATE TABLE skills (
    id          BIGSERIAL PRIMARY KEY,
    profile_id  BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    category    VARCHAR(50),             -- "Backend", "Frontend", "DevOps", "Database"
    level       VARCHAR(20),             -- "beginner", "intermediate", "advanced"
    sort_order  INTEGER NOT NULL DEFAULT 0
);
