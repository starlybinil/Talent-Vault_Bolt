/*
  # Fix organization and access request handling
  
  1. Changes
    - Add trigger to create organization record when access request is created
    - Add trigger to update organization status when access request status changes
    - Fix RLS policies for better security
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_new_organization ON organizations;
DROP TRIGGER IF EXISTS on_access_request_status_change ON access_requests;

-- Create function to handle new access requests
CREATE OR REPLACE FUNCTION handle_new_access_request()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Create new organization
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
  ) RETURNING id INTO org_id;

  -- Update access request with organization ID
  NEW.organization_id := org_id;

  -- Notify admin
  PERFORM
    net.http_post(
      url := CURRENT_SETTING('custom.base_url') || '/functions/v1/notify-admin',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || CURRENT_SETTING('custom.anon_key'),
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object('record', row_to_json(NEW))::text
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new access requests
CREATE TRIGGER on_new_access_request
  BEFORE INSERT ON access_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_access_request();

-- Create function to handle access request status changes
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

-- Create trigger for access request status changes
CREATE TRIGGER on_access_request_status_change
  AFTER UPDATE OF status ON access_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_access_request_status_change();

-- Update RLS policies
DROP POLICY IF EXISTS "Anyone can create access requests" ON access_requests;
DROP POLICY IF EXISTS "Only authenticated users can view access requests" ON access_requests;

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
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;