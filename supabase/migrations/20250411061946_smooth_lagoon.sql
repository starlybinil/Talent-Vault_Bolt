/*
  # Add degree and major columns to profiles table
  
  1. Changes
    - Add major column to profiles table
    - Add function to sync major from education
    - Update trigger to sync both degree and major
*/

-- Add major column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS major TEXT;

-- Create function to extract first major
CREATE OR REPLACE FUNCTION get_first_major(education JSONB)
RETURNS TEXT AS $$
DECLARE
  first_edu JSONB;
  major_text TEXT;
BEGIN
  -- Handle null or invalid JSON
  IF education IS NULL OR jsonb_typeof(education) != 'array' THEN
    RETURN NULL;
  END IF;

  -- Get first education entry
  first_edu := education->0;
  
  -- Extract major based on structure
  IF jsonb_typeof(first_edu) = 'object' THEN
    major_text := first_edu->>'major';
    -- Also try 'field' if major is null
    IF major_text IS NULL THEN
      major_text := first_edu->>'field';
    END IF;
  END IF;

  RETURN major_text;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS sync_degree_trigger ON profiles;
DROP FUNCTION IF EXISTS sync_degree_from_education();

-- Create improved trigger function to sync both degree and major
CREATE OR REPLACE FUNCTION sync_degree_from_education()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if education has changed or fields are null
  IF NEW.education IS DISTINCT FROM OLD.education 
     OR NEW.degree IS NULL 
     OR NEW.major IS NULL THEN
    NEW.degree := get_first_degree(NEW.education);
    NEW.major := get_first_major(NEW.education);
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
SET 
  degree = get_first_degree(education),
  major = get_first_major(education)
WHERE education IS NOT NULL;