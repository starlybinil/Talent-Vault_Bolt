/*
  # Add projects column to profiles table

  1. Changes
    - Add `projects` column to `profiles` table to store project information as JSONB
    - Set default value to empty JSON array
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'projects'
  ) THEN
    ALTER TABLE profiles ADD COLUMN projects JSONB DEFAULT '[]';
  END IF;
END $$;