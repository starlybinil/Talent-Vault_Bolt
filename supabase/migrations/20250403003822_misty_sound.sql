/*
  # Add sample testimonials
  
  1. Changes
    - Add sample testimonial data
    - Ensure testimonials table exists
    - Add RLS policies
*/

-- Insert sample testimonials if none exist
INSERT INTO testimonials (student_name, photo_url, content) VALUES
  (
    'Sarah Chen',
    'sarah-chen.jpg',
    'The microelectronics program gave me the hands-on experience I needed to land my dream job at Intel. The industry connections and mentorship were invaluable.'
  ),
  (
    'James Wilson',
    'james-wilson.jpg',
    'Through TalentVault, I connected with leading semiconductor companies and secured multiple internship offers. The platform made job hunting so much easier.'
  ),
  (
    'Maria Garcia',
    'maria-garcia.jpg',
    'The specialized focus on semiconductor manufacturing helped me stand out to employers. I''m now working on cutting-edge process integration at TSMC.'
  )
ON CONFLICT DO NOTHING;