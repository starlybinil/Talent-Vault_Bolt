/*
  # Add contract employment type option
  
  1. Changes
    - Update profiles type check constraint to include contract type
    - Add contract as valid employment type
*/

-- Update the job_opportunity_type check constraint
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_job_opportunity_type_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_job_opportunity_type_check 
CHECK (job_opportunity_type = ANY (ARRAY['full-time', 'part-time', 'internship', 'contract']));