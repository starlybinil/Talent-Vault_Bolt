/*
  # Update profiles table for employer support
  
  1. Changes
    - Add company_name column to profiles table
    - Update RLS policies for profile creation
    - Ensure proper type validation
*/

-- Add company_name column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Drop existing INSERT policies
DROP POLICY IF EXISTS "Enable profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;

-- Create new INSERT policy for profile creation
CREATE POLICY "Enable profile creation during signup"
ON profiles
FOR INSERT
TO public
WITH CHECK (
  type = ANY (ARRAY['candidate'::text, 'employer'::text, 'recruiter'::text])
);

-- Create policy for users to create their own profile
CREATE POLICY "Users can create their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);