/*
  # Add nationality status and security clearance fields to profiles
  
  1. Changes
    - Add nationality_status column to profiles table
    - Add security_clearance column to profiles table
*/

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS nationality_status TEXT,
ADD COLUMN IF NOT EXISTS security_clearance TEXT;