-- Expand language level length and make it nullable for flexible AI/manual input
ALTER TABLE languages ALTER COLUMN level TYPE VARCHAR(50);
ALTER TABLE languages ALTER COLUMN level DROP NOT NULL;
