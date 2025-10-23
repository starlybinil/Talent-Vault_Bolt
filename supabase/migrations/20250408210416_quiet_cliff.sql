/*
  # Add credentials field to profiles table
  
  1. Changes
    - Add credentials text field to profiles table
    - Make field nullable
    - Add comment explaining usage
*/

-- Add credentials column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS credentials TEXT;

-- Add comment explaining field usage
COMMENT ON COLUMN profiles.credentials IS 'Free-form text field for listing professional credentials and certifications';