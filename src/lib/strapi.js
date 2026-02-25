// Get the Strapi URL from environment variables
// This will be:
// - http://localhost:1337 in development (from your .env file)
// - https://supreme-bubble-4e928774d0.strapiapp.com in production (from Vercel env vars)
const STRAPI_URL = import.meta.env.STRAPI_URL;

// Remove any trailing slashes
const BASE_URL = STRAPI_URL?.replace(/\/$/, '') || '';

export function getStrapiMediaUrl(path) {
  if (!path) return null;
  // If it's already a full URL, return it as is
  if (path.startsWith('http')) return path;
  // Otherwise, prepend the Strapi base URL
  return `${BASE_URL}${path}`;
}

export async function fetchAPI(path, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };
  // Make sure we're using the full URL with /api
  const requestUrl = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  
  try {
    console.log('Fetching from:', requestUrl);
    const response = await fetch(requestUrl, mergedOptions);
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching from Strapi:', error);
    throw error;
  }
}

// Helper to handle both API response formats
export function normalizePost(post) {
  // If the post has an attributes field (Strapi v4 format)
  if (post.attributes) {
    return {
      id: post.id,
      ...post.attributes
    };
  }
  // If it's the direct format (your current API)
  return post;
}

// Update your fetchAPI function or create a new one
export async function fetchPosts() {
  const data = await fetchAPI('/api/blog-posts?populate=cover');
  if (!data || !data.data) return [];
  return data.data.map(normalizePost);
}

export async function fetchPostBySlug(slug) {
  const data = await fetchAPI(`/api/blog-posts?filters[Slug][$eq]=${slug}&populate=cover`);
  if (!data || !data.data || data.data.length === 0) return null;
  return normalizePost(data.data[0]);
}