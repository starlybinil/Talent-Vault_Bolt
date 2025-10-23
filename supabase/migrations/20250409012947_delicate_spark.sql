/*
  # Fix profiles RLS policies

  1. Changes
    - Update RLS policies for profiles table to allow employer profile creation
    - Add specific policy for employer profile creation
    - Maintain existing policies for other operations

  2. Security
    - Enable RLS on profiles table (already enabled)
    - Add policy for employer profile creation during signup
    - Maintain existing policies for profile management
*/

-- Drop the existing policy that's too restrictive
DROP POLICY IF EXISTS "Enable profile creation during signup" ON profiles;

-- Create new policy that allows profile creation during signup for both candidates and employers
CREATE POLICY "Enable profile creation during signup" ON profiles
  FOR INSERT
  TO public
  WITH CHECK (
    auth.role() = 'authenticated' AND
    user_id = auth.uid() AND
    type IN ('candidate', 'employer')
  );

-- Ensure other existing policies remain
DO $$ 
BEGIN
  -- Only recreate if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can create their own profile'
  ) THEN
    CREATE POLICY "Users can create their own profile" ON profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile" ON profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Public can view candidate profiles'
  ) THEN
    CREATE POLICY "Public can view candidate profiles" ON profiles
      FOR SELECT
      TO public
      USING (type = 'candidate');
  END IF;
END $$;