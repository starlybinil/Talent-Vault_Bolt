/*
  # Create newsletter_subscriptions table
  
  1. New Tables
    - `newsletter_subscriptions`
      - `id` (uuid, primary key)
      - `email` (text, required, unique)
      - `subscribed_at` (timestamptz)
      - `unsubscribed_at` (timestamptz)
      - `status` (text, default: 'active')
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for public insert access
    - Add policies for admin management
*/

-- Create newsletter_subscriptions table
CREATE TABLE newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'unsubscribed'))
);

-- Create index for email lookups
CREATE INDEX idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);

-- Enable RLS
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow public to subscribe
CREATE POLICY "Public can subscribe to newsletter"
  ON newsletter_subscriptions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow admins to manage subscriptions
CREATE POLICY "Admins can manage newsletter subscriptions"
  ON newsletter_subscriptions
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Add comment explaining the table
COMMENT ON TABLE newsletter_subscriptions IS 'Stores newsletter subscription information';