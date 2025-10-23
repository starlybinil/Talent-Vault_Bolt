/*
  # Fix profile settings RLS policies

  1. Changes
    - Drop existing RLS policies
    - Create new policies that properly handle profile_id lookup
    - Add policies for all CRUD operations
    - Fix user_id validation to use profile id

  2. Security
    - Users can only manage their own settings
    - Proper validation of user_id against authenticated user's profile
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own settings" ON profile_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON profile_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON profile_settings;

-- Create new RLS policies with correct profile id lookup
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