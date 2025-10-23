/*
  # Fix profile settings RLS policy
  
  1. Changes
    - Drop existing RLS policy
    - Create new policy that correctly checks user_id against profile id
    - Add ALL operations support (SELECT, INSERT, UPDATE, DELETE)
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own settings" ON profile_settings;

-- Create new RLS policy with correct user_id check
CREATE POLICY "Users can manage their own settings"
ON profile_settings
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  user_id = (
    SELECT id 
    FROM profiles 
    WHERE profiles.user_id = auth.uid()
    LIMIT 1
  )
)
WITH CHECK (
  user_id = (
    SELECT id 
    FROM profiles 
    WHERE profiles.user_id = auth.uid()
    LIMIT 1
  )
);