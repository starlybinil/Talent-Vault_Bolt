/*
  # Fix authentication flow
  
  1. Changes
    - Add trigger to create profiles_auth entry after user creation
    - Ensure auth.users has proper indexes
*/

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a profiles_auth entry for the new user
  INSERT INTO profiles_auth (
    user_id,
    type,
    first_name,
    last_name
  ) VALUES (
    NEW.id,
    'candidate',  -- Default to candidate type
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add index for better auth performance
CREATE INDEX IF NOT EXISTS idx_auth_users_email 
ON auth.users (email);