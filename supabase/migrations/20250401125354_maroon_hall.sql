/*
  # Add job status tracking to profile settings

  1. Changes
    - Add job_status column to profile_settings table
    - Add company_name column to profile_settings table
    - Add job_title column to profile_settings table
*/

ALTER TABLE profile_settings
ADD COLUMN IF NOT EXISTS job_status TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT;