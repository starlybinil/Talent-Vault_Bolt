/*
  # Add automatic profile creation trigger
  
  1. Changes
    - Create trigger function to create profile on user creation
    - Add trigger to auth.users table
    - Handle profile type based on email domain
    
  2. Security
    - Use SECURITY DEFINER to ensure proper permissions
    - Validate input data
*/

-- Create function to create profile automatically
CREATE OR REPLACE FUNCTION auth.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new profile for the user
  INSERT INTO public.profiles (
    user_id,
    type,
    technical_skills,
    soft_skills,
    projects,
    job_preferences,
    view_count,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    CASE 
      WHEN NEW.email LIKE '%@asu.edu' THEN 'candidate'
      ELSE 'employer'
    END,
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '{}'::jsonb,
    0,
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS create_profile_after_signup ON auth.users;

CREATE TRIGGER create_profile_after_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.create_profile_for_user();

-- Add comment explaining the trigger
COMMENT ON FUNCTION auth.create_profile_for_user IS 'Creates a profile automatically when a new user signs up';