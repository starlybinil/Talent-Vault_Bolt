/*
  # Fix RLS policies for organizations and access requests
  
  1. Changes
    - Drop existing policies first
    - Recreate policies with proper permissions
    - Ensure public access for creating organizations and requests
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can create organizations" ON organizations;
  DROP POLICY IF EXISTS "Organizations are viewable by everyone" ON organizations;
END $$;

-- Drop existing policies for access_requests if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can create access requests" ON access_requests;
  DROP POLICY IF EXISTS "Access requests are viewable by authenticated users" ON access_requests;
END $$;

-- Create new policies for organizations
CREATE POLICY "Organizations are viewable by everyone"
ON organizations FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can create organizations"
ON organizations FOR INSERT
TO public
WITH CHECK (true);

-- Create new policies for access_requests
CREATE POLICY "Anyone can create access requests"
ON access_requests FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Access requests are viewable by authenticated users"
ON access_requests FOR SELECT
TO authenticated
USING (true);