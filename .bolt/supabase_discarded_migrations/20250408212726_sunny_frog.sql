/*
  # Add Profile Fields and Credentials Tables

  1. Changes to Existing Tables
    - Add new columns to `profiles` table:
      - `bio` (text) - User biography
      - `linkedin` (text) - LinkedIn profile URL
      - `nationality_status` (text) - US nationality status
      - `security_clearance` (text) - Security clearance level
      - `veteran_status` (text) - Military veteran status
      - `photo_url` (text) - Profile photo URL

  2. New Tables
    - `micro_credentials`
      - `id` (uuid, primary key)
      - `name` (text) - Credential name
      - `issuer` (text) - Organization that issues the credential
      - `description` (text) - Credential description
      - `created_at` (timestamptz)

    - `user_credentials` (junction table)
      - `user_id` (uuid) - References profiles.id
      - `credential_id` (uuid) - References micro_credentials.id
      - `earned_at` (timestamptz) - When the credential was earned
      - `expires_at` (timestamptz, optional) - When the credential expires
      - `badge_url` (text, optional) - URL to the credential badge

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nationality_status text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS security_clearance text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS veteran_status text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_url text;

-- Create micro_credentials table
CREATE TABLE IF NOT EXISTS micro_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  issuer text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on micro_credentials
ALTER TABLE micro_credentials ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read micro_credentials
CREATE POLICY "Anyone can view credentials" 
  ON micro_credentials
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Create user_credentials junction table
CREATE TABLE IF NOT EXISTS user_credentials (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  credential_id uuid REFERENCES micro_credentials(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL,
  expires_at timestamptz,
  badge_url text,
  PRIMARY KEY (user_id, credential_id)
);

-- Enable RLS on user_credentials
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own credentials
CREATE POLICY "Users can manage their own credentials"
  ON user_credentials
  FOR ALL
  TO authenticated
  USING (user_id = uid())
  WITH CHECK (user_id = uid());

-- Add some initial micro-credentials
INSERT INTO micro_credentials (name, issuer, description) VALUES
  ('AWS Certified Solutions Architect', 'Amazon Web Services', 'Professional level certification for AWS architecture'),
  ('Certified Kubernetes Administrator', 'Cloud Native Computing Foundation', 'Certification for Kubernetes administration'),
  ('Professional Scrum Master I', 'Scrum.org', 'Entry-level certification for Scrum Masters'),
  ('Security+ CE', 'CompTIA', 'Cybersecurity certification'),
  ('CISSP', 'ISC²', 'Advanced cybersecurity certification')
ON CONFLICT DO NOTHING;