/*
  # Remove testimonials feature
  
  1. Changes
    - Drop testimonials table
    - Remove related storage objects
*/

-- Drop testimonials table
DROP TABLE IF EXISTS testimonials;

-- Remove testimonial photos from storage
DELETE FROM storage.objects 
WHERE bucket_id = 'profile-photos' 
AND name LIKE '%sarah-chen.jpg'
OR name LIKE '%james-wilson.jpg'
OR name LIKE '%maria-garcia.jpg';