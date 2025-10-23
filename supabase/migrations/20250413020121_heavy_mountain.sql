/*
  # Fix credentials access for employers
  
  1. Changes
    - Add RLS policies to allow employers to view micro_credentials
    - Add RLS policies to allow employers to view user_credentials
    - Ensure proper joins between profiles and credentials tables
    
  2. Security
    - Only allow viewing credentials, no modifications
    - Maintain existing security for credential owners
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Employers can view micro_credentials" ON micro_credentials;
DROP POLICY IF EXISTS "Employers can view user_credentials" ON user_credentials;

-- Allow employers to view micro_credentials
CREATE POLICY "Employers can view micro_credentials"
ON micro_credentials
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND type = 'employer'
  )
);

-- Allow employers to view user_credentials
CREATE POLICY "Employers can view user_credentials"
ON user_credentials
FOR SELECT
TO authenticated
USING (
  -- Allow if viewer is an employer
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND type = 'employer'
  )
  -- And the credential belongs to a candidate
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_credentials.user_id
    AND type = 'candidate'
  )
);

-- Add function to get candidate credentials
CREATE OR REPLACE FUNCTION get_candidate_credentials(candidate_profile_id UUID)
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
  WHERE uc.user_id = candidate_profile_id
  ORDER BY uc.earned_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments explaining the function and policies
COMMENT ON FUNCTION get_candidate_credentials IS 'Gets all credentials for a candidate profile, accessible by employers';
COMMENT ON POLICY "Employers can view micro_credentials" ON micro_credentials IS 'Allows employers to view all micro-credentials';
COMMENT ON POLICY "Employers can view user_credentials" ON user_credentials IS 'Allows employers to view credentials of candidates';