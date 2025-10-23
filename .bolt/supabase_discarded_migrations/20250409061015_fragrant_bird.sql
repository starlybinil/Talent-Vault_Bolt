/*
  # Add profile views tracking with daily limit
  
  1. New Tables
    - `profile_views`
      - Track view history with daily limit per viewer
      - Store viewer and profile information
      - Add timestamp for analytics
      
  2. Security
    - Enable RLS
    - Add policies for view history access
*/

-- Create profile_views table to track view history
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID NOT NULL REFERENCES profiles(id),
  profile_id UUID NOT NULL REFERENCES profiles(id),
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create composite index for daily view limit
CREATE UNIQUE INDEX profile_views_daily_unique ON profile_views 
(viewer_id, profile_id, CAST(date_trunc('day', viewed_at) AS DATE));

-- Enable RLS
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for profile_views
CREATE POLICY "Users can view their own view history"
  ON profile_views
  FOR SELECT
  TO authenticated
  USING (viewer_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS track_profile_view(UUID);

-- Create improved function with view history
CREATE OR REPLACE FUNCTION track_profile_view(profile_id UUID)
RETURNS void AS $$
DECLARE
  viewer_profile_id UUID;
  viewer_type TEXT;
BEGIN
  -- Get the viewer's profile ID and type
  SELECT p.id, p.type 
  INTO viewer_profile_id, viewer_type
  FROM profiles p
  WHERE p.user_id = auth.uid()
  LIMIT 1;

  -- Only proceed if viewer is an employer and viewing a different profile
  IF viewer_type = 'employer' AND viewer_profile_id != profile_id THEN
    -- Start transaction
    BEGIN
      -- Try to insert view record
      INSERT INTO profile_views (viewer_id, profile_id)
      VALUES (viewer_profile_id, profile_id)
      ON CONFLICT ON CONSTRAINT profile_views_daily_unique DO NOTHING;

      -- If row was inserted (new view), increment the counter
      IF FOUND THEN
        UPDATE profiles 
        SET 
          view_count = COALESCE(view_count, 0) + 1,
          last_viewed_at = NOW()
        WHERE id = profile_id;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error but don't fail the request
        RAISE WARNING 'Error tracking profile view: %', SQLERRM;
    END;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the function
COMMENT ON FUNCTION track_profile_view IS 'Tracks profile views and increments view_count. Prevents duplicate views from same viewer within 24 hours.';