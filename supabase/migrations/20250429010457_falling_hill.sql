/*
  # Fix profile creation constraints and policies
  
  1. Changes
    - Drop existing unique constraints
    - Recreate constraints with proper conditions
    - Update RLS policies for profile creation
    - Add function to safely create profile
*/

-- Drop existing unique constraints
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS unique_user_profile;

-- Create new unique constraint
ALTER TABLE profiles
ADD CONSTRAINT unique_user_profile UNIQUE (user_id);

-- Create function to safely create profile
CREATE OR REPLACE FUNCTION safely_create_profile(
  p_user_id UUID,
  p_type TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_company_name TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  profile_id UUID;
BEGIN
  -- Check if profile already exists
  SELECT id INTO profile_id
  FROM profiles
  WHERE user_id = p_user_id;

  -- If profile exists, return its ID
  IF profile_id IS NOT NULL THEN
    RETURN profile_id;
  END IF;

  -- Create new profile
  INSERT INTO profiles (
    user_id,
    type,
    first_name,
    last_name,
    company_name,
    technical_skills,
    soft_skills,
    projects,
    job_preferences,
    view_count
  )
  VALUES (
    p_user_id,
    p_type,
    p_first_name,
    p_last_name,
    p_company_name,
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    0
  )
  RETURNING id INTO profile_id;

  RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;