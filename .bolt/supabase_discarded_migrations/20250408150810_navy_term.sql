/*
  # Remove last_sign_in column from profiles table
  
  1. Changes
    - Remove last_sign_in column from profiles table
    - Drop related trigger and function
*/

-- Drop the update_profile_last_viewed trigger if it exists
DROP TRIGGER IF EXISTS update_profile_last_viewed ON auth.users;

-- Drop the update_profile_last_viewed function if it exists
DROP FUNCTION IF EXISTS update_profile_last_viewed();

-- Remove the last_sign_in column from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS last_sign_in;