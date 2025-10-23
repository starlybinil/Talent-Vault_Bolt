/*
  # Add job opportunity type field to profiles
  
  1. Changes
    - Add job_opportunity_type column to profiles table
    - Add check constraint for valid values
*/

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS job_opportunity_type TEXT
CHECK (job_opportunity_type IN ('full-time', 'part-time', 'internship'));