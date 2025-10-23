/*
  # Fix profile view tracking function
  
  1. Changes
    - Drop existing function
    - Create new function with proper error handling
    - Add proper transaction handling
    - Fix profile lookup logic
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS track_profile_view(UUID);

-- Create improved function
CREATE OR REPLACE FUNCTION track_profile_view(profile_id UUID)
RETURNS void AS $$
DECLARE
  viewer_profile_id UUID;
  viewer_type TEXT;
BEGIN
  -- Get the viewer's profile ID and type in one query
  SELECT p.id, p.type 
  INTO viewer_profile_id, viewer_type
  FROM profiles p
  WHERE p.user_id = auth.uid()
  LIMIT 1;

  -- Only proceed if viewer is an employer and viewing a different profile
  IF viewer_type = 'employer' AND viewer_profile_id != profile_id THEN
    -- Update the view count and last_viewed_at timestamp
    UPDATE profiles 
    SET 
      view_count = COALESCE(view_count, 0) + 1,
      last_viewed_at = NOW()
    WHERE id = profile_id;
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in track_profile_view: %', SQLERRM;
    -- Re-raise the exception
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the function
COMMENT ON FUNCTION track_profile_view IS 'Increments view_count when an employer views a candidate profile. Only counts views from different profiles.';