/*
  # Contact Message Notification Trigger

  ## Overview
  Creates a trigger that sends email notifications to all super admin users 
  when a new contact message is received through the contact form.

  ## Changes
  1. Creates a trigger function that calls the notify-contact-message edge function
  2. Creates a trigger on contact_messages table for INSERT operations
  3. Trigger executes after each new row is inserted

  ## Security
  - Function uses SECURITY DEFINER to ensure proper permissions
  - Trigger is owned by postgres user with elevated privileges
  - Edge function validates data before sending emails

  ## Notes
  - Notifications are sent asynchronously via edge function
  - All super admin users in admin_users table will receive notifications
  - Failed notifications will be logged but won't prevent message insertion
*/

-- Create function to notify admins about new contact messages
CREATE OR REPLACE FUNCTION notify_admins_new_contact_message()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  function_url text;
  payload json;
BEGIN
  -- Build the edge function URL
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/notify-contact-message';
  
  -- If setting doesn't exist, use environment variable pattern
  IF function_url IS NULL OR function_url = '/functions/v1/notify-contact-message' THEN
    function_url := 'https://' || current_setting('request.headers', true)::json->>'host' || '/functions/v1/notify-contact-message';
  END IF;

  -- Build payload with contact message details
  payload := json_build_object(
    'record', json_build_object(
      'id', NEW.id,
      'name', NEW.name,
      'email', NEW.email,
      'message', NEW.message,
      'role_type', NEW.role_type,
      'created_at', NEW.created_at
    )
  );

  -- Call edge function using http extension (async)
  PERFORM net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('request.jwt.claim.sub', true)
    ),
    body := payload::jsonb
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't prevent insert
    RAISE WARNING 'Failed to send contact message notification: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_contact_message_inserted ON contact_messages;

-- Create trigger on contact_messages table
CREATE TRIGGER on_contact_message_inserted
  AFTER INSERT ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_new_contact_message();

-- Add comment
COMMENT ON FUNCTION notify_admins_new_contact_message() IS 
  'Trigger function that sends email notifications to super admin users when a new contact message is received';