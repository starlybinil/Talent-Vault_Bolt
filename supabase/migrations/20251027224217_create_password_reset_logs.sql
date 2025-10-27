/*
  # Password Reset Tracking

  1. New Tables
    - `password_reset_logs`
      - `id` (uuid, primary key)
      - `email` (text, indexed for quick lookups)
      - `reset_type` (text, 'request', 'success', or 'failure')
      - `ip_address` (text, optional for security monitoring)
      - `created_at` (timestamptz, indexed for time-based queries)

  2. Security
    - Enable RLS on `password_reset_logs` table
    - Only authenticated admin users can read password reset logs
    - Service role can insert logs (handled by edge function)

  3. Indexes
    - Index on email for efficient lookups
    - Index on created_at for time-based queries
    - Index on reset_type for filtering by status

  4. Important Notes
    - This table is for security monitoring and audit purposes
    - Logs are retained indefinitely for compliance
    - Rate limiting can be implemented based on this data
    - Only admins can view these logs through admin dashboard
*/

CREATE TABLE IF NOT EXISTS password_reset_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  reset_type text NOT NULL CHECK (reset_type IN ('request', 'success', 'failure')),
  ip_address text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_logs_email ON password_reset_logs(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_logs_created_at ON password_reset_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_password_reset_logs_type ON password_reset_logs(reset_type);

ALTER TABLE password_reset_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view password reset logs"
  ON password_reset_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert password reset logs"
  ON password_reset_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);
