import axios from 'axios';
import Constants from 'expo-constants';

// Determine the API URL based on environment
const getApiUrl = () => {
  // For Expo Go development
  if (__DEV__) {
    return 'http://localhost:3000/api';
  }
  
  // For production or preview deployments
  return Constants.manifest?.extra?.apiUrl || 'https://your-vercel-deployment-url.vercel.app/api';
};

// Base URL for the API
const API_URL = getApiUrl();

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
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
      const response = await api.get(`/wallet/log-transaction/${transactionId}?tx_hash=${txHash}`);
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
      const response = await api.get('/wallet/reserve');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Transaction API
export const transactionAPI = {
  // Send iTZS to another user
  sendPayment: async (senderId, recipientPhone, amount) => {
    try {
      const response = await api.post('/transactions/send', {
        senderId,
        recipientPhone,
        amount,
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
      const response = await api.get(`/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default {
  api,
  auth: authAPI,
  wallet: walletAPI,
  transaction: transactionAPI,
};
