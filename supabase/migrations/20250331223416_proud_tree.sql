/*
  # Fix profiles table RLS policies

  1. Changes
    - Add INSERT policy for profiles table to allow users to create their own profile
    - Ensure authenticated users can only create a profile for themselves

  2. Security
    - Users can only create a profile with their own user_id
    - Maintains existing RLS policies for SELECT and UPDATE
*/

-- Add INSERT policy for profiles
CREATE POLICY "Users can create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);