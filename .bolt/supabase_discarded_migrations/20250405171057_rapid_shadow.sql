/*
  # Add function to delete user data
  
  1. New Functions
    - `delete_user_data`: Deletes all data associated with a user
    
  2. Changes
    - Creates a function that handles deletion of all user data in the correct order
    - Ensures referential integrity is maintained during deletion
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

  -- Delete data in order of dependencies
  DELETE FROM messages WHERE sender_id = profile_id OR receiver_id = profile_id;
  DELETE FROM applications WHERE applicant_id = profile_id;
  DELETE FROM user_credentials WHERE user_id = profile_id;
  DELETE FROM user_skills WHERE user_id = profile_id;
  DELETE FROM profile_settings WHERE user_id = profile_id;
  
  -- Delete job listings and related data for employers
  DELETE FROM job_skills 
  WHERE job_id IN (
    SELECT id FROM job_listings 
    WHERE company_id IN (
      SELECT id FROM companies 
      WHERE id IN (
        SELECT company_id FROM job_listings
        WHERE company_id IN (
          SELECT company_id FROM profiles
          WHERE user_id = user_id_param
        )
      )
    )
  );
  
  DELETE FROM job_listings 
  WHERE company_id IN (
    SELECT id FROM companies 
    WHERE id IN (
      SELECT company_id FROM job_listings
      WHERE company_id IN (
        SELECT company_id FROM profiles
        WHERE user_id = user_id_param
      )
    )
  );
  
  DELETE FROM companies 
  WHERE id IN (
    SELECT company_id FROM profiles
    WHERE user_id = user_id_param
  );
  
  -- Finally delete the profile
  DELETE FROM profiles WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;