/*
  # Add logos storage bucket
  
  1. New Storage Bucket
    - `logos` bucket for storing application logos
    - Public access enabled
    - Storage policies for public access
*/

-- Create logos storage bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'logos'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('logos', 'logos', true);
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Logos are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
END $$;

-- Set up storage policies for logos bucket
CREATE POLICY "Logos are publicly accessible"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'logos' );

CREATE POLICY "Authenticated users can upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK ( 
    bucket_id = 'logos' 
    AND auth.role() = 'authenticated'
  );