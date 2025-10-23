/*
  # Add profile view tracking function
  
  1. Changes
    - Create function to track profile views
    - Add security definer to ensure proper permissions
    - Handle concurrent access with row locking
    - Add error handling
*/

-- Create function to track profile views
CREATE OR REPLACE FUNCTION track_profile_view(profile_id UUID)
RETURNS void AS $$
DECLARE
  viewer_type TEXT;
  current_count INTEGER;
BEGIN
  -- Get the viewer's profile type
  SELECT type INTO viewer_type
  FROM profiles
  WHERE user_id = auth.uid();

  -- Only proceed if viewer is an employer
  IF viewer_type = 'employer' THEN
    -- Lock the row for update to handle concurrent access
    SELECT view_count INTO current_count
    FROM profiles
    WHERE id = profile_id
    FOR UPDATE;

    -- Update the view count and last_viewed_at timestamp
    UPDATE profiles SET
      view_count = COALESCE(current_count, 0) + 1,
      last_viewed_at = NOW()
    WHERE id = profile_id;
  END IF;

EXCEPTION
  WHEN no_data_found THEN
    RAISE EXCEPTION 'Profile not found';
  WHEN OTHERS THEN
    -- Log error details
    RAISE WARNING 'Error in track_profile_view: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the function
COMMENT ON FUNCTION track_profile_view IS 'Increments view_count when an employer views a candidate profile';