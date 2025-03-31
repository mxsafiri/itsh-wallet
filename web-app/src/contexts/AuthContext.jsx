import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      try {
        const storedUser = localStorage.getItem('nedapay_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Verify token is still valid by fetching user data
          const response = await api.get(`/api/wallet/balance/${userData.id}`);
          if (response.data.success) {
            setUser(userData);
          } else {
            // Token expired or invalid, clear storage
            localStorage.removeItem('nedapay_user');
            localStorage.removeItem('nedapay_token');
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        // Clear storage on error
        localStorage.removeItem('nedapay_user');
        localStorage.removeItem('nedapay_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (phoneNumber, pin) => {
    try {
      const response = await api.post('/api/auth/login', {
        phone: phoneNumber,
        pin
      });

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
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.data.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Network error. Please try again.' 
      };
    }
  };

  // Register function
  const register = async (phoneNumber, pin) => {
    try {
      const response = await api.post('/api/auth/register', {
        phone: phoneNumber,
        pin
      });

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
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.data.message || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Network error. Please try again.' 
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('nedapay_user');
    localStorage.removeItem('nedapay_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Verify OTP (for phone verification)
  const verifyOTP = async (phoneNumber, otp) => {
    try {
      const response = await api.post('/api/auth/verify-otp', {
        phone: phoneNumber,
        otp
      });

      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'OTP verification failed. Please try again.' 
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    verifyOTP
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
