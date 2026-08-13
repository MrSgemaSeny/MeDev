CREATE TABLE github_snapshots (
    user_id BIGINT NOT NULL,
    fetched_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    raw_json TEXT NOT NULL,
    PRIMARY KEY (user_id, fetched_at),
    CONSTRAINT fk_github_snapshots_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_github_snapshots_user_fetched ON github_snapshots (user_id, fetched_at DESC);
