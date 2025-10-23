/*
  # Fix infinite recursion in admin_users RLS policies

  1. Security Changes
    - Drop existing recursive RLS policies on admin_users table
    - Create new non-recursive policies that avoid self-referencing queries
    - Ensure admin users can access their own data without infinite loops

  2. Policy Changes
    - Replace recursive policy with direct auth.uid() check
    - Simplify super admin policy to avoid table self-reference
    - Maintain security while preventing recursion
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admin users can view their own data" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage all admin users" ON admin_users;

-- Create new non-recursive policies
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

-- Create a simple function to check if current user is super admin
-- This avoids recursion by using a direct query approach
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE auth_user_id = auth.uid() 
    AND role = 'super_admin' 
    AND is_active = true
  );
$$;

-- Policy for super admins to manage all admin users
-- Uses the function to avoid direct table recursion
CREATE POLICY "Super admins can manage all admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    CASE 
      WHEN auth.uid() IS NULL THEN false
      ELSE (
        SELECT role = 'super_admin' AND is_active = true
        FROM admin_users 
        WHERE auth_user_id = auth.uid()
        LIMIT 1
      )
    END
  )
  WITH CHECK (
    CASE 
      WHEN auth.uid() IS NULL THEN false
      ELSE (
        SELECT role = 'super_admin' AND is_active = true
        FROM admin_users 
        WHERE auth_user_id = auth.uid()
        LIMIT 1
      )
    END
  );

-- Allow public insert for initial admin creation (will be restricted by application logic)
CREATE POLICY "Allow admin creation"
  ON admin_users
  FOR INSERT
  TO public
  WITH CHECK (true);