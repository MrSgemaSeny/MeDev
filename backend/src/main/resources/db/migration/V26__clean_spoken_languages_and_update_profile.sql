-- V26: Clean programming languages from spoken languages table and update profile to professional standards

-- 1. Remove programming languages mistakenly added to languages table
DELETE FROM languages 
WHERE LOWER(TRIM(name)) IN (
    'typescript', 'dockerfile', 'docker', 'java', 'shell', 'bash', 'zsh', 
    'css', 'scss', 'less', 'javascript', 'html', 'python', 'c++', 'c#', 'c', 
    'go', 'golang', 'rust', 'php', 'ruby', 'kotlin', 'swift', 'scala', 
    'dart', 'sql', 'yaml', 'yml', 'json', 'xml', 'markdown'
);

-- 2. Ensure legitimate spoken languages exist for profiles that have none
DO $$
DECLARE
    p_rec RECORD;
BEGIN
    FOR p_rec IN SELECT id FROM profiles LOOP
        IF NOT EXISTS (SELECT 1 FROM languages WHERE profile_id = p_rec.id) THEN
            INSERT INTO languages (profile_id, name, level, sort_order) VALUES
                (p_rec.id, 'Kazakh', 'Native', 0),
                (p_rec.id, 'Russian', 'Native / Fluent', 1),
                (p_rec.id, 'English', 'Professional Working', 2);
        END IF;
    END LOOP;
END $$;

-- 3. Update existing profiles with professional headline, summary, location, and website
UPDATE profiles 
SET 
    headline = 'Full Stack Engineer | Java · Spring Boot · React',
    summary = 'Full Stack Engineer with 2+ years of commercial experience building SaaS products end-to-end. Currently developing MeDev — a developer portfolio & resume platform — and ZhanFinance CRM. Stack: Java, Spring Boot, React, PostgreSQL, Docker.',
    location = 'Shymkent, Kazakhstan · Remote',
    website = 'https://medev.mrsgemaseny.com'
WHERE headline IS NULL 
   OR headline ILIKE 'Engineer' 
   OR location ILIKE '%Almaty/Shymkent%' 
   OR website ILIKE '%Envie%';

-- 4. Update experience entry for Zhan Finance with professional achievements
UPDATE experience
SET 
    position = 'Full Stack Engineer',
    description = '• Architected and developed enterprise finance CRM platform from scratch using React, TypeScript, Java Spring Boot, and PostgreSQL.' || E'\n' ||
                  '• Engineered automated financial reporting, real-time analytics dashboards, and role-based access control (RBAC).' || E'\n' ||
                  '• Implemented complete internationalization (i18n) and optimized database query performance for high reliability.',
    tech_stack = 'Java, Spring Boot, React, TypeScript, PostgreSQL, Docker'
WHERE position ILIKE 'Engineer' 
   OR company ILIKE '%Zhan%Finance%';

-- 5. Update education degree to official designation
UPDATE education
SET 
    degree = 'Bachelor of Science in Information Technology',
    field = 'Computer Science & Software Engineering'
WHERE degree ILIKE '%bachelor in IT%' 
   OR degree ILIKE '%bachelor%' 
   OR institution ILIKE '%IITU%';

-- 6. Correct primary tech stack for MeDev project so it does not show as HTML
UPDATE projects
SET 
    tech_stack = 'Java, Spring Boot, React, TypeScript, PostgreSQL',
    description = 'Data-first SaaS platform for software engineers featuring ATS resume generation, AI profile optimization, and job application tracking.'
WHERE name ILIKE '%MeDev%';
