CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255),                    -- nullable для OAuth
    username    VARCHAR(50)  NOT NULL UNIQUE,    -- для публичной страницы
    role        VARCHAR(20)  NOT NULL DEFAULT 'USER',
    plan        VARCHAR(20)  NOT NULL DEFAULT 'FREE',
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_username ON users(username);
