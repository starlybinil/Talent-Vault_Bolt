/*
  # Fix access request RLS and trigger function

  1. Changes
    - Update trigger function to handle organization creation properly
    - Add RLS policies for organizations table
    - Modify access request trigger to handle organization creation with proper permissions

  2. Security
    - Enable RLS on organizations table
    - Add policies for organization creation and viewing
*/

-- Drop existing trigger function and recreate it
CREATE OR REPLACE FUNCTION handle_new_access_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create organization if it doesn't exist
  IF NEW.metadata->>'organization' IS NOT NULL THEN
    INSERT INTO organizations (name, status)
    VALUES (
      NEW.metadata->>'organization',
      'pending'
    )
    ON CONFLICT (name) DO NOTHING
    RETURNING id INTO NEW.organization_id;
    
    -- If organization already existed, get its id
    IF NEW.organization_id IS NULL THEN
      SELECT id INTO NEW.organization_id
      FROM organizations
      WHERE name = NEW.metadata->>'organization';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update organizations RLS policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Organizations are viewable by everyone" ON organizations;
CREATE POLICY "Organizations are viewable by everyone" 
ON organizations
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Anyone can create organizations" ON organizations;
CREATE POLICY "Anyone can create organizations through access requests"
ON organizations
FOR INSERT
TO public
WITH CHECK (true);

-- Update access_requests RLS policies
DROP POLICY IF EXISTS "Anyone can create access requests" ON access_requests;
CREATE POLICY "Anyone can create access requests"
ON access_requests
FOR INSERT
TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "Only authenticated users can view access requests" ON access_requests;
CREATE POLICY "Only authenticated users can view access requests"
ON access_requests
FOR SELECT
TO authenticated
USING (true);