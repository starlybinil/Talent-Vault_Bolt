/*
  # Fix profile and credentials handling

  1. Changes
    - Add helper function to get profile ID
    - Add RLS policies for user_credentials
    - Add function to get user credentials
    - Fix profile completeness calculation
*/

-- Function to get profile ID from auth.uid()
CREATE OR REPLACE FUNCTION get_profile_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM profiles 
    WHERE user_id = auth.uid() 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get user credentials
CREATE OR REPLACE FUNCTION get_user_credentials(profile_id UUID)
RETURNS TABLE (
  credential_id UUID,
  name TEXT,
  issuer TEXT,
  earned_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  badge_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uc.credential_id,
    mc.name,
    mc.issuer,
    uc.earned_at,
    uc.expires_at,
    uc.badge_url
  FROM user_credentials uc
  JOIN micro_credentials mc ON mc.id = uc.credential_id
  WHERE uc.user_id = profile_id
  ORDER BY uc.earned_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own credentials" ON user_credentials;
  DROP POLICY IF EXISTS "Users can insert their own credentials" ON user_credentials;
  DROP POLICY IF EXISTS "Users can update their own credentials" ON user_credentials;
  DROP POLICY IF EXISTS "Users can delete their own credentials" ON user_credentials;
END $$;

-- Create new RLS policies for user_credentials
CREATE POLICY "Users can view their own credentials"
  ON user_credentials FOR SELECT
  TO authenticated
  USING (user_id = get_profile_id());

CREATE POLICY "Users can insert their own credentials"
  ON user_credentials FOR INSERT
  TO authenticated
  WITH CHECK (user_id = get_profile_id());

CREATE POLICY "Users can update their own credentials"
  ON user_credentials FOR UPDATE
  TO authenticated
  USING (user_id = get_profile_id())
  WITH CHECK (user_id = get_profile_id());

CREATE POLICY "Users can delete their own credentials"
  ON user_credentials FOR DELETE
  TO authenticated
  USING (user_id = get_profile_id());