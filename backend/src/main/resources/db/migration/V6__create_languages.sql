CREATE TABLE languages (
    id          BIGSERIAL PRIMARY KEY,
    profile_id  BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,   -- "Казахский", "English"
    level       VARCHAR(20)  NOT NULL,   -- "native", "C2", "C1", "B2", "B1", "A2", "A1"
    sort_order  INTEGER NOT NULL DEFAULT 0
);
