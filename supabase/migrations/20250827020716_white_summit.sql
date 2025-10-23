/*
  # Fix malformed JSON fields in profiles table

  1. Data Cleanup
    - Fix `technical_skills` column where values are not arrays
    - Fix `soft_skills` column where values are not arrays  
    - Fix `projects` column where values are not arrays
    - Fix `education` column where values are not arrays
    - Fix `job_preferences` column where values are not objects

  2. Changes
    - Convert scalar values to proper JSON arrays/objects
    - Ensure all JSON fields have correct data types
    - Handle null values appropriately
*/

-- Fix technical_skills column - convert non-arrays to empty arrays
UPDATE profiles 
SET technical_skills = '[]'::jsonb 
WHERE technical_skills IS NOT NULL 
  AND jsonb_typeof(technical_skills) != 'array';

-- Fix soft_skills column - convert non-arrays to empty arrays  
UPDATE profiles 
SET soft_skills = '[]'::jsonb 
WHERE soft_skills IS NOT NULL 
  AND jsonb_typeof(soft_skills) != 'array';

-- Fix projects column - convert non-arrays to empty arrays
UPDATE profiles 
SET projects = '[]'::jsonb 
WHERE projects IS NOT NULL 
  AND jsonb_typeof(projects) != 'array';

-- Fix education column - convert non-arrays to empty arrays
UPDATE profiles 
SET education = '[]'::jsonb 
WHERE education IS NOT NULL 
  AND jsonb_typeof(education) != 'array';

-- Fix job_preferences column - convert non-objects to empty objects
UPDATE profiles 
SET job_preferences = '{}'::jsonb 
WHERE job_preferences IS NOT NULL 
  AND jsonb_typeof(job_preferences) != 'object';

-- Set NULL values to appropriate defaults
UPDATE profiles 
SET technical_skills = '[]'::jsonb 
WHERE technical_skills IS NULL;

UPDATE profiles 
SET soft_skills = '[]'::jsonb 
WHERE soft_skills IS NULL;

UPDATE profiles 
SET projects = '[]'::jsonb 
WHERE projects IS NULL;

UPDATE profiles 
SET education = '[]'::jsonb 
WHERE education IS NULL;

UPDATE profiles 
SET job_preferences = '{}'::jsonb 
WHERE job_preferences IS NULL;