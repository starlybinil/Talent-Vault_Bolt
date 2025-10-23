/*
  # Fix education search in JSONB data
  
  1. Changes
    - Add function to search education JSONB array
    - Add index for JSONB search performance
    - Update education search to use proper JSONB operators
*/

-- Create function to check if education array contains degree
CREATE OR REPLACE FUNCTION education_contains_degree(education jsonb, degree text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM jsonb_array_elements(education) AS edu
    WHERE (
      -- Check degree field directly
      (edu->>'degree' ILIKE degree || '%')
      -- Also check if the entire object is a string (old format)
      OR (jsonb_typeof(edu) = 'string' AND edu#>>'{}' ILIKE degree || '%')
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Drop existing index if it exists
DROP INDEX IF EXISTS idx_profiles_education;

-- Create GIN index for education JSONB array
CREATE INDEX idx_profiles_education ON profiles USING GIN (education jsonb_path_ops);

-- Add comment explaining the function
COMMENT ON FUNCTION education_contains_degree IS 'Checks if education JSONB array contains a degree matching the given pattern';