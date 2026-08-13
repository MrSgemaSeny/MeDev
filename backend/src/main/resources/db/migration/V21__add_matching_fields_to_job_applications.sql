ALTER TABLE job_applications
ADD COLUMN job_description TEXT,
ADD COLUMN match_score INTEGER,
ADD COLUMN match_feedback TEXT;
