/*
  # Add temporary resumes storage bucket
  
  1. Changes
    - Create temporary_resumes storage bucket
    - Set file size limit to 10MB
    - Configure for PDF files only
    - Add RLS policies for public access
*/

-- Create temporary_resumes storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'temporary_resumes',
  'temporary_resumes',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf'];

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public to upload resumes
CREATE POLICY "Anyone can upload temporary resumes"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'temporary_resumes'
);

-- Create policy to allow public to read temporary resumes
CREATE POLICY "Anyone can read temporary resumes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'temporary_resumes');

-- Add comment explaining the bucket
COMMENT ON TABLE storage.objects IS 'Temporary storage for resumes uploaded through contact form';