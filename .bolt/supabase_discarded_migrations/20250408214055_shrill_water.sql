/*
  # Add bio column to profiles table
  
  1. Changes
    - Add bio column to profiles table if it doesn't exist
    - Add technical_skills column if it doesn't exist
    - Add projects column if it doesn't exist
*/

-- Add bio column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio TEXT;
  END IF;
END $$;

-- Add technical_skills column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'technical_skills'
  ) THEN
    ALTER TABLE profiles ADD COLUMN technical_skills JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add projects column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'projects'
  ) THEN
    ALTER TABLE profiles ADD COLUMN projects JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;