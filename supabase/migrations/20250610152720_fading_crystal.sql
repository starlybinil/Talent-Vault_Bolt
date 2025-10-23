/*
  # Create news_articles table for dynamic newsletter system
  
  1. New Tables
    - `news_articles`
      - `article_id` (uuid, primary key)
      - `title` (varchar, required)
      - `description` (text)
      - `content` (text)
      - `publication_date` (timestamptz)
      - `featured_status` (boolean)
      - `external_link` (varchar)
      - `image_url` (varchar)
      - `employer_visibility` (boolean)
      - `category` (enum)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid, references auth.users)

  2. Security
    - Enable RLS
    - Add policies for public read access
    - Add policies for admin write access
    - Add function to check admin status
*/

-- Create news_articles table
CREATE TABLE news_articles (
  article_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  publication_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  featured_status BOOLEAN NOT NULL DEFAULT false,
  external_link VARCHAR(255),
  image_url VARCHAR(255),
  employer_visibility BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT valid_category CHECK (
    category IN ('industry_news', 'training', 'job_market', 'technology')
  )
);

-- Create index for faster queries
CREATE INDEX idx_news_articles_publication_date ON news_articles(publication_date);
CREATE INDEX idx_news_articles_featured_status ON news_articles(featured_status);
CREATE INDEX idx_news_articles_category ON news_articles(category);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_app_meta_data->>'role' = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_news_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_news_articles_updated_at
BEFORE UPDATE ON news_articles
FOR EACH ROW
EXECUTE FUNCTION update_news_articles_updated_at();

-- Enable RLS
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Public can view public articles
CREATE POLICY "Public can view public articles"
ON news_articles
FOR SELECT
TO public
USING (
  NOT employer_visibility
);

-- Authenticated employers can view employer-only articles
CREATE POLICY "Employers can view employer-only articles"
ON news_articles
FOR SELECT
TO authenticated
USING (
  (
    -- Either the article is public
    NOT employer_visibility
    -- Or the user is an employer
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND type = 'employer'
    )
  )
);

-- Admins can perform all operations
CREATE POLICY "Admins can manage all articles"
ON news_articles
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Insert sample articles
INSERT INTO news_articles (
  title,
  description,
  content,
  publication_date,
  featured_status,
  external_link,
  image_url,
  employer_visibility,
  category
) VALUES
(
  'CHIPS Act Funding Accelerates Semiconductor Manufacturing Growth',
  'The CHIPS and Science Act continues to drive unprecedented expansion in US semiconductor manufacturing capacity.',
  'The CHIPS and Science Act, signed into law in 2022, has catalyzed a new era of semiconductor manufacturing in the United States. With over $52.7 billion allocated for semiconductor research, development, and workforce development, the industry is seeing unprecedented growth. Recent reports indicate that more than 40 new semiconductor manufacturing projects have been announced across the country, representing over $200 billion in private investments. These developments are expected to create thousands of high-paying jobs and strengthen America''s position in the global semiconductor supply chain. Industry experts predict that these investments will significantly reduce dependence on foreign chip manufacturing while advancing technological innovation in critical sectors including defense, automotive, and telecommunications.',
  NOW() - INTERVAL '2 days',
  true,
  'https://www.semiconductors.org/chips/',
  'https://images.pexels.com/photos/3912981/pexels-photo-3912981.jpeg',
  false,
  'industry_news'
),
(
  'New Micro-Credential Program Launches for Semiconductor Process Engineers',
  'Industry-recognized certification program aims to address critical skills gap in semiconductor manufacturing.',
  'A new micro-credential program specifically designed for semiconductor process engineers has been launched through a collaboration between leading industry associations and educational institutions. The program offers specialized training in advanced process technologies, equipment operation, and quality control methodologies. Participants can earn credentials in specific areas such as photolithography, etching, deposition, and testing. The program combines online learning with hands-on laboratory experience, making it accessible to both current professionals seeking to upgrade their skills and new entrants to the field. Industry partners have committed to recognizing these credentials in their hiring processes, creating a clear pathway for career advancement in semiconductor manufacturing. The first cohort will begin training next month, with enrollment now open for interested candidates.',
  NOW() - INTERVAL '5 days',
  false,
  'https://www.semi.org/en/workforce-development',
  'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
  false,
  'training'
),
(
  'Semiconductor Industry Salary Survey 2025 Released',
  'Comprehensive analysis reveals significant compensation growth for technical roles in semiconductor manufacturing.',
  'The 2025 Semiconductor Industry Salary Survey has been released, providing detailed insights into compensation trends across the industry. The report indicates substantial salary growth for technical roles, particularly in process integration, equipment engineering, and yield analysis. Entry-level engineers with relevant degrees are commanding starting salaries 15% higher than last year, while experienced professionals with specialized skills in advanced nodes are seeing even greater increases. The survey also highlights regional variations, with particularly strong compensation packages in emerging semiconductor hubs in Arizona, Texas, and New York. Benefits packages are increasingly including education assistance, relocation support, and flexible work arrangements as companies compete for top talent. The report serves as a valuable resource for both job seekers and employers in understanding current market rates and developing competitive compensation strategies.',
  NOW() - INTERVAL '7 days',
  false,
  'https://www.semi.org/en/careers',
  'https://images.pexels.com/photos/7821486/pexels-photo-7821486.jpeg',
  true,
  'job_market'
),
(
  'Breakthrough in 2nm Process Technology Announced',
  'Leading semiconductor manufacturer unveils next-generation process node with significant performance and efficiency improvements.',
  'A major semiconductor manufacturer has announced a breakthrough in 2nm process technology, representing a significant advancement in chip manufacturing capabilities. The new process node promises up to 45% better performance or 75% lower power consumption compared to current 5nm technology. This development will enable the next generation of high-performance computing, mobile devices, and AI applications. The company reports that the new process incorporates innovative materials and transistor architectures, including nanosheet designs and new high-k metal gates. Mass production is expected to begin in late 2025, with initial chips targeting data center and high-performance computing applications. Industry analysts note that this advancement will help maintain the trajectory of Moore''s Law despite increasing technical challenges in semiconductor scaling.',
  NOW() - INTERVAL '10 days',
  true,
  'https://spectrum.ieee.org/',
  'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg',
  false,
  'technology'
),
(
  'Semiconductor Workforce Development Initiative Expands to Five New States',
  'Public-private partnership aims to train 10,000 new semiconductor technicians and engineers by 2027.',
  'The National Semiconductor Workforce Development Initiative has announced its expansion to five additional states, bringing the total to twelve states participating in this comprehensive training program. The initiative, which combines federal funding with industry investments, aims to train 10,000 new semiconductor technicians and engineers by 2027. The program includes specialized curriculum development at community colleges and universities, apprenticeship opportunities, and direct pathways to employment with participating companies. The expansion includes new training centers equipped with industry-standard equipment and clean room facilities. Industry partners are providing both funding and technical expertise, ensuring that training aligns with current manufacturing practices and technologies. This expansion represents a critical step in addressing the projected workforce shortage in the semiconductor industry, which is expected to need over 67,000 new workers by 2030.',
  NOW() - INTERVAL '14 days',
  false,
  'https://www.semiconductors.org/workforce/',
  'https://images.pexels.com/photos/3862130/pexels-photo-3862130.jpeg',
  false,
  'training'
),
(
  'Exclusive Industry Forecast: Semiconductor Market Trends for 2026',
  'Comprehensive analysis of market dynamics, technology trends, and growth opportunities for semiconductor industry stakeholders.',
  'This exclusive industry forecast provides semiconductor employers with a detailed analysis of market trends expected to shape the industry through 2026. The report identifies key growth segments including automotive semiconductors, AI accelerators, and advanced packaging technologies. Regional analysis suggests continued expansion of manufacturing capacity in the United States and Europe, while design activities remain distributed globally. The forecast includes projected demand for specific technical skills, helping employers align their hiring strategies with emerging industry needs. Supply chain considerations, including materials availability and equipment lead times, are also addressed to help companies with strategic planning. This employer-exclusive content is designed to provide actionable intelligence for workforce development and business strategy in the rapidly evolving semiconductor landscape.',
  NOW() - INTERVAL '20 days',
  false,
  'https://www.mckinsey.com/industries/semiconductors/our-insights',
  'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg',
  true,
  'industry_news'
);

-- Add comment explaining the table
COMMENT ON TABLE news_articles IS 'Stores news articles for the semiconductor workforce development newsletter';