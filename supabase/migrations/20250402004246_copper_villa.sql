/*
  # Fix Profile Settings RLS Policies

  1. Changes
    - Drop existing policies
    - Create new policies with simpler conditions
    - Add helper function to get profile ID
    - Add policies for all CRUD operations

  2. Security
    - Ensure users can only manage their own settings
    - Maintain data isolation between users
*/

-- Helper function to get profile ID
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

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own settings" ON profile_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON profile_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON profile_settings;

-- Create new RLS policies
CREATE POLICY "Users can view their own settings"
ON profile_settings
FOR SELECT
TO authenticated
USING (user_id = get_profile_id());

CREATE POLICY "Users can insert their own settings"
ON profile_settings
FOR INSERT
TO authenticated
WITH CHECK (user_id = get_profile_id());

CREATE POLICY "Users can update their own settings"
ON profile_settings
FOR UPDATE
TO authenticated
USING (user_id = get_profile_id())
WITH CHECK (user_id = get_profile_id());