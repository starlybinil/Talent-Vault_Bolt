/*
  # Fix company-related column names in profile settings
  
  1. Changes
    - Rename company_name to companyName
    - Rename job_title to jobTitle
    - Rename job_status to jobStatus
*/

-- Rename columns to match frontend camelCase naming
ALTER TABLE profile_settings
RENAME COLUMN company_name TO "companyName";

ALTER TABLE profile_settings
RENAME COLUMN job_title TO "jobTitle";

ALTER TABLE profile_settings
RENAME COLUMN job_status TO "jobStatus";