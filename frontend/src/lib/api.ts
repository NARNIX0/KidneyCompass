/**
 * Central API utility for making HTTP requests
 * Handles authentication headers and error responses consistently
 */

// Base API URL - should be configurable via environment
export const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081/api';

/**
 * Get the stored authentication token from localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Set the authentication token in localStorage
 */
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

/**
 * Remove the authentication token from localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

/**
 * Check if the user is authenticated (has a token)
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Generic fetch wrapper for API calls
 * - Automatically adds auth header if token exists
 * - Handles common error responses
 * - Parses JSON response
 */
export const fetchApi = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  // Get the token
  const token = getToken();
  
  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  // Add auth header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Make the request
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  // Check if the response is successful
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }
  
  // Check if response has content
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return null as T;
};

/**
 * Upload CSV data for bulk processing
 * @param rows Array of parsed patient data objects
 * @returns Results of the CSV processing operation
 */
export const uploadCsv = async (rows: any[]): Promise<{
  successes: string[],
  failures: { row: number, reason: string }[]
}> => {
  try {
    // Log request for debugging
    console.log('Sending CSV data to API:', rows.length, 'rows');
    
    const result = await fetchApi('/csv', {
      method: 'POST',
      body: JSON.stringify({ rows })
    });
    
    // If we get here, request was successful
    console.log('CSV upload successful, results:', result);
    return result;
  } catch (error) {
    // Log detailed error for debugging
    console.error('CSV upload failed:', error);
    
    // Re-throw with more descriptive message
    if (error instanceof Error) {
      throw new Error(`CSV Upload Error: ${error.message}`);
    }
    throw new Error('CSV Upload Error: Unknown error');
  }
}; 