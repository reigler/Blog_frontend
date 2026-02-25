// Get the Strapi URL from environment variables
const STRAPI_URL = import.meta.env.STRAPI_URL;
const BASE_URL = STRAPI_URL?.replace(/\/$/, '') || '';

// Extract the base domain to construct media URL
// If STRAPI_URL is https://supreme-bubble-4e928774d0.strapiapp.com
// Then MEDIA_URL becomes https://supreme-bubble-4e928774d0.media.strapiapp.com
const MEDIA_URL = BASE_URL.replace('.strapiapp.com', '.media.strapiapp.com');

// Helper for media URLs
export function getStrapiMediaUrl(path) {
  if (!path) return null;
  
  // If it's already a full URL, return it as is
  if (path.startsWith('http')) return path;
  
  // If it starts with /uploads, use the media URL
  if (path.startsWith('/uploads')) {
    return `${MEDIA_URL}${path}`;
  }
  
  // Otherwise, assume it's a filename and construct the full path
  return `${MEDIA_URL}/uploads${path.startsWith('/') ? path : '/' + path}`;
}

// Core API fetch function
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

// Normalize post data
function normalizePost(post) {
  if (post.attributes) {
    return {
      id: post.id,
      ...post.attributes
    };
  }
  return post;
}

// Export these two functions - ONCE each!
export async function fetchPosts() {
  const data = await fetchAPI('/api/blog-posts?populate=Cover');
  if (!data || !data.data) return [];
  return data.data.map(normalizePost);
}

export async function fetchPostBySlug(slug) {
  const data = await fetchAPI(`/api/blog-posts?filters[Slug][$eq]=${slug}&populate=Cover`);
  if (!data || !data.data || data.data.length === 0) return null;
  return normalizePost(data.data[0]);
}