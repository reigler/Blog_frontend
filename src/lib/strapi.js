// Get the Strapi URL from environment variables
const STRAPI_URL = import.meta.env.STRAPI_URL;
const BASE_URL = STRAPI_URL?.replace(/\/$/, '') || '';

// Extract the base domain to construct media URL
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

// Helper to get the best available image URL
export function getImageUrl(cover) {
  if (!cover) return null;
  
  // Try to get large format first, then medium, then small, then original
  if (cover.formats) {
    if (cover.formats.large?.url) return cover.formats.large.url;
    if (cover.formats.medium?.url) return cover.formats.medium.url;
    if (cover.formats.small?.url) return cover.formats.small.url;
  }
  
  // Fall back to original URL
  if (cover.url) return cover.url;
  
  return null;
}

// Normalize category data
function normalizeCategory(category) {
  if (!category) return null;
  
  return {
    id: category.id,
    documentId: category.documentId,
    Name: category.Name || category.attributes?.Name,
    Slug: category.Slug || category.attributes?.Slug,
  };
}

// Normalize post data with categories
function normalizePost(post) {
  // Create a normalized post object
  const normalized = {
    id: post.id,
    documentId: post.documentId,
    Title: post.Title,
    Slug: post.Slug,
    Content: post.Content,
    Description: post.Description,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    publishedAt: post.publishedAt,
    Cover: post.Cover,
  };
  
  // Handle categories - they come directly as an array
  if (post.categories && Array.isArray(post.categories)) {
    normalized.categories = post.categories
      .map(normalizeCategory)
      .filter(cat => cat !== null);
  } else {
    normalized.categories = [];
  }
  
  return normalized;
}

// ===== EXPORTED FUNCTIONS =====

export async function fetchPosts() {
  const data = await fetchAPI('/api/blog-posts?populate=Cover,categories');
  if (!data || !data.data) return [];
  return data.data.map(normalizePost);
}

export async function fetchPostBySlug(slug) {
  // Fix: Use correct filter syntax and populate
  const data = await fetchAPI(`/api/blog-posts?filters[Slug][$eq]=${slug}&populate=Cover,categories`);
  if (!data || !data.data || data.data.length === 0) return null;
  return normalizePost(data.data[0]);
}

export async function fetchCategories() {
  const data = await fetchAPI('/api/categories');
  if (!data || !data.data) return [];
  return data.data.map(normalizeCategory);
}

export async function fetchPostsByCategory(categorySlug) {
  const data = await fetchAPI(`/api/blog-posts?filters[categories][Slug][$eq]=${categorySlug}&populate=Cover,categories`);
  if (!data || !data.data) return [];
  return data.data.map(normalizePost);
}

export async function fetchRelatedPosts(currentPost, limit = 3) {
  if (!currentPost.categories || currentPost.categories.length === 0) {
    return [];
  }
  
  const categoryIds = currentPost.categories.map(c => c.id).join(',');
  
  const data = await fetchAPI(
    `/api/blog-posts?filters[categories][id][$in]=${categoryIds}&filters[id][$ne]=${currentPost.id}&populate=Cover,categories&pagination[limit]=${limit}`
  );
  
  if (!data || !data.data) return [];
  return data.data.map(normalizePost);
}