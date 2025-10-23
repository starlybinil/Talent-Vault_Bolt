/*
  # Fix access request and organization policies
  
  1. Changes
    - Drop and recreate tables with proper structure
    - Add correct RLS policies
    - Fix triggers for organization creation
*/

-- Drop existing tables and start fresh
DROP TABLE IF EXISTS access_requests CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Create organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create access_requests table
CREATE TABLE access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  organization_id UUID REFERENCES organizations(id)
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for organizations
CREATE POLICY "Anyone can create organizations"
ON organizations
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Organizations are viewable by everyone"
ON organizations
FOR SELECT
TO authenticated
USING (true);

-- Create policies for access_requests
CREATE POLICY "Anyone can create access requests"
ON access_requests
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Access requests are viewable by authenticated users"
ON access_requests
FOR SELECT
TO authenticated
USING (true);

-- Create function to handle new access requests
CREATE OR REPLACE FUNCTION handle_new_access_request()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Create new organization if organizationName exists in metadata
  IF NEW.metadata->>'organizationName' IS NOT NULL THEN
    -- Insert organization and get ID
    INSERT INTO organizations (
      name,
      status,
      metadata
    ) VALUES (
      NEW.metadata->>'organizationName',
      'pending',
      jsonb_build_object(
        'contact_name', NEW.metadata->>'name',
        'contact_role', NEW.metadata->>'role',
        'contact_email', NEW.email
      )
    )
    ON CONFLICT (name) DO UPDATE
    SET metadata = EXCLUDED.metadata
    RETURNING id INTO org_id;

    -- Set organization_id in the access request
    NEW.organization_id := org_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new access requests
CREATE TRIGGER on_new_access_request
  BEFORE INSERT ON access_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_access_request();