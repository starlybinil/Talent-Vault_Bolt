/*
  # Fix access requests RLS policy

  1. Changes
    - Drop and recreate RLS policies for access_requests table to fix the security issue
    - Ensure public users can create access requests
    - Ensure authenticated users can view access requests
    
  2. Security
    - Enable RLS on access_requests table
    - Add policy for public users to create access requests
    - Add policy for authenticated users to view access requests
*/

-- First enable RLS if not already enabled
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Anyone can create access requests" ON access_requests;
DROP POLICY IF EXISTS "Only authenticated users can view access requests" ON access_requests;

-- Create new policies with correct permissions
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