import axios from 'axios';

// Base URL for the API
const API_URL = 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  auth: authAPI,
  wallet: walletAPI,
  transaction: transactionAPI,
};
