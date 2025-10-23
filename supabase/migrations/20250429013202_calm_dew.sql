-- Drop existing function
DROP FUNCTION IF EXISTS safely_create_profile;

-- Create updated function that always creates candidate profiles
CREATE OR REPLACE FUNCTION safely_create_profile(
  p_user_id UUID,
  p_first_name TEXT,
  p_last_name TEXT
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

  -- Create new profile as candidate
  INSERT INTO profiles (
    user_id,
    type,
    first_name,
    last_name,
    technical_skills,
    soft_skills,
    projects,
    job_preferences,
    view_count
  )
  VALUES (
    p_user_id,
    'candidate',
    p_first_name,
    p_last_name,
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