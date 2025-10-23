/*
  # Add soft skills support to profiles table
  
  1. Changes
    - Add soft_skills JSONB column to profiles table
    - Set default value to empty array
    - Handle existing NULL values
*/

-- Add soft_skills column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'soft_skills'
  ) THEN
    ALTER TABLE profiles ADD COLUMN soft_skills JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;