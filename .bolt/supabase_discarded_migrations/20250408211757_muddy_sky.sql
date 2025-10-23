/*
  # Add storage buckets and update image URLs

  1. Storage Buckets
    - Create 'hero-images' bucket for hero carousel images
    - Create 'profile-photos' bucket for student profile photos
    
  2. Schema Updates
    - Update hero_images.url to use storage URL format
    - Update testimonials.photo_url to use storage URL format
    
  3. Security
    - Enable public read access for both buckets
    - Restrict write access to authenticated users
*/

-- Create storage buckets if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'hero-images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('hero-images', 'hero-images', true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'profile-photos'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('profile-photos', 'profile-photos', true);
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Hero images are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload hero images" ON storage.objects;
  DROP POLICY IF EXISTS "Profile photos are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload profile photos" ON storage.objects;
END $$;

-- Set up storage policies for hero-images
CREATE POLICY "Hero images are publicly accessible"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'hero-images' );

CREATE POLICY "Authenticated users can upload hero images"
  ON storage.objects FOR INSERT
  WITH CHECK ( 
    bucket_id = 'hero-images' 
    AND auth.role() = 'authenticated'
  );

-- Set up storage policies for profile-photos
CREATE POLICY "Profile photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'profile-photos' );

CREATE POLICY "Authenticated users can upload profile photos"
  ON storage.objects FOR INSERT
  WITH CHECK ( 
    bucket_id = 'profile-photos' 
    AND auth.role() = 'authenticated'
  );

-- Update hero_images table to use storage URLs
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hero_images' AND column_name = 'url'
  ) THEN
    ALTER TABLE hero_images 
    ALTER COLUMN url TYPE text,
    ALTER COLUMN url SET DEFAULT '';
  END IF;
END $$;

-- Update testimonials table to use storage URLs
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'testimonials' AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE testimonials 
    ALTER COLUMN photo_url TYPE text,
    ALTER COLUMN photo_url SET DEFAULT '';
  END IF;
END $$;