/**
 * Network Error Handler Utility
 * Handles common network errors and provides user-friendly messages
 */

export interface NetworkError {
  message: string;
  code?: string;
  status?: number;
  retry?: boolean;
}

/**
 * Parse and handle network errors
 */
export const handleNetworkError = (error: any): NetworkError => {
  // Network connection errors
  if (error.message === 'Failed to fetch' || error.message === 'Network request failed') {
    return {
      message: 'Unable to connect to the server. Please check your internet connection.',
      code: 'NETWORK_ERROR',
      retry: true,
    };
  }

  // Timeout errors
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return {
      message: 'Request timed out. Please try again.',
      code: 'TIMEOUT_ERROR',
      retry: true,
    };
  }

  // Supabase specific errors
  if (error.code === 'PGRST301') {
    return {
      message: 'Database connection error. Please try again later.',
      code: 'DB_CONNECTION_ERROR',
      retry: true,
    };
  }

  // Authentication errors
  if (error.status === 401 || error.code === 'PGRST301') {
    return {
      message: 'Session expired. Please log in again.',
      code: 'AUTH_ERROR',
      retry: false,
    };
  }

  // Rate limiting
  if (error.status === 429) {
    return {
      message: 'Too many requests. Please wait a moment and try again.',
      code: 'RATE_LIMIT_ERROR',
      retry: true,
    };
  }

  // Server errors
  if (error.status >= 500) {
    return {
      message: 'Server error. Our team has been notified. Please try again later.',
      code: 'SERVER_ERROR',
      status: error.status,
      retry: true,
    };
  }

  // Client errors
  if (error.status >= 400 && error.status < 500) {
    return {
      message: error.message || 'Invalid request. Please check your input.',
      code: 'CLIENT_ERROR',
      status: error.status,
      retry: false,
    };
  }

  // Generic error
  return {
    message: error.message || 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
    retry: true,
  };
};

/**
 * Retry logic with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const networkError = handleNetworkError(error);
      
      // Don't retry if error is not retryable
      if (!networkError.retry || i === maxRetries - 1) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = initialDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Check if user is online
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Wait for network connection
 */
export const waitForConnection = (timeout: number = 30000): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isOnline()) {
      resolve();
      return;
    }

    const timeoutId = setTimeout(() => {
      window.removeEventListener('online', onlineHandler);
      reject(new Error('Connection timeout'));
    }, timeout);

    const onlineHandler = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', onlineHandler);
      resolve();
    };

    window.addEventListener('online', onlineHandler);
  });
};

/**
 * Add network status listeners
 */
export const addNetworkListeners = (
  onOnline?: () => void,
  onOffline?: () => void
) => {
  if (onOnline) {
    window.addEventListener('online', onOnline);
  }
  
  if (onOffline) {
    window.addEventListener('offline', onOffline);
  }

  // Return cleanup function
  return () => {
    if (onOnline) {
      window.removeEventListener('online', onOnline);
    }
    if (onOffline) {
      window.removeEventListener('offline', onOffline);
    }
  };
};

/**
 * Fetch with timeout
 */
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = 10000
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};
