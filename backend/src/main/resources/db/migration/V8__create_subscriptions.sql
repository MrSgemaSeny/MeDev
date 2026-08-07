CREATE TABLE subscriptions (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan                VARCHAR(20)  NOT NULL DEFAULT 'FREE',
    stripe_customer_id  VARCHAR(255),
    stripe_sub_id       VARCHAR(255),
    status              VARCHAR(20)  NOT NULL DEFAULT 'active',
    current_period_end  TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);
