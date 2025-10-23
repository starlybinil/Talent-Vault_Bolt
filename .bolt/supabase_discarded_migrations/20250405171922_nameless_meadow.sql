/*
  # Fix delete_user_data function
  
  1. Changes
    - Fix company data deletion logic
    - Add proper error handling
    - Ensure correct order of deletions
*/

CREATE OR REPLACE FUNCTION delete_user_data(user_id_param UUID)
RETURNS void AS $$
DECLARE
  profile_id UUID;
  company_ids UUID[];
BEGIN
  -- Get the profile ID for this user
  SELECT id INTO profile_id
  FROM profiles
  WHERE user_id = user_id_param;

  IF profile_id IS NULL THEN
    RAISE EXCEPTION 'Profile not found for user %', user_id_param;
  END IF;

  -- Get all company IDs associated with this user's profile
  SELECT ARRAY_AGG(id)
  INTO company_ids
  FROM companies
  WHERE id IN (
    SELECT company_id 
    FROM job_listings 
    WHERE company_id IN (
      SELECT id FROM companies
      WHERE id IN (
        SELECT company_id 
        FROM job_listings jl
        INNER JOIN profiles p ON p.id = profile_id
        WHERE p.type = 'employer'
      )
    )
  );

  -- Delete data in order of dependencies
  DELETE FROM messages WHERE sender_id = profile_id OR receiver_id = profile_id;
  DELETE FROM applications WHERE applicant_id = profile_id;
  DELETE FROM user_credentials WHERE user_id = profile_id;
  DELETE FROM user_skills WHERE user_id = profile_id;
  DELETE FROM profile_settings WHERE user_id = profile_id;
  
  -- Delete job-related data if user is an employer
  IF EXISTS (SELECT 1 FROM profiles WHERE id = profile_id AND type = 'employer') THEN
    -- Delete job skills first
    DELETE FROM job_skills 
    WHERE job_id IN (
      SELECT id FROM job_listings 
      WHERE company_id = ANY(company_ids)
    );
    
    -- Then delete job listings
    DELETE FROM job_listings 
    WHERE company_id = ANY(company_ids);
    
    -- Finally delete companies
    DELETE FROM companies 
    WHERE id = ANY(company_ids);
  END IF;
  
  -- Delete the profile
  DELETE FROM profiles WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql;