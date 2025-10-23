/*
  # Disable email confirmations
  
  1. Changes
    - Set email_confirmed_at default to NOW() for new users
    - Update existing unconfirmed users
*/

-- Set default for new users to be auto-confirmed
ALTER TABLE auth.users
ALTER COLUMN email_confirmed_at 
SET DEFAULT NOW();

-- Confirm any existing unconfirmed users
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;