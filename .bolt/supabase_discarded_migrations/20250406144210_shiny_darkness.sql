/*
  # Add Job Preferences Column to Profiles Table

  1. Changes
    - Add job_preferences JSONB column to store:
      - Career goals
      - Preferred industry sectors
      - Target salary range
      - Preferred locations
      - Relocation preference
      - Preferred company size
      - Employment type preferences
    - Set default empty structure
*/

-- Add job_preferences column with default structure
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS job_preferences JSONB DEFAULT jsonb_build_object(
  'careerGoals', '',
  'desiredRoles', ARRAY[]::jsonb,
  'preferredIndustries', ARRAY[]::jsonb,
  'targetSalaryRange', jsonb_build_object(
    'min', null,
    'max', null,
    'currency', 'USD'
  ),
  'preferredLocations', ARRAY[]::jsonb,
  'willingToRelocate', false,
  'preferredCompanySize', '',
  'employmentTypes', ARRAY[]::jsonb
);