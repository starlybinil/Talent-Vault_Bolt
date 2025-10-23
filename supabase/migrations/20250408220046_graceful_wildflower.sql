/*
  # Add credentials column to profiles table
  
  1. Changes
    - Add credentials column to store professional credentials and certifications
    - Make field nullable
    - Add comment explaining usage
*/

-- Add credentials column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'credentials'
  ) THEN
    ALTER TABLE profiles ADD COLUMN credentials TEXT;
  END IF;
END $$;

-- Add comment explaining field usage
COMMENT ON COLUMN profiles.credentials IS 'Free-form text field for listing professional credentials and certifications';