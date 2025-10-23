/*
  # Create access requests table

  1. New Tables
    - `access_requests`
      - `id` (uuid, primary key)
      - `email` (text, not null)
      - `status` (text, default: 'pending')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policy for inserting new requests
*/

CREATE TABLE access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

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