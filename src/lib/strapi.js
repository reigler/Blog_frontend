// Get the Strapi URL from environment variables
const STRAPI_URL = import.meta.env.STRAPI_URL;
const BASE_URL = STRAPI_URL?.replace(/\/$/, '') || '';

export function getStrapiMediaUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
}

export async function fetchAPI(path, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };
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

// Fetch posts WITH the correct Cover field populated
export async function fetchPosts() {
  // Use "Cover" with capital C - matching your schema
  const data = await fetchAPI('/api/blog-posts?populate=Cover');
  if (!data || !data.data) return [];
  return data.data.map(normalizePost);
}

export async function fetchPostBySlug(slug) {
  // Use "Cover" with capital C - matching your schema
  const data = await fetchAPI(`/api/blog-posts?filters[Slug][$eq]=${slug}&populate=Cover`);
  if (!data || !data.data || data.data.length === 0) return null;
  return normalizePost(data.data[0]);
}