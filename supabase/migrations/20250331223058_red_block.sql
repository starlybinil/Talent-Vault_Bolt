/*
  # Add profile views tracking

  1. New Columns
    - Add `view_count` to profiles table
    - Add `last_viewed_at` to profiles table
    
  2. Changes
    - Add function to calculate profile completeness
    - Add function to get top skills
*/

-- Add view tracking columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMPTZ;

-- Create function to calculate profile completeness
CREATE OR REPLACE FUNCTION calculate_profile_completeness(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_fields INTEGER := 6; -- full_name, bio, location, education, experience, skills
  filled_fields INTEGER := 0;
BEGIN
  SELECT
    (CASE WHEN full_name IS NOT NULL AND full_name != '' THEN 1 ELSE 0 END) +
    (CASE WHEN bio IS NOT NULL AND bio != '' THEN 1 ELSE 0 END) +
    (CASE WHEN location IS NOT NULL AND location != '' THEN 1 ELSE 0 END) +
    (CASE WHEN education IS NOT NULL AND education != '' THEN 1 ELSE 0 END) +
    (CASE WHEN experience IS NOT NULL AND experience != '' THEN 1 ELSE 0 END) +
    (CASE WHEN EXISTS (SELECT 1 FROM user_skills WHERE user_id = profile_id) THEN 1 ELSE 0 END)
  INTO filled_fields
  FROM profiles
  WHERE id = profile_id;

  RETURN (filled_fields::FLOAT / total_fields::FLOAT * 100)::INTEGER;
END;
$$ LANGUAGE plpgsql;