/*
  # Convert education column to proper JSONB format
  
  1. Changes
    - Convert education from JSON string to proper JSONB array
    - Handle null values and invalid JSON
    - Add proper JSONB validation
    - Set default to empty array
*/

-- Create function to safely parse JSON array
CREATE OR REPLACE FUNCTION safe_parse_education_json(input_text TEXT)
RETURNS JSONB AS $$
BEGIN
  -- Return empty array if input is null
  IF input_text IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  -- Try to parse as JSON
  BEGIN
    -- If already valid JSON, cast directly
    RETURN input_text::jsonb;
  EXCEPTION WHEN OTHERS THEN
    BEGIN
      -- Try parsing as string
      RETURN jsonb_build_array(input_text);
    EXCEPTION WHEN OTHERS THEN
      -- Return empty array if parsing fails
      RETURN '[]'::jsonb;
    END;
  END;
END;
$$ LANGUAGE plpgsql;

-- Update existing rows to convert string arrays to JSONB
UPDATE profiles
SET education = safe_parse_education_json(education::text)
WHERE education IS NOT NULL;

-- Ensure column is JSONB type
ALTER TABLE profiles 
ALTER COLUMN education TYPE JSONB USING education::jsonb;

-- Set default to empty array
ALTER TABLE profiles
ALTER COLUMN education SET DEFAULT '[]'::jsonb;

-- Add index for education JSONB array
CREATE INDEX IF NOT EXISTS idx_profiles_education 
ON profiles USING gin(education jsonb_path_ops);

-- Drop the helper function as it's no longer needed
DROP FUNCTION IF EXISTS safe_parse_education_json(TEXT);