/*
  # Remove location column from profiles table
  
  1. Changes
    - Drop location column from profiles table
    - Remove location data since it's no longer needed
*/

-- Drop location column if it exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE profiles DROP COLUMN location;
  END IF;
END $$;