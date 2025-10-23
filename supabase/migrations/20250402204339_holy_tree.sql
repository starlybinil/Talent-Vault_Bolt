/*
  # Add profile photos support
  
  1. Changes
    - Add photo_url column to profiles table
    - Set up storage policies for profile photos
    - Handle existing bucket gracefully
    
  2. Security
    - Enable public read access
    - Restrict write access to authenticated users
    - Ensure users can only manage their own photos
*/

-- Add photo_url column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view profile photos" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own profile photo" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own profile photo" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own profile photo" ON storage.objects;
END $$;

-- Set up storage policies for profile-photos bucket
CREATE POLICY "Users can view profile photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload their own profile photo"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own profile photo"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own profile photo"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Update bucket configuration if it exists
DO $$
BEGIN
  UPDATE storage.buckets
  SET 
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
  WHERE id = 'profile-photos';

  -- Only create bucket if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profile-photos') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'profile-photos',
      'profile-photos',
      true,
      5242880, -- 5MB limit
      ARRAY['image/jpeg', 'image/png', 'image/webp']
    );
  END IF;
END $$;