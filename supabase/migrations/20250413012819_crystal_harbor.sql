/*
  # Fix track_profile_view function
  
  1. Changes
    - Drop existing function first
    - Recreate with void return type
    - Add proper error handling
    - Add validation checks
    - Ensure thread safety
*/

-- Drop existing function first
DROP FUNCTION IF EXISTS track_profile_view(UUID);

-- Create function to track profile views
CREATE OR REPLACE FUNCTION track_profile_view(profile_id UUID)
RETURNS void AS $$
DECLARE
  viewer_type TEXT;
  current_count INTEGER;
  viewer_profile_id UUID;
BEGIN
  -- Get the viewer's profile ID and type
  SELECT id, type INTO viewer_profile_id, viewer_type
  FROM profiles
  WHERE user_id = auth.uid();

  -- Validate inputs
  IF profile_id IS NULL THEN
    RAISE EXCEPTION 'Profile ID cannot be null';
  END IF;

  -- Only allow employers to increment view count
  IF viewer_type != 'employer' THEN
    RAISE EXCEPTION 'Only employers can track profile views';
  END IF;

  -- Verify profile exists and get current count with row lock
  SELECT view_count INTO current_count
  FROM profiles
  WHERE id = profile_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  -- Don't count self-views
  IF viewer_profile_id = profile_id THEN
    RETURN;
  END IF;

  -- Atomically increment view count and update last_viewed_at
  UPDATE profiles 
  SET 
    view_count = COALESCE(current_count, 0) + 1,
    last_viewed_at = NOW()
  WHERE id = profile_id;

EXCEPTION
  WHEN OTHERS THEN
    -- Log error details but don't expose internals
    RAISE WARNING 'Error in track_profile_view: %', SQLERRM;
    -- Re-raise the exception with a user-friendly message
    RAISE EXCEPTION 'Failed to track profile view';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the function
COMMENT ON FUNCTION track_profile_view IS 'Increments view count for a candidate profile. Only employers can increment views, and self-views are not counted.';