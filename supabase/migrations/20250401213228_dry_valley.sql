/*
  # Fix profile settings RLS policy
  
  1. Changes
    - Drop existing RLS policy
    - Create new policy that properly handles user authentication and profile relationship
    - Add separate policies for different operations to make permissions more explicit
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own settings" ON profile_settings;

-- Create separate policies for different operations
CREATE POLICY "Users can view their own settings"
ON profile_settings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = profile_settings.user_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own settings"
ON profile_settings
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = profile_settings.user_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own settings"
ON profile_settings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = profile_settings.user_id
    AND profiles.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = profile_settings.user_id
    AND profiles.user_id = auth.uid()
  )
);