import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug function to log authentication state
  const logAuthState = (message) => {
    console.log(`[AUTH DEBUG] ${message}`, {
      user,
      isAuthenticated: !!user,
      hasToken: !!localStorage.getItem('nedapay_token'),
      timestamp: new Date().toISOString()
    });
  };

  useEffect(() => {
    // BYPASS AUTHENTICATION FOR DEVELOPMENT
    const bypassAuth = async () => {
      console.log('[AUTH] DEVELOPMENT MODE: Bypassing authentication checks');
      
      // Create a mock user
      const mockUser = {
        phoneNumber: '+255123456789',
        stellarPublicKey: 'MOCK_PUBLIC_KEY_255123456789',
        iTZSAmount: 50000
      };
      
      // Store mock user data
      localStorage.setItem('nedapay_user', JSON.stringify(mockUser));
      localStorage.setItem('nedapay_token', 'mock-jwt-token-for-development');
      
      // Set auth header for API calls
      api.defaults.headers.common['Authorization'] = 'Bearer mock-jwt-token-for-development';
      
      // Set user state
      setUser(mockUser);
      setLoading(false);
      
      console.log('[AUTH] Mock user automatically logged in:', mockUser);
      logAuthState('Development mode: Auto-login successful');
    };
    
    // Call the bypass function
    bypassAuth();
    
    // Original authentication check code (commented out for now)
    /*
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      setLoading(true);
      console.log('[AUTH] Checking authentication status...');
      
      // Add a timeout to prevent indefinite loading
      const timeoutId = setTimeout(() => {
        console.log('[AUTH] Auth check timed out - forcing completion');
        setLoading(false);
      }, 5000); // 5 second timeout
      
      try {
        const storedUser = localStorage.getItem('nedapay_user');
        const token = localStorage.getItem('nedapay_token');
        
        console.log('[AUTH] Local storage check:', { 
          hasStoredUser: !!storedUser, 
          hasToken: !!token 
        });
        
        if (storedUser && token) {
          const userData = JSON.parse(storedUser);
          console.log('[AUTH] Found stored user:', userData);
          
          // Set auth header for API calls
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token is still valid by fetching user data
          try {
            // Use a timeout for the API call
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            console.log(`[AUTH] Verifying token by fetching balance for phone number: ${userData.phoneNumber}`);
            const response = await api.get(`/api/wallet/balance/${userData.phoneNumber}`, {
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            console.log('[AUTH] Balance API response:', response.data);
            
            if (response.data.success) {
              console.log('[AUTH] Token verified successfully, setting user state');
              setUser(userData);
              logAuthState('Authentication successful');
            } else {
              console.log('[AUTH] Token verification failed, clearing storage');
              // Token expired or invalid, clear storage
              localStorage.removeItem('nedapay_user');
              localStorage.removeItem('nedapay_token');
              delete api.defaults.headers.common['Authorization'];
            }
          } catch (error) {
            console.error('[AUTH] Error verifying auth token:', error);
            // If there's an error, we'll clear the stored data to be safe
            localStorage.removeItem('nedapay_user');
            localStorage.removeItem('nedapay_token');
            delete api.defaults.headers.common['Authorization'];
          }
        } else {
          console.log('[AUTH] No stored user or token found');
        }
      } catch (error) {
        console.error('[AUTH] Error checking auth status:', error);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
        console.log('[AUTH] Auth check completed, loading set to false');
      }
    };
    
    checkAuthStatus();
    */
  }, []);

  // Login function
  const login = async (phoneNumber, pin) => {
    setLoading(true);
    try {
      console.log('[AUTH] DEVELOPMENT MODE: Auto-login with:', { phoneNumber });
      
      // Create a mock user response
      const mockUser = {
        phoneNumber: phoneNumber,
        stellarPublicKey: `MOCK_PUBLIC_KEY_${phoneNumber.replace('+', '')}`,
        iTZSAmount: 50000
      };
      
      // Store mock user data
      localStorage.setItem('nedapay_user', JSON.stringify(mockUser));
      localStorage.setItem('nedapay_token', 'mock-jwt-token-for-development');
      
      // Set auth header for API calls
      api.defaults.headers.common['Authorization'] = 'Bearer mock-jwt-token-for-development';
      
      // Set user state
      setUser(mockUser);
      setError(null);
      
      console.log('[AUTH] Development mode: Login successful with mock user');
      logAuthState('Development mode: Login successful');
      
      return { success: true };
      
      /*
      console.log('[AUTH] Attempting login with:', { phoneNumber });
      
      const response = await api.post('/api/auth/login', {
        phoneNumber,
        pin
      });

      console.log('[AUTH] Login response:', response.data);

      if (response.data.success) {
        const userData = {
          phoneNumber: response.data.user.phoneNumber,
          stellarPublicKey: response.data.user.stellarPublicKey
        };

        console.log('[AUTH] Login successful, storing user data:', userData);

        // Store user data and token
        localStorage.setItem('nedapay_user', JSON.stringify(userData));
        localStorage.setItem('nedapay_token', response.data.token);
        
        // Set auth header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        setUser(userData);
        setError(null);
        logAuthState('Login successful');
        return { success: true };
      } else {
        console.log('[AUTH] Login failed:', response.data.message);
        setError(response.data.message || 'Login failed');
        return { 
          success: false, 
          message: response.data.message || 'Login failed' 
        };
      }
      */
    } catch (error) {
      console.error('[AUTH] Login error:', error);
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
      console.log('[AUTH] DEVELOPMENT MODE: Auto-register with:', { phoneNumber });
      
      // Create a mock user
      const mockUser = {
        phoneNumber: phoneNumber,
        stellarPublicKey: `MOCK_PUBLIC_KEY_${phoneNumber.replace('+', '')}`,
        iTZSAmount: 50000
      };
      
      // Store mock user data
      localStorage.setItem('nedapay_user', JSON.stringify(mockUser));
      localStorage.setItem('nedapay_token', 'mock-jwt-token-for-development');
      
      // Set auth header for API calls
      api.defaults.headers.common['Authorization'] = 'Bearer mock-jwt-token-for-development';
      
      // Set user state
      setUser(mockUser);
      setError(null);
      
      console.log('[AUTH] Development mode: Registration successful with mock user');
      logAuthState('Development mode: Registration successful');
      
      return { success: true };
      
      /*
      console.log('[AUTH] Attempting registration with:', { phoneNumber });
      
      const response = await api.post('/api/auth/register', {
        phoneNumber,
        pin
      });

      console.log('[AUTH] Registration response:', response.data);

      if (response.data.success) {
        const userData = {
          phoneNumber: response.data.user.phoneNumber,
          stellarPublicKey: response.data.user.stellarPublicKey
        };

        console.log('[AUTH] Registration successful, storing user data:', userData);

        // Store user data and token
        localStorage.setItem('nedapay_user', JSON.stringify(userData));
        localStorage.setItem('nedapay_token', response.data.token);
        
        // Set auth header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        setUser(userData);
        setError(null);
        logAuthState('Registration successful');
        return { success: true };
      } else {
        console.log('[AUTH] Registration failed:', response.data.message);
        setError(response.data.message || 'Registration failed');
        return { 
          success: false, 
          message: response.data.message || 'Registration failed' 
        };
      }
      */
    } catch (error) {
      console.error('[AUTH] Registration error:', error);
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
    console.log('[AUTH] Logging out, clearing user data and token');
    localStorage.removeItem('nedapay_user');
    localStorage.removeItem('nedapay_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setError(null);
    logAuthState('Logout completed');
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
