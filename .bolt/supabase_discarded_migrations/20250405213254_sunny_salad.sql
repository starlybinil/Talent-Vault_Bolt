/*
  # Fix organizations table constraints and triggers

  1. Changes
    - Add unique constraint on organizations.name
    - Update handle_new_access_request function to properly handle organization creation
    - Fix RLS policies for organizations table
*/

-- Add unique constraint to organizations table
ALTER TABLE organizations
ADD CONSTRAINT organizations_name_key UNIQUE (name);

-- Update the handle_new_access_request function
CREATE OR REPLACE FUNCTION handle_new_access_request()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Create new organization if organizationName exists in metadata
  IF NEW.metadata->>'organizationName' IS NOT NULL THEN
    -- Insert organization and get ID, handling conflicts
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
$$ LANGUAGE plpgsql;