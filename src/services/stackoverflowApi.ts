/**
 * Stack Overflow API Service
 * Industry-standard implementation with proper error handling, rate limiting, and type safety
 */

// TypeScript interfaces for Stack Overflow API responses
export interface StackOverflowOwner {
  display_name: string;
  reputation?: number;
  user_id?: number;
  user_type?: string;
  profile_image?: string;
  link?: string;
}

export interface StackOverflowQuestion {
  question_id: number;
  title: string;
  link: string;
  score: number;
  view_count: number;
  answer_count: number;
  is_answered: boolean;
  accepted_answer_id?: number;
  tags: string[];
  owner: StackOverflowOwner;
  creation_date: number;
  last_activity_date: number;
  body?: string;
  closed_date?: number;
  closed_reason?: string;
}

export interface StackOverflowSearchResponse {
  items: StackOverflowQuestion[];
  has_more: boolean;
  quota_max: number;
  quota_remaining: number;
  backoff?: number;
}

export interface StackOverflowError {
  error_id: number;
  error_name: string;
  error_message: string;
}

// API Configuration
const STACK_OVERFLOW_API_BASE = 'https://api.stackexchange.com/2.3';
const STACK_OVERFLOW_SITE = 'stackoverflow';
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

// Rate limiting state
let quotaRemaining: number | null = null;
let backoffUntil: number | null = null;

/**
 * Check if we're currently in a backoff period
 */
const isInBackoff = (): boolean => {
  return backoffUntil !== null && Date.now() < backoffUntil;
};

/**
 * Set backoff period (in seconds)
 */
const setBackoff = (seconds: number): void => {
  backoffUntil = Date.now() + seconds * 1000;
};

/**
 * Build query parameters for Stack Overflow API
 */
const buildQueryParams = (params: Record<string, string | number | boolean>): string => {
  const searchParams = new URLSearchParams();
  
  // Always include site parameter
  searchParams.append('site', STACK_OVERFLOW_SITE);
  
  // Add other parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
};

/**
 * Handle API errors with proper error messages
 */
const handleApiError = (error: any, response?: Response): Error => {
  // Check for backoff
  if (response?.status === 503) {
    const retryAfter = response.headers.get('Retry-After');
    if (retryAfter) {
      const seconds = parseInt(retryAfter, 10);
      setBackoff(seconds);
      return new Error(`Rate limit exceeded. Please try again in ${seconds} seconds.`);
    }
  }
  
  // Check for quota exceeded
  if (response?.status === 400) {
    try {
      // Stack Exchange API returns error details in response
      return new Error('API quota exceeded. Please try again later.');
    } catch {
      // Fall through to generic error
    }
  }
  
  // Network errors
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return new Error('Network error. Please check your internet connection.');
  }
  
  // Generic error
  return new Error(error.message || 'Failed to fetch results from Stack Overflow. Please try again.');
};

/**
 * Validate API response structure
 */
const validateResponse = (data: any): data is StackOverflowSearchResponse => {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  // Check for error response
  if ('error_id' in data || 'error_name' in data) {
    return false;
  }
  
  // Check for valid response structure
  return Array.isArray(data.items);
};

/**
 * Search Stack Overflow questions
 * @param query - Search query string
 * @param options - Search options (page, pageSize, sort, order)
 * @returns Promise with search results
 */
export const searchStackOverflow = async (
  query: string,
  options: {
    page?: number;
    pageSize?: number;
    sort?: 'relevance' | 'activity' | 'votes' | 'creation';
    order?: 'asc' | 'desc';
  } = {}
): Promise<StackOverflowSearchResponse> => {
  // Validate query
  if (!query || !query.trim()) {
    throw new Error('Search query cannot be empty');
  }
  
  // Check backoff
  if (isInBackoff()) {
    const remainingSeconds = Math.ceil((backoffUntil! - Date.now()) / 1000);
    throw new Error(`Rate limited. Please wait ${remainingSeconds} seconds before trying again.`);
  }
  
  // Build parameters
  const {
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    sort = 'relevance',
    order = 'desc',
  } = options;
  
  // Validate page size
  const validPageSize = Math.min(Math.max(1, pageSize), MAX_PAGE_SIZE);
  
  const params = buildQueryParams({
    q: query.trim(),
    page: page.toString(),
    pagesize: validPageSize.toString(),
    order,
    sort,
    filter: 'default', // Use default filter for basic question data
  });
  
  const url = `${STACK_OVERFLOW_API_BASE}/search/advanced?${params}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    // Handle HTTP errors
    if (!response.ok) {
      // Check for backoff header
      const retryAfter = response.headers.get('Retry-After');
      if (retryAfter) {
        const seconds = parseInt(retryAfter, 10);
        setBackoff(seconds);
      }
      
      throw handleApiError(new Error(`HTTP ${response.status}`), response);
    }
    
    const data = await response.json();
    
    // Check for API-level errors
    if ('error_id' in data) {
      const apiError = data as StackOverflowError;
      throw new Error(apiError.error_message || 'Stack Overflow API error');
    }
    
    // Validate response structure
    if (!validateResponse(data)) {
      throw new Error('Invalid response format from Stack Overflow API');
    }
    
    // Update quota tracking
    if (typeof data.quota_remaining === 'number') {
      quotaRemaining = data.quota_remaining;
    }
    
    // Handle backoff from response
    if (data.backoff) {
      setBackoff(data.backoff);
    }
    
    return data as StackOverflowSearchResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw handleApiError(error);
  }
};

/**
 * Get remaining API quota
 */
export const getQuotaRemaining = (): number | null => {
  return quotaRemaining;
};

/**
 * Check if API is available (not in backoff)
 */
export const isApiAvailable = (): boolean => {
  return !isInBackoff();
};

/**
 * Get time until API is available again (in seconds)
 */
export const getBackoffRemaining = (): number | null => {
  if (!backoffUntil) return null;
  const remaining = Math.ceil((backoffUntil - Date.now()) / 1000);
  return remaining > 0 ? remaining : null;
};

