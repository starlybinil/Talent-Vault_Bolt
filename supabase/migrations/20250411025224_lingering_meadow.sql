/*
  # Add degree column to profiles table
  
  1. Changes
    - Add degree column to profiles table
    - Add function to extract first degree from education array
    - Add trigger to keep degree in sync with education
*/

-- Add degree column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS degree TEXT;

-- Create function to extract first degree
CREATE OR REPLACE FUNCTION get_first_degree(education JSONB)
RETURNS TEXT AS $$
BEGIN
  IF education IS NULL OR jsonb_typeof(education) != 'array' OR jsonb_array_length(education) = 0 THEN
    RETURN NULL;
  END IF;

  RETURN (
    SELECT 
      CASE 
        WHEN jsonb_typeof(edu) = 'object' THEN edu->>'degree'
        ELSE edu::text
      END
    FROM jsonb_array_elements(education) edu
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;

-- Update existing profiles with degree information
UPDATE profiles
SET degree = get_first_degree(education)
WHERE education IS NOT NULL;

-- Create trigger to keep degree in sync
CREATE OR REPLACE FUNCTION sync_degree_from_education()
RETURNS TRIGGER AS $$
BEGIN
  NEW.degree := get_first_degree(NEW.education);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger
CREATE TRIGGER sync_degree_trigger
  BEFORE INSERT OR UPDATE OF education ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_degree_from_education();

-- Add comment explaining the column
COMMENT ON COLUMN profiles.degree IS 'First degree from education array, automatically synced';