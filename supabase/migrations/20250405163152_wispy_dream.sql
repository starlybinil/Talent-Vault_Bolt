/*
  # Fix access_requests RLS policies

  1. Changes
    - Drop existing RLS policies for access_requests table
    - Create new policies that properly handle both authenticated and public access
    
  2. Security
    - Allow public users to create access requests
    - Allow authenticated users to view access requests
    - Ensure proper RLS enforcement
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create access requests" ON access_requests;
DROP POLICY IF EXISTS "Only authenticated users can view access requests" ON access_requests;

-- Create new policies with proper security rules
CREATE POLICY "Anyone can create access requests"
ON access_requests
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Only authenticated users can view access requests"
ON access_requests
FOR SELECT
TO authenticated
USING (true);

-- Ensure RLS is enabled
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;