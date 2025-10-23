/*
  # Add email verification support
  
  1. Changes
    - Add verification_tokens table for managing email verification
    - Add function to create verification tokens
    - Add function to verify tokens
    - Update user status on verification
*/

-- Create verification_tokens table
CREATE TABLE IF NOT EXISTS auth.verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  CONSTRAINT unique_active_token UNIQUE (user_id, token)
);

-- Create function to generate verification token
CREATE OR REPLACE FUNCTION auth.create_verification_token(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  new_token TEXT;
BEGIN
  -- Generate secure random token
  new_token := encode(gen_random_bytes(32), 'hex');
  
  -- Delete any existing tokens for this user
  DELETE FROM auth.verification_tokens
  WHERE user_id = $1;
  
  -- Insert new token
  INSERT INTO auth.verification_tokens (user_id, token)
  VALUES ($1, new_token);
  
  RETURN new_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to verify token
CREATE OR REPLACE FUNCTION auth.verify_email_token(token TEXT)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get and validate token
  SELECT vt.user_id INTO user_id
  FROM auth.verification_tokens vt
  WHERE vt.token = $1
    AND vt.expires_at > now();
    
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired token';
  END IF;
  
  -- Update user verification status
  UPDATE auth.users SET
    email_confirmed_at = now(),
    updated_at = now()
  WHERE id = user_id;
  
  -- Delete used token
  DELETE FROM auth.verification_tokens
  WHERE user_id = user_id;
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;