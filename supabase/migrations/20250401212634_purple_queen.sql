/*
  # Fix profile settings column names
  
  1. Changes
    - Rename allow_messages to allowMessages to match frontend code
    - Rename email_notifications to emailNotifications
    - Rename show_contact_info to showContactInfo
    - Rename profile_visibility to profileVisibility
*/

-- Rename columns to match frontend camelCase naming
ALTER TABLE profile_settings
RENAME COLUMN allow_messages TO "allowMessages";

ALTER TABLE profile_settings  
RENAME COLUMN email_notifications TO "emailNotifications";

ALTER TABLE profile_settings
RENAME COLUMN show_contact_info TO "showContactInfo";

ALTER TABLE profile_settings
RENAME COLUMN profile_visibility TO "profileVisibility";