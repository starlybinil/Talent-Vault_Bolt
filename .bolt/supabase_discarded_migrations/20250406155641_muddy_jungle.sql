/*
  # Add preferredCompanies array to job_preferences

  1. Changes
    - Add preferredCompanies array to job_preferences JSONB field
    - Handle NULL and missing field cases
    - Ensure proper JSONB array type
*/

-- Update existing rows with new preferredCompanies field
UPDATE profiles
SET job_preferences = COALESCE(job_preferences, '{}'::jsonb) || 
  jsonb_build_object(
    'preferredCompanies', jsonb_build_array()::jsonb
  )
WHERE job_preferences IS NULL 
   OR NOT (job_preferences ? 'preferredCompanies');