import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      setLoading(true);
      
      // Add a timeout to prevent indefinite loading
      const timeoutId = setTimeout(() => {
        console.log('Auth check timed out - forcing completion');
        setLoading(false);
      }, 5000); // 5 second timeout
      
      try {
        const storedUser = localStorage.getItem('nedapay_user');
        const token = localStorage.getItem('nedapay_token');
        
        if (storedUser && token) {
          const userData = JSON.parse(storedUser);
          
          // Set auth header for API calls
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token is still valid by fetching user data
          try {
            // Use a timeout for the API call
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await api.get(`/api/wallet/balance/${userData.id}`, {
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.data.success) {
              setUser(userData);
            } else {
              // Token expired or invalid, clear storage
              localStorage.removeItem('nedapay_user');
              localStorage.removeItem('nedapay_token');
              delete api.defaults.headers.common['Authorization'];
            }
          } catch (error) {
            console.error('Error verifying auth token:', error);
            // If there's an error, we'll clear the stored data to be safe
            localStorage.removeItem('nedapay_user');
            localStorage.removeItem('nedapay_token');
            delete api.defaults.headers.common['Authorization'];
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Login function
  const login = async (phoneNumber, pin) => {
    setLoading(true);
    try {
      console.log('Attempting login with:', { phoneNumber, pin });
      
      const response = await api.post('/api/auth/login', {
        phoneNumber,
        pin
      });

      console.log('Login response:', response.data);

      if (response.data.success) {
        const userData = {
          id: response.data.user.id,
          phoneNumber: response.data.user.phoneNumber,
          stellarPublicKey: response.data.user.stellarPublicKey
        };

        // Store user data and token
        localStorage.setItem('nedapay_user', JSON.stringify(userData));
        localStorage.setItem('nedapay_token', response.data.token);
        
        // Set auth header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        setUser(userData);
        setError(null);
        return { success: true };
      } else {
        setError(response.data.message || 'Login failed');
        return { 
          success: false, 
          message: response.data.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Network error. Please try again.';
      setError(errorMessage);
      return { 
        success: false, 
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (phoneNumber, pin) => {
    setLoading(true);
    try {
      console.log('Attempting registration with:', { phoneNumber, pin });
      
      const response = await api.post('/api/auth/register', {
        phoneNumber,
        pin
      });

      console.log('Registration response:', response.data);

      if (response.data.success) {
        const userData = {
          id: response.data.user.id,
          phoneNumber: response.data.user.phoneNumber,
          stellarPublicKey: response.data.user.stellarPublicKey
        };

        // Store user data and token
        localStorage.setItem('nedapay_user', JSON.stringify(userData));
        localStorage.setItem('nedapay_token', response.data.token);
        
        // Set auth header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        setUser(userData);
        setError(null);
        return { success: true };
      } else {
        setError(response.data.message || 'Registration failed');
        return { 
          success: false, 
          message: response.data.message || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Network error. Please try again.';
      setError(errorMessage);
      return { 
        success: false, 
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('nedapay_user');
    localStorage.removeItem('nedapay_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
