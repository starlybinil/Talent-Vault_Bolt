/*
  # Fix degree synchronization with debug logging
  
  1. Changes
    - Drop existing triggers and functions
    - Add debug logging with correct PL/pgSQL syntax
    - Force update all profiles
*/

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS sync_degree_trigger ON profiles;
DROP FUNCTION IF EXISTS sync_degree_from_education();
DROP FUNCTION IF EXISTS get_first_degree(JSONB);

-- Create debug function to log education data
CREATE OR REPLACE FUNCTION log_education_data()
RETURNS void AS $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE 'Education Data:';
  FOR r IN
    SELECT id, education, jsonb_typeof(education) as edu_type
    FROM profiles 
    WHERE education IS NOT NULL
    LIMIT 5
  LOOP
    RAISE NOTICE 'Profile %: Type: %, Value: %', r.id, r.edu_type, r.education;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create improved function to extract first degree
CREATE OR REPLACE FUNCTION get_first_degree(education JSONB)
RETURNS TEXT AS $$
DECLARE
  first_edu JSONB;
  degree_text TEXT;
BEGIN
  -- Log input for debugging
  RAISE NOTICE 'Processing education: %', education;

  -- Handle null or invalid JSON
  IF education IS NULL THEN
    RAISE NOTICE 'Education is NULL';
    RETURN NULL;
  END IF;

  IF jsonb_typeof(education) != 'array' THEN
    RAISE NOTICE 'Education is not an array, type: %', jsonb_typeof(education);
    RETURN NULL;
  END IF;

  IF jsonb_array_length(education) = 0 THEN
    RAISE NOTICE 'Education array is empty';
    RETURN NULL;
  END IF;

  -- Get first education entry
  first_edu := education->0;
  RAISE NOTICE 'First education entry: %', first_edu;
  
  -- Extract degree based on structure
  IF jsonb_typeof(first_edu) = 'object' THEN
    -- Try degree field first
    degree_text := first_edu->>'degree';
    RAISE NOTICE 'Extracted degree from object: %', degree_text;
    
    -- If no degree field, try name field
    IF degree_text IS NULL THEN
      degree_text := first_edu->>'name';
      RAISE NOTICE 'Extracted name as fallback: %', degree_text;
    END IF;
  ELSE
    -- Handle string value
    degree_text := first_edu::text;
    RAISE NOTICE 'Extracted text value: %', degree_text;
  END IF;

  RETURN degree_text;
END;
$$ LANGUAGE plpgsql;

-- Create improved trigger function
CREATE OR REPLACE FUNCTION sync_degree_from_education()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the education value being processed
  RAISE NOTICE 'Trigger processing education: %', NEW.education;
  
  -- Always update degree on INSERT
  IF TG_OP = 'INSERT' THEN
    NEW.degree := get_first_degree(NEW.education);
    RETURN NEW;
  END IF;

  -- On UPDATE, only update if education changed or degree is null
  IF TG_OP = 'UPDATE' THEN
    IF NEW.education IS DISTINCT FROM OLD.education OR NEW.degree IS NULL THEN
      NEW.degree := get_first_degree(NEW.education);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger
CREATE TRIGGER sync_degree_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_degree_from_education();

-- Log current education data
SELECT log_education_data();

-- Force update all existing profiles
UPDATE profiles 
SET degree = get_first_degree(education)
WHERE education IS NOT NULL;

-- Log results
DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE 'Update complete. Sample results:';
  FOR r IN
    SELECT id, education, degree
    FROM profiles
    WHERE education IS NOT NULL
    LIMIT 5
  LOOP
    RAISE NOTICE 'Profile %: Education: %, Degree: %', r.id, r.education, r.degree;
  END LOOP;
END $$;