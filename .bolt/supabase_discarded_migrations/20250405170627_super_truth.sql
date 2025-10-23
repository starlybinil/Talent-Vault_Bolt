/*
  # Remove all users and related data
  
  1. Changes
    - Remove all users from auth.users table
    - Remove all related user data from other tables
    - Reset sequences
    - Keep table structures intact
*/

-- Remove all data in reverse order of dependencies
DELETE FROM messages;
DELETE FROM applications;
DELETE FROM user_credentials;
DELETE FROM user_skills;
DELETE FROM job_skills;
DELETE FROM job_listings;
DELETE FROM companies;
DELETE FROM profile_settings;
DELETE FROM profiles;
DELETE FROM access_requests;

-- Delete all users from auth.users
DELETE FROM auth.users;

-- Reset sequences
ALTER SEQUENCE IF EXISTS auth.users_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS profiles_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS companies_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS job_listings_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS applications_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS messages_id_seq RESTART WITH 1;