/*
  # Add preferredCompanies array to job_preferences
  
  1. Changes
    - Add preferredCompanies array to existing job_preferences objects
    - Handle NULL values and missing fields
*/

-- Update existing rows with new preferredCompanies field if it doesn't exist
UPDATE profiles
SET job_preferences = COALESCE(job_preferences, '{}'::jsonb) || 
  jsonb_build_object(
    'preferredCompanies', jsonb_build_array()
  )
WHERE job_preferences IS NULL 
   OR NOT (job_preferences ? 'preferredCompanies');