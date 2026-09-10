-- V25__cleanup_test_data.sql
-- Remove all test users, artificial profiles, and test logs created by Artillery and E2E suites.
-- Preserves the platform administrator/owner account ('mrsgemaseny').

-- 1. Remove audit logs for test users
DELETE FROM audit_logs 
WHERE user_id IN (
    SELECT id FROM users 
    WHERE (username != 'mrsgemaseny' AND (email IS NULL OR LOWER(email) NOT LIKE '%mrsgemaseny%'))
      AND (
          username LIKE 'art_%'
       OR username LIKE 'usr_%'
       OR username LIKE 'auth_%'
       OR username LIKE 'profile_%'
       OR username LIKE 'resume_%'
       OR username LIKE 'portfolio_%'
       OR username LIKE 'tracker_%'
       OR username LIKE 'ai_%'
       OR username LIKE 'github_%'
       OR username LIKE 'admin_%'
       OR username LIKE 'e2e_%'
       OR email LIKE '%artillery%'
       OR email LIKE '%medev-test.local%'
       OR email LIKE '%testmail.com%'
       OR email LIKE '%@github.user.medev.com'
      )
);

-- 2. Remove orphaned audit logs from test runs
DELETE FROM audit_logs 
WHERE details LIKE '%artillery%' 
   OR details LIKE '%e2e_%' 
   OR details LIKE '%testmail%' 
   OR details LIKE '%medev-test.local%';

-- 3. Delete all test users (cascades to profiles, skills, experiences, educations, languages, projects, subscriptions, job_applications, ai_usage, ai_evaluations, github_snapshots)
DELETE FROM users 
WHERE (username != 'mrsgemaseny' AND (email IS NULL OR LOWER(email) NOT LIKE '%mrsgemaseny%'))
  AND (
      username LIKE 'art_%'
   OR username LIKE 'usr_%'
   OR username LIKE 'auth_%'
   OR username LIKE 'profile_%'
   OR username LIKE 'resume_%'
   OR username LIKE 'portfolio_%'
   OR username LIKE 'tracker_%'
   OR username LIKE 'ai_%'
   OR username LIKE 'github_%'
   OR username LIKE 'admin_%'
   OR username LIKE 'e2e_%'
   OR email LIKE '%artillery%'
   OR email LIKE '%medev-test.local%'
   OR email LIKE '%testmail.com%'
   OR email LIKE '%@github.user.medev.com'
  );
