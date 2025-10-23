/*
  # Fix degree synchronization
  
  1. Changes
    - Drop and recreate trigger with corrected logic
    - Force update all existing profiles
    - Add better JSON parsing
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS sync_degree_trigger ON profiles;
DROP FUNCTION IF EXISTS sync_degree_from_education();
DROP FUNCTION IF EXISTS get_first_degree(JSONB);

-- Create improved function to extract first degree
CREATE OR REPLACE FUNCTION get_first_degree(education JSONB)
RETURNS TEXT AS $$
DECLARE
  first_edu JSONB;
  degree_text TEXT;
BEGIN
  -- Handle null or invalid JSON
  IF education IS NULL OR jsonb_typeof(education) != 'array' THEN
    RETURN NULL;
  END IF;

  -- Get first education entry
  first_edu := education->0;
  
  -- Extract degree based on structure
  IF jsonb_typeof(first_edu) = 'object' THEN
    degree_text := first_edu->>'degree';
    -- Also try 'name' if degree is null (some entries might use different keys)
    IF degree_text IS NULL THEN
      degree_text := first_edu->>'name';
    END IF;
  ELSE
    degree_text := first_edu::text;
  END IF;

  RETURN degree_text;
END;
$$ LANGUAGE plpgsql;

-- Create improved trigger function
CREATE OR REPLACE FUNCTION sync_degree_from_education()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update degree if education has changed
  IF NEW.education IS DISTINCT FROM OLD.education OR NEW.degree IS NULL THEN
    NEW.degree := get_first_degree(NEW.education);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger
CREATE TRIGGER sync_degree_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_degree_from_education();

-- Force update all existing profiles
UPDATE profiles 
SET degree = get_first_degree(education)
WHERE education IS NOT NULL;