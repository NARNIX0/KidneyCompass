import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchApi, setToken, removeToken } from '../lib/api';

// Types
interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user and token from localStorage on initial render
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const data = await fetchApi<{ token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      // Store token both in state and localStorage
      setTokenState(data.token);
      setToken(data.token);
      
      // Get user data
      const userData = await fetchApi<{ user: User }>('/auth/me');
      
      // Store user in localStorage and state
      localStorage.setItem('user', JSON.stringify(userData.user));
      setUser(userData.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register function
  const register = async (email: string, password: string) => {
    try {
      await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // After successful registration, login the user
      await login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    // Remove user and token from localStorage
    removeToken();
    localStorage.removeItem('user');
    
    // Update state
    setTokenState(null);
    setUser(null);
  };

  // Create value object for the context
  const value = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 