/*
  # Add job preferences to profiles table

  1. Changes
    - Add job_preferences JSONB column to profiles table
    - Set default value to empty object
    - Make column nullable
*/

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS job_preferences JSONB DEFAULT '{
  "opportunityType": [],
  "preferredRegions": [],
  "preferredCompanies": []
}'::jsonb;