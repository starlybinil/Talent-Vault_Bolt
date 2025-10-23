/*
  # Add database trigger for access request status changes
  
  1. Changes
    - Add function to handle status changes
    - Add trigger to notify user when request is approved
    - Track status changes in access_requests table
*/

-- Create function to handle status changes
CREATE OR REPLACE FUNCTION handle_access_request_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to 'approved', invoke the notify-user function
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Call Edge Function to send email notification
    PERFORM
      net.http_post(
        url := CURRENT_SETTING('custom.base_url') || '/functions/v1/notify-user',
        headers := jsonb_build_object(
          'Authorization', 'Bearer ' || CURRENT_SETTING('custom.anon_key'),
          'Content-Type', 'application/json'
        ),
        body := jsonb_build_object('record', row_to_json(NEW))::text
      );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER on_access_request_status_change
  AFTER UPDATE OF status ON access_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_access_request_status_change();