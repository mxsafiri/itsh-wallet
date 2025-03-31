import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Determine the API URL based on environment
let API_URL;

if (Platform.OS === 'web') {
  // For web deployment, use the environment variable or fallback to the production URL
  API_URL = process.env.API_URL || 'https://itsh-wallet.vercel.app/api';
  console.log('Web API URL:', API_URL);
} else {
  // For Expo Go development
  if (__DEV__) {
    API_URL = 'http://localhost:3001/api';
  }
  // For production or preview deployments
  else {
    API_URL = Constants.manifest?.extra?.apiUrl || 'https://itsh-wallet.vercel.app/api';
  }
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error accessing secure storage:', error);
    }
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  // Login with phone number and PIN
  login: async (phoneNumber, pin) => {
    try {
      const response = await api.post('/auth/login', { phoneNumber, pin });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Register a new user
  register: async (phoneNumber, pin) => {
    try {
      const response = await api.post('/auth/register', { phoneNumber, pin });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Wallet API
export const walletAPI = {
  // Get user's balance
  getBalance: async (userId) => {
    try {
      const response = await api.get(`/wallet/balance/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Get QR code for receiving payments
  getQRCode: async (userId) => {
    try {
      const response = await api.get(`/wallet/qrcode/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Generate SEP-0007 payment URI
  generatePayment: async (senderId, recipientId, amount, memo) => {
    try {
      const response = await api.post('/wallet/generate-payment', {
        senderId,
        recipientId,
        amount,
        memo
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Log transaction completion (called after user completes payment in wallet)
  logTransaction: async (transactionId, txHash) => {
    try {
      const response = await api.post('/wallet/log-transaction', {
        transactionId,
        txHash
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Find user by phone number
  findUserByPhone: async (phoneNumber) => {
    try {
      const response = await api.get(`/users/lookup?phoneNumber=${encodeURIComponent(phoneNumber)}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Mock deposit function (for MVP demo)
  deposit: async (userId, amount) => {
    try {
      const response = await api.post('/wallet/deposit', { userId, amount });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Get reserve statistics
  getReserveStats: async () => {
    try {
      const response = await api.get('/wallet/reserve-stats');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

// Transaction API
export const transactionAPI = {
  // Send iTZS to another user
  sendPayment: async (senderId, recipientPhone, amount, memo = '') => {
    try {
      const response = await api.post('/transactions/send', {
        senderId,
        recipientPhone,
        amount,
        memo
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Get transaction history
  getHistory: async (userId, limit = 10) => {
    try {
      const response = await api.get(`/transactions/history/${userId}?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Get transaction details
  getTransactionDetails: async (transactionId) => {
    try {
      const response = await api.get(`/transactions/details/${transactionId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

export default {
  api,
  auth: authAPI,
  wallet: walletAPI,
  transaction: transactionAPI
};
