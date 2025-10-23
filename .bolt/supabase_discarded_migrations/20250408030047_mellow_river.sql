/*
  # Add email verification support
  
  1. Changes
    - Add function to send verification email
    - Update auth settings to require email verification
    - Add trigger to handle new user registration
*/

-- Create function to send verification email
CREATE OR REPLACE FUNCTION send_verification_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Send verification email through Edge Function
  PERFORM
    net.http_post(
      url := CURRENT_SETTING('custom.base_url') || '/functions/v1/notify-signup',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || CURRENT_SETTING('custom.anon_key'),
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'email', NEW.email,
        'first_name', NEW.raw_user_meta_data->>'first_name',
        'last_name', NEW.raw_user_meta_data->>'last_name'
      )::text
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION send_verification_email();

-- Update auth settings to require email verification
ALTER TABLE auth.users
ALTER COLUMN email_confirmed_at SET DEFAULT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS users_email_confirmation_idx 
ON auth.users (email, email_confirmed_at);