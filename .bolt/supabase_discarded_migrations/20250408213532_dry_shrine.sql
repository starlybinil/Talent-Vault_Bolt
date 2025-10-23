/*
  # Add LinkedIn profile field to profiles table
  
  1. Changes
    - Add linkedin column to profiles table
    - Make column nullable
*/

-- Add linkedin column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'linkedin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN linkedin TEXT;
  END IF;
END $$;