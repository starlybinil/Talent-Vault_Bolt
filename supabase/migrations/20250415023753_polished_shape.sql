/*
  # Convert technical_skills to proper JSONB array
  
  1. Changes
    - Convert technical_skills from JSON string to proper JSONB array
    - Handle null values and invalid JSON
    - Ensure data consistency
*/

-- Create function to safely parse JSON string to array
CREATE OR REPLACE FUNCTION safe_parse_json_array(input_text TEXT)
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
SET technical_skills = safe_parse_json_array(technical_skills::text)
WHERE technical_skills IS NOT NULL;

-- Ensure column is JSONB type
ALTER TABLE profiles 
ALTER COLUMN technical_skills TYPE JSONB USING technical_skills::jsonb;

-- Set default to empty array
ALTER TABLE profiles
ALTER COLUMN technical_skills SET DEFAULT '[]'::jsonb;