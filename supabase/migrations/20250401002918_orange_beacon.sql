/*
  # Add Technical Skills to Profile

  1. Changes
    - Add technical_skills JSONB column to profiles table to store selected skills
    - Default to empty array
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'technical_skills'
  ) THEN
    ALTER TABLE profiles ADD COLUMN technical_skills JSONB DEFAULT '[]';
  END IF;
END $$;