/*
  # Remove full_name column from profiles table

  1. Changes
    - Remove the full_name column from the profiles table since it's been replaced by first_name and last_name

  Note: This is safe to do since we previously copied the data to first_name as a fallback
*/

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE profiles DROP COLUMN full_name;
  END IF;
END $$;