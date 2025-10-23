/*
  # Remove all users and related data
  
  1. Changes
    - Remove all users from auth.users table
    - Remove all related user data from other tables
    - Reset sequences
    - Preserve table structures
*/

-- Remove data from tables that exist
DO $$ 
BEGIN
  -- Profile settings
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'profile_settings'
  ) THEN
    TRUNCATE TABLE profile_settings CASCADE;
  END IF;

  -- User credentials
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_credentials'
  ) THEN
    TRUNCATE TABLE user_credentials CASCADE;
  END IF;

  -- Applications
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'applications'
  ) THEN
    TRUNCATE TABLE applications CASCADE;
  END IF;

  -- Messages
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'messages'
  ) THEN
    TRUNCATE TABLE messages CASCADE;
  END IF;

  -- Profiles
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'profiles'
  ) THEN
    TRUNCATE TABLE profiles CASCADE;
  END IF;
END $$;

-- Remove all users from auth.users
DELETE FROM auth.users;

-- Reset sequences
ALTER SEQUENCE IF EXISTS auth.users_id_seq RESTART WITH 1;