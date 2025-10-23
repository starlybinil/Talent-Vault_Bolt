/*
  # Fix access requests table and permissions
  
  1. Changes
    - Drop and recreate access_requests table with correct structure
    - Add proper RLS policies
    - Add trigger for organization creation
    - Fix metadata column type
*/

-- Drop existing table and policies
DROP TABLE IF EXISTS access_requests CASCADE;

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
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Create function to handle new access requests
CREATE OR REPLACE FUNCTION handle_new_access_request()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Create new organization if organizationName exists in metadata
  IF NEW.metadata->>'organizationName' IS NOT NULL THEN
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
    RETURNING id INTO org_id;

    -- Update access request with organization ID
    NEW.organization_id := org_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new access requests
CREATE TRIGGER on_new_access_request
  BEFORE INSERT ON access_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_access_request();

-- Create function to handle status changes
CREATE OR REPLACE FUNCTION handle_access_request_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update organization status when access request status changes
  IF NEW.status != OLD.status THEN
    UPDATE organizations
    SET status = NEW.status
    WHERE id = NEW.organization_id;

    -- If approved, notify user
    IF NEW.status = 'approved' THEN
      PERFORM
        net.http_post(
          url := CURRENT_SETTING('custom.base_url') || '/functions/v1/notify-user',
          headers := jsonb_build_object(
            'Authorization', 'Bearer ' || CURRENT_SETTING('custom.anon_key'),
            'Content-Type', 'application/json'
          ),
          body := jsonb_build_object('record', row_to_json(NEW))::text
        );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status changes
CREATE TRIGGER on_access_request_status_change
  AFTER UPDATE OF status ON access_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_access_request_status_change();