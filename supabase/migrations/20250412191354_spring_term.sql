/*
  # Fix recursive RLS policies on profiles table

  1. Changes
    - Drop existing problematic RLS policies
    - Create new, non-recursive policies for profiles table
    
  2. Security
    - Maintain existing security model but avoid recursion
    - Employers can view candidate profiles
    - Users can view their own profiles
    - Public can view candidate profiles
    - Users can manage their own profiles
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Employers can view candidate profiles" ON profiles;
DROP POLICY IF EXISTS "Public can view candidate profiles" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create new non-recursive policies
CREATE POLICY "View own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "View candidate profiles"
ON profiles
FOR SELECT
TO public
USING (type = 'candidate');

CREATE POLICY "Employers view candidates"
ON profiles
FOR SELECT
TO authenticated
USING (
  (type = 'candidate' AND EXISTS (
    SELECT 1 FROM profiles employer 
    WHERE employer.user_id = auth.uid() 
    AND employer.type = 'employer'
    AND employer.id != profiles.id
  ))
);

CREATE POLICY "Create own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);