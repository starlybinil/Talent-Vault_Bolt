/*
  # Fix Admin RLS Policies

  1. Security Updates
    - Add proper admin access policies for profiles table
    - Create helper function to check admin status
    - Update existing admin policy to work with admin_users table

  2. Functions
    - is_admin_user() - checks if current user is an active admin
*/

-- Create helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE auth_user_id = auth.uid() 
    AND is_active = true
  );
END;
$$;

-- Drop existing admin policy if it exists
DROP POLICY IF EXISTS "Admin full access" ON profiles;

-- Create new admin policy using our helper function
CREATE POLICY "Admin users have full access to profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- Also ensure admin users can access contact_messages
DROP POLICY IF EXISTS "Admins can manage contact messages" ON contact_messages;

CREATE POLICY "Admin users can manage contact messages"
  ON contact_messages
  FOR ALL
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());