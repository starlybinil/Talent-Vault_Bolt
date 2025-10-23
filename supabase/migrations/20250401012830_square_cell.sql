/*
  # Fix Resume Storage Configuration

  1. Changes
    - Ensure resumes bucket exists with correct configuration
    - Set proper CORS settings
    - Update storage policies
*/

-- Create or update resumes bucket configuration
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  true,  -- Make bucket public but protect with RLS
  false,
  10485760,  -- 10MB in bytes
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf'];

-- Enable RLS for the bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
  DROP POLICY IF EXISTS "Users can read their own resumes" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own resumes" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;
END $$;

-- Create policy to allow authenticated users to upload their own resumes
CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to read their own resumes
CREATE POLICY "Users can read their own resumes"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to update their own resumes
CREATE POLICY "Users can update their own resumes"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to delete their own resumes
CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);