/*
  # Fix user credentials RLS policies and profile handling

  1. Changes
    - Add RLS policies for user_credentials table
    - Add policies for CRUD operations
    - Fix profile ID handling in policies
    - Add function to get profile ID from auth.uid()

  2. Security
    - Users can only manage their own credentials
    - Authenticated users can view all micro-credentials
*/

-- Function to get profile ID from auth.uid()
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
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own credentials" ON user_credentials;
END $$;

-- Create new RLS policies for user_credentials
CREATE POLICY "Users can view their own credentials"
  ON user_credentials FOR SELECT
  TO authenticated
  USING (user_id = get_profile_id());

CREATE POLICY "Users can insert their own credentials"
  ON user_credentials FOR INSERT
  TO authenticated
  WITH CHECK (user_id = get_profile_id());

CREATE POLICY "Users can update their own credentials"
  ON user_credentials FOR UPDATE
  TO authenticated
  USING (user_id = get_profile_id())
  WITH CHECK (user_id = get_profile_id());

CREATE POLICY "Users can delete their own credentials"
  ON user_credentials FOR DELETE
  TO authenticated
  USING (user_id = get_profile_id());