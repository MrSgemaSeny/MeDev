-- V23__add_subscription_expires_at.sql
ALTER TABLE users ADD COLUMN subscription_expires_at TIMESTAMP;
