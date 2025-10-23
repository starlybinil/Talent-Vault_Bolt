/*
  # Fix degree and major synchronization
  
  1. Changes
    - Update trigger function to handle INSERT case properly
    - Fix NULL handling in sync function
    - Add better error handling
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS sync_degree_trigger ON profiles;
DROP FUNCTION IF EXISTS sync_degree_from_education();

-- Create improved trigger function to sync both degree and major
CREATE OR REPLACE FUNCTION sync_degree_from_education()
RETURNS TRIGGER AS $$
BEGIN
  -- For INSERT, always set degree and major
  IF TG_OP = 'INSERT' THEN
    NEW.degree := get_first_degree(NEW.education);
    NEW.major := get_first_major(NEW.education);
    RETURN NEW;
  END IF;

  -- For UPDATE, only update if education changed or fields are null
  IF TG_OP = 'UPDATE' THEN
    IF NEW.education IS DISTINCT FROM OLD.education 
       OR NEW.degree IS NULL 
       OR NEW.major IS NULL THEN
      NEW.degree := get_first_degree(NEW.education);
      NEW.major := get_first_major(NEW.education);
    END IF;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error details
    RAISE WARNING 'Error in sync_degree_from_education: %', SQLERRM;
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
SET 
  degree = get_first_degree(education),
  major = get_first_major(education)
WHERE education IS NOT NULL;