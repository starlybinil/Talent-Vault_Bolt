/*
  # Fix profile settings RLS policies
  
  1. Changes
    - Drop existing RLS policies
    - Create new policies that properly handle user_id from profiles table
    - Add policies for all CRUD operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own settings" ON profile_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON profile_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON profile_settings;

-- Create new RLS policies
CREATE POLICY "Users can manage their own settings"
ON profile_settings
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  user_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  user_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);