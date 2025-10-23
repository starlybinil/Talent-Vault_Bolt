/*
  # Add comprehensive RLS policies for profiles table
  
  1. Changes
    - Drop existing policies to avoid conflicts
    - Add function to check admin status
    - Create policies for:
      - Own profile access
      - Admin access
      - Public candidate profiles
      - Employer access to candidates
    
  2. Security
    - Ensure proper data isolation
    - Handle both authenticated and public access
    - Prevent recursive policy issues
*/

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    JOIN profiles p ON p.id = ur.user_id
    WHERE p.user_id = auth.uid()
    AND r.name = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "View own profile" ON profiles;
  DROP POLICY IF EXISTS "View candidate profiles" ON profiles;
  DROP POLICY IF EXISTS "Employers view candidates" ON profiles;
  DROP POLICY IF EXISTS "Create own profile" ON profiles;
  DROP POLICY IF EXISTS "Update own profile" ON profiles;
END $$;

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own profile
CREATE POLICY "View own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy for users to update their own profile
CREATE POLICY "Update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for users to create their own profile
CREATE POLICY "Create own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  type IN ('candidate', 'employer', 'recruiter')
);

-- Policy for public access to candidate profiles
CREATE POLICY "View candidate profiles"
ON profiles
FOR SELECT
TO public
USING (type = 'candidate');

-- Policy for employers to view candidate profiles
CREATE POLICY "Employers view candidates"
ON profiles
FOR SELECT
TO authenticated
USING (
  type = 'candidate' AND 
  EXISTS (
    SELECT 1 
    FROM profiles employer
    WHERE employer.user_id = auth.uid()
    AND employer.type = 'employer'
    AND employer.id <> profiles.id
  )
);

-- Policy for admin access to all profiles
CREATE POLICY "Admin full access"
ON profiles
FOR ALL
TO authenticated
USING (is_admin() = true)
WITH CHECK (is_admin() = true);

-- Add comments explaining the policies
COMMENT ON POLICY "View own profile" ON profiles IS 'Allow users to view their own profile';
COMMENT ON POLICY "Update own profile" ON profiles IS 'Allow users to update their own profile';
COMMENT ON POLICY "Create own profile" ON profiles IS 'Allow users to create their own profile';
COMMENT ON POLICY "View candidate profiles" ON profiles IS 'Allow public access to candidate profiles';
COMMENT ON POLICY "Employers view candidates" ON profiles IS 'Allow employers to view candidate profiles';
COMMENT ON POLICY "Admin full access" ON profiles IS 'Allow admins full access to all profiles';

-- Verification queries (commented out, for testing purposes)
/*
-- Test as regular user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub TO '<user_id>';
SELECT * FROM profiles WHERE user_id = auth.uid();

-- Test as employer
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub TO '<employer_id>';
SELECT * FROM profiles WHERE type = 'candidate';

-- Test as admin
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub TO '<admin_id>';
SELECT * FROM profiles;

-- Test as public
SET LOCAL ROLE anon;
SELECT * FROM profiles WHERE type = 'candidate';
*/