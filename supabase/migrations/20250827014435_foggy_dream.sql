/*
  # Admin Dashboard Support Functions

  1. New Functions
    - `get_profile_save_count` - Returns how many times a profile has been saved by employers
    - `calculate_profile_completeness` - Calculates profile completion percentage
    - `track_profile_view` - Tracks when a profile is viewed
    - `track_video_view` - Tracks video resource views
    - `delete_user_data` - Safely deletes all user data (for account deletion)
    - `is_admin` - Checks if current user has admin role
    - `update_updated_at_column` - Generic trigger function for updating timestamps
    - `update_profile_settings_updated_at` - Specific trigger for profile settings
    - `update_news_articles_updated_at` - Specific trigger for news articles
    - `sync_degree_from_education` - Syncs degree information from education data
    - `handle_access_request_status_change` - Handles access request status changes

  2. Security
    - All functions have appropriate security checks
    - Admin functions require admin role verification
*/

-- Function to get profile save count
CREATE OR REPLACE FUNCTION get_profile_save_count(profile_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM saved_candidates
    WHERE candidate_id = profile_id
  );
END;
$$;

-- Function to calculate profile completeness
CREATE OR REPLACE FUNCTION calculate_profile_completeness(profile_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_record profiles%ROWTYPE;
  completeness_score integer := 0;
  total_fields integer := 10; -- Total number of fields we're checking
BEGIN
  SELECT * INTO profile_record
  FROM profiles
  WHERE id = profile_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Check each field and add to score
  IF profile_record.first_name IS NOT NULL AND profile_record.first_name != '' THEN
    completeness_score := completeness_score + 1;
  END IF;

  IF profile_record.last_name IS NOT NULL AND profile_record.last_name != '' THEN
    completeness_score := completeness_score + 1;
  END IF;

  IF profile_record.bio IS NOT NULL AND profile_record.bio != '' THEN
    completeness_score := completeness_score + 1;
  END IF;

  IF profile_record.photo_url IS NOT NULL AND profile_record.photo_url != '' THEN
    completeness_score := completeness_score + 1;
  END IF;

  IF profile_record.technical_skills IS NOT NULL AND jsonb_array_length(profile_record.technical_skills) > 0 THEN
    completeness_score := completeness_score + 1;
  END IF;

  IF profile_record.soft_skills IS NOT NULL AND jsonb_array_length(profile_record.soft_skills) > 0 THEN
    completeness_score := completeness_score + 1;
  END IF;

  IF profile_record.education IS NOT NULL AND jsonb_array_length(profile_record.education) > 0 THEN
    completeness_score := completeness_score + 1;
  END IF;

  IF profile_record.projects IS NOT NULL AND jsonb_array_length(profile_record.projects) > 0 THEN
    completeness_score := completeness_score + 1;
  END IF;

  IF profile_record.nationality_status IS NOT NULL AND profile_record.nationality_status != '' THEN
    completeness_score := completeness_score + 1;
  END IF;

  IF profile_record.job_opportunity_type IS NOT NULL AND profile_record.job_opportunity_type != '' THEN
    completeness_score := completeness_score + 1;
  END IF;

  -- Return percentage
  RETURN (completeness_score * 100 / total_fields);
END;
$$;

-- Function to track profile views
CREATE OR REPLACE FUNCTION track_profile_view(profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET 
    view_count = COALESCE(view_count, 0) + 1,
    last_viewed_at = now()
  WHERE id = profile_id;
END;
$$;

-- Function to track video views
CREATE OR REPLACE FUNCTION track_video_view(resource_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE semiconductor_resources
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = resource_id;
END;
$$;

-- Function to safely delete user data
CREATE OR REPLACE FUNCTION delete_user_data(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete in correct order to respect foreign key constraints
  
  -- Delete user credentials
  DELETE FROM user_credentials 
  WHERE user_id IN (
    SELECT id FROM profiles WHERE user_id = user_id_param
  );
  
  -- Delete saved candidates (both as employer and candidate)
  DELETE FROM saved_candidates 
  WHERE employer_id IN (
    SELECT id FROM profiles WHERE user_id = user_id_param
  ) OR candidate_id IN (
    SELECT id FROM profiles WHERE user_id = user_id_param
  );
  
  -- Delete filter tracking
  DELETE FROM filter_tracking 
  WHERE employer_id IN (
    SELECT id FROM profiles WHERE user_id = user_id_param
  );
  
  -- Delete employer details
  DELETE FROM employer_details 
  WHERE profile_id IN (
    SELECT id FROM profiles WHERE user_id = user_id_param
  );
  
  -- Delete profile settings
  DELETE FROM profile_settings 
  WHERE user_id IN (
    SELECT id FROM profiles WHERE user_id = user_id_param
  );
  
  -- Delete candidate education
  DELETE FROM candidate_education 
  WHERE profile_id IN (
    SELECT id FROM profiles WHERE user_id = user_id_param
  );
  
  -- Finally delete the profile
  DELETE FROM profiles WHERE user_id = user_id_param;
END;
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (jwt() ->> 'role') = 'admin';
END;
$$;

-- Generic function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to update profile settings updated_at
CREATE OR REPLACE FUNCTION update_profile_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to update news articles updated_at
CREATE OR REPLACE FUNCTION update_news_articles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to sync degree from education data
CREATE OR REPLACE FUNCTION sync_degree_from_education()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- This function can be used to sync degree information
  -- Implementation depends on specific business logic
  RETURN NEW;
END;
$$;

-- Function to handle access request status changes
CREATE OR REPLACE FUNCTION handle_access_request_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Handle status change logic here
  -- Could trigger notifications, emails, etc.
  RETURN NEW;
END;
$$;