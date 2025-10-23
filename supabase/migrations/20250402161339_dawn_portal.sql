/*
  # Add veteran status field to profiles
  
  1. Changes
    - Add veteran_status column to profiles table
*/

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS veteran_status TEXT;