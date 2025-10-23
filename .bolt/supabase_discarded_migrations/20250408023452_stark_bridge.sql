/*
  # Fix RLS policies for organizations and access requests

  1. Changes
    - Update RLS policies for organizations table to allow public inserts
    - Update RLS policies for access_requests table to allow public inserts
    - Ensure proper security while maintaining functionality

  2. Security
    - Enable RLS on both tables
    - Add policies to allow public access for specific operations
    - Maintain security while allowing necessary functionality
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create organizations through access requests" ON organizations;
DROP POLICY IF EXISTS "Organizations are viewable by everyone" ON organizations;
DROP POLICY IF EXISTS "Anyone can create access requests" ON access_requests;
DROP POLICY IF EXISTS "Only authenticated users can view access requests" ON access_requests;

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