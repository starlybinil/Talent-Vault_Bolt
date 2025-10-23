/*
  # Update RLS policies for public access to profiles
  
  1. Changes
    - Allow public access to view candidate profiles
    - Maintain existing RLS policies for other operations
*/

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- Create new SELECT policy that allows public access
CREATE POLICY "Profiles are viewable by everyone"
ON profiles
FOR SELECT
TO public
USING (type = 'candidate');

-- Update job_listings policy to allow public access
DROP POLICY IF EXISTS "Job listings are viewable by everyone" ON job_listings;

CREATE POLICY "Job listings are viewable by everyone"
ON job_listings
FOR SELECT
TO public
USING (true);