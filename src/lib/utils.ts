/**
 * Formats a date string into a human-readable format
 * @param dateString ISO date string
 * @returns Formatted date string (e.g., "January 15, 2025")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Calculates estimated reading time for text content
 * @param content Text content
 * @param wordsPerMinute Reading speed (default: 200 words per minute)
 * @returns Reading time string (e.g., "5 min read")
 */
export function calculateReadTime(content: string, wordsPerMinute: number = 200): string {
  if (!content) return '1 min read';
  
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
  
  return `${minutes} min read`;
}

/**
 * Truncates text to a specified length and adds ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Converts a category slug to a display name
 * @param category Category slug
 * @returns Human-readable category name
 */
export function getCategoryName(category: string): string {
  // Handle common categories with specific formatting
  switch (category) {
    case 'industry_news': return 'Industry Insights';
    case 'training': return 'Learning & Development';
    case 'job_market': return 'Career Trends';
    case 'technology': return 'Tech Innovations';
    default: return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

/**
 * Generates a random placeholder image URL
 * @param seed Seed for the image
 * @param width Image width
 * @param height Image height
 * @returns Placeholder image URL
 */
export function getPlaceholderImage(seed: string, width: number = 800, height: number = 600): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}