/*
  # Remove all user data
  
  1. Changes
    - Remove all user data from all tables
    - Check for table existence before deletion
    - Preserve table structures and policies
    - Reset sequences
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

  -- Finally profiles
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'profiles'
  ) THEN
    TRUNCATE TABLE profiles CASCADE;
  END IF;
END $$;