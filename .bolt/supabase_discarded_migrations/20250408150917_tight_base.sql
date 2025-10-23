/*
  # Drop last_sign_in column and related objects
  
  1. Changes
    - Drop all triggers related to last_sign_in with CASCADE
    - Drop all functions related to last_sign_in with CASCADE
    - Remove last_sign_in column from profiles table
*/

-- Drop all triggers related to last_sign_in with CASCADE
DROP TRIGGER IF EXISTS update_profile_last_viewed ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- Drop all functions related to last_sign_in with CASCADE
DROP FUNCTION IF EXISTS update_profile_last_viewed() CASCADE;
DROP FUNCTION IF EXISTS send_verification_email() CASCADE;

-- Remove the last_sign_in column from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS last_sign_in CASCADE;