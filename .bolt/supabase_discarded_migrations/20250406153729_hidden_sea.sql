/*
  # Add preferred companies to job preferences
  
  1. Changes
    - Add preferredCompanies array to job_preferences default structure
    - Fix array initialization with proper JSONB casting
*/

-- Update existing rows with new preferredCompanies field if it doesn't exist
UPDATE profiles
SET job_preferences = job_preferences || 
  jsonb_build_object(
    'preferredCompanies', '[]'::jsonb
  )
WHERE job_preferences IS NOT NULL
AND NOT (job_preferences ? 'preferredCompanies');