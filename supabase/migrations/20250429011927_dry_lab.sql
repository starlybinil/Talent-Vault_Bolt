/*
  # Fix profile creation function
  
  1. Changes
    - Fix parameter ordering to ensure defaults come last
    - Set default type to 'candidate'
    - Maintain existing functionality
*/

-- Drop existing function
DROP FUNCTION IF EXISTS safely_create_profile;

-- Create updated function with correct parameter ordering
CREATE OR REPLACE FUNCTION safely_create_profile(
  p_user_id UUID,
  p_first_name TEXT,
  p_last_name TEXT,
  p_type TEXT DEFAULT 'candidate',
  p_company_name TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  profile_id UUID;
  final_type TEXT;
BEGIN
  -- Check if profile already exists
  SELECT id INTO profile_id
  FROM profiles
  WHERE user_id = p_user_id;

  -- If profile exists, return its ID
  IF profile_id IS NOT NULL THEN
    RETURN profile_id;
  END IF;

  -- Set type to 'candidate' unless explicitly set to 'employer'
  final_type := CASE 
    WHEN p_type = 'employer' THEN 'employer'
    ELSE 'candidate'
  END;

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
    final_type,
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