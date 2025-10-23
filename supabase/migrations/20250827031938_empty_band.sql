/*
  # Fix infinite recursion in admin_users RLS policies

  1. Drop all existing problematic policies
  2. Create simple, non-recursive policies
  3. Ensure no policy references admin_users table in its condition
*/

-- Drop all existing policies on admin_users table
DROP POLICY IF EXISTS "Admin users can update their own data" ON admin_users;
DROP POLICY IF EXISTS "Admin users can view their own data" ON admin_users;
DROP POLICY IF EXISTS "Allow admin creation" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage all admin users" ON admin_users;

-- Create simple, non-recursive policies
CREATE POLICY "Admin users can view their own data"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Admin users can update their own data"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Allow admin creation"
  ON admin_users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- For super admin management, we'll handle this at the application level
-- to avoid any potential recursion issues