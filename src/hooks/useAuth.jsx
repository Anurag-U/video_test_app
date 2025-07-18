import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, setAuthToken, getAuthToken, getCurrentUser, setCurrentUser } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      const savedUser = getCurrentUser();

      if (token && savedUser) {
        // First, set the user from localStorage to avoid loading delay
        setUser(savedUser);
        setIsAuthenticated(true);

        try {
          // Then verify token is still valid in the background
          const response = await authAPI.getCurrentUser();
          // Update user data if API call succeeds
          setUser(response.data.user);
        } catch (error) {
          console.warn('Token verification failed:', error.message);
          // Only logout if it's a 401 (unauthorized) error
          if (error.response?.status === 401) {
            logout();
          }
          // For other errors (network issues, etc.), keep the user logged in
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user: userData } = response.data;

      setAuthToken(token);
      setCurrentUser(userData);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user: newUser } = response.data;

      setAuthToken(token);
      setCurrentUser(newUser);
      setUser(newUser);
      setIsAuthenticated(true);

      return { success: true, user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
