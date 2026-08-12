CREATE TABLE job_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- WISHLIST, APPLIED, INTERVIEW, OFFER, REJECTED
    job_url TEXT,
    location VARCHAR(255),
    salary_range VARCHAR(255),
    notes TEXT,
    applied_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);
