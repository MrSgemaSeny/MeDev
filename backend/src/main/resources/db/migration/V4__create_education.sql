CREATE TABLE education (
    id           BIGSERIAL PRIMARY KEY,
    profile_id   BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    institution  VARCHAR(255) NOT NULL,
    degree       VARCHAR(255),            -- "Программная инженерия"
    field        VARCHAR(255),
    start_date   DATE NOT NULL,
    end_date     DATE,
    is_current   BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
