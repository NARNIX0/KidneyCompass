// Base API URL
export const API_URL = 'http://localhost:8081/api';

// Helper function to get the stored auth token
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Generic fetch function that adds auth headers when needed
export const fetchApi = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  // Get the token
  const token = getToken();
  
  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }
  
  // Check if response is empty
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return null;
}; 