/*
  # Fix delete_user_data function
  
  1. Changes
    - Remove direct trigger manipulation
    - Fix company deletion logic
    - Add proper error handling
*/

CREATE OR REPLACE FUNCTION delete_user_data(user_id_param UUID)
RETURNS void AS $$
DECLARE
  profile_id UUID;
BEGIN
  -- Get the profile ID for this user
  SELECT id INTO profile_id
  FROM profiles
  WHERE user_id = user_id_param;

  IF profile_id IS NULL THEN
    RAISE EXCEPTION 'Profile not found for user %', user_id_param;
  END IF;

  -- Delete data in order of dependencies
  DELETE FROM messages WHERE sender_id = profile_id OR receiver_id = profile_id;
  DELETE FROM applications WHERE applicant_id = profile_id;
  DELETE FROM user_credentials WHERE user_id = profile_id;
  DELETE FROM user_skills WHERE user_id = profile_id;
  DELETE FROM profile_settings WHERE user_id = profile_id;
  
  -- For employers, delete their companies and related data
  WITH user_companies AS (
    SELECT c.id 
    FROM companies c
    INNER JOIN job_listings j ON j.company_id = c.id
    INNER JOIN profiles p ON p.id = profile_id
    WHERE p.type = 'employer'
  )
  DELETE FROM job_skills 
  WHERE job_id IN (
    SELECT id FROM job_listings 
    WHERE company_id IN (SELECT id FROM user_companies)
  );
  
  DELETE FROM job_listings 
  WHERE company_id IN (SELECT id FROM user_companies);
  
  DELETE FROM companies 
  WHERE id IN (SELECT id FROM user_companies);
  
  -- Finally delete the profile
  DELETE FROM profiles WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql;