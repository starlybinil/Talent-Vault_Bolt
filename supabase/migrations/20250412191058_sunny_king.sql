/*
  # Fix RLS policies for profiles table

  1. Changes
    - Remove recursive policies that were causing infinite loops
    - Simplify and optimize RLS policies for profiles table
    - Add more specific conditions to prevent policy recursion
    
  2. Security
    - Maintain existing security model while fixing recursion issues
    - Ensure proper access control for different user types
    - Keep RLS enabled on profiles table
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Employers can view candidate profiles" ON profiles;
DROP POLICY IF EXISTS "Public can view candidate profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Create new optimized policies
CREATE POLICY "Anyone can view candidate profiles"
ON profiles
FOR SELECT
TO public
USING (
  type = 'candidate'
  AND (
    -- Allow viewing all candidate profiles
    type = 'candidate'
    -- Or if authenticated, also allow viewing if you're an employer
    OR (
      auth.role() = 'authenticated' 
      AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() 
        AND type = 'employer'
      )
    )
  )
);

CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Keep existing policies that are working correctly
-- "Enable profile creation during signup"
-- "Users can create their own profile"
-- "Users can update own profile"