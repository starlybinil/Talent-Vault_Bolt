/*
  # Add default type to profiles table
  
  1. Changes
    - Add default value of 'candidate' to type column
    - Maintain existing type check constraint
*/

-- Add default value to type column
ALTER TABLE profiles 
ALTER COLUMN type SET DEFAULT 'candidate';

-- Ensure type check constraint exists and includes all valid types
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_type_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_type_check 
CHECK (type IN ('candidate', 'employer', 'recruiter'));