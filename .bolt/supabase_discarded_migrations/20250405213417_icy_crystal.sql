/*
  # Fix Access Requests RLS Policies

  1. Changes
    - Drop existing RLS policies
    - Create new policies with correct permissions
    - Ensure public access for creating requests
    - Fix organization creation handling
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create access requests" ON access_requests;
DROP POLICY IF EXISTS "Only authenticated users can view access requests" ON access_requests;

-- Create new RLS policies
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

-- Update the handle_new_access_request function to be more permissive
CREATE OR REPLACE FUNCTION handle_new_access_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Only try to create organization if organizationName exists in metadata
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
    ON CONFLICT (name) 
    DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;