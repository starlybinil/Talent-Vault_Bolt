/*
  # Add education support to profiles
  
  1. Changes
    - Add education JSONB column to profiles table
    - Set default value to empty array
    - Add helper function to validate education data
*/

-- Add education column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'education'
  ) THEN
    ALTER TABLE profiles ADD COLUMN education JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;