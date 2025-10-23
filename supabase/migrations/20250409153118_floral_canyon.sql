/*
  # Disable email confirmation for new registrations
  
  1. Changes
    - Update auth.users table to auto-confirm email addresses
    - Maintain existing registration functionality
    - Only affects email confirmation behavior
*/

-- Update auth settings to disable email confirmation
ALTER TABLE auth.users
ALTER COLUMN email_confirmed_at 
SET DEFAULT NOW();

-- Set existing unconfirmed users as confirmed
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;