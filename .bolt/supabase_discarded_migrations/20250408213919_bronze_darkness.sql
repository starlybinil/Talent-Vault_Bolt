/*
  # Remove User Profile Data
  
  1. Changes
    - Remove all user data from profiles table
    - Remove all profile settings
    - Remove all user credentials
    - Preserve table structures and RLS policies
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