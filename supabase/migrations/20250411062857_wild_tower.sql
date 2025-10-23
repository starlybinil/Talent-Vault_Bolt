/*
  # Update profile education handling
  
  1. Changes
    - Drop existing trigger
    - Create new trigger that properly handles direct degree/major updates
    - Update education array when degree or major is directly set
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS sync_degree_trigger ON profiles;
DROP FUNCTION IF EXISTS sync_degree_from_education();

-- Create improved trigger function to handle both direct updates and education array
CREATE OR REPLACE FUNCTION sync_degree_from_education()
RETURNS TRIGGER AS $$
BEGIN
  -- Case 1: Direct degree/major update
  IF (TG_OP = 'UPDATE' AND (
      NEW.degree IS DISTINCT FROM OLD.degree OR 
      NEW.major IS DISTINCT FROM OLD.major
    )) THEN
    -- Update education array with new degree/major
    NEW.education := jsonb_build_array(
      jsonb_build_object(
        'degree', COALESCE(NEW.degree, OLD.degree),
        'major', COALESCE(NEW.major, OLD.major)
      )
    );
    RETURN NEW;
  END IF;

  -- Case 2: Education array update
  IF (TG_OP = 'INSERT' OR NEW.education IS DISTINCT FROM OLD.education) THEN
    -- Extract degree and major from education array
    NEW.degree := get_first_degree(NEW.education);
    NEW.major := get_first_major(NEW.education);
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
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