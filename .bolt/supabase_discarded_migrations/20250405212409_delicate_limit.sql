/*
  # Add Organizations Table and Update Access Requests

  1. New Tables
    - `organizations`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `status` (text, default: 'pending')
      - `created_at` (timestamp)
      - `metadata` (jsonb)

  2. Changes
    - Add trigger to notify admin on new organization creation
    - Add RLS policies for organization access
*/

-- Create organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Organizations are viewable by everyone"
  ON organizations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create organizations"
  ON organizations FOR INSERT
  TO public
  WITH CHECK (true);

-- Create function to handle new organization notifications
CREATE OR REPLACE FUNCTION notify_admin_new_organization()
RETURNS TRIGGER AS $$
BEGIN
  -- Call Edge Function to notify admin
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

-- Create trigger for new organization notifications
CREATE TRIGGER on_new_organization
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_organization();

-- Update access_requests table to link with organizations
ALTER TABLE access_requests
ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- Create index for better query performance
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_access_requests_organization ON access_requests(organization_id);