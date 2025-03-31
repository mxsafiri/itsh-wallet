import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://itsh-wallet-2kwkxrggz-vmuhagachi-gmailcoms-projects.vercel.app/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nedapay_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear local storage and reload page
      localStorage.removeItem('nedapay_user');
      localStorage.removeItem('nedapay_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Wallet API
export const walletAPI = {
  // Get user balance
  getBalance: async (userId) => {
    return api.get(`/api/wallet/balance/${userId}`);
  },
  
  // Generate QR code for receiving payments
  generateQRCode: async (userId) => {
    return api.get(`/api/wallet/qrcode/${userId}`);
  },
  
  // Generate payment URI
  generatePayment: async (amount, recipientId, memo = '') => {
    return api.post('/api/wallet/generate-payment', {
      amount,
      recipientId,
      memo
    });
  },
  
  // Get reserve statistics
  getReserveStats: async () => {
    return api.get('/api/wallet/reserve');
  }
};

// Transaction API
export const transactionAPI = {
  // Get user transactions
  getTransactions: async (userId) => {
    return api.get(`/api/transactions/${userId}`);
  },
  
  // Send payment
  sendPayment: async (senderId, recipientId, amount, memo = '') => {
    return api.post('/api/transactions/send', {
      senderId,
      recipientId,
      amount,
      memo
    });
  },
  
  // Log transaction (for web demo)
  logTransaction: async (transaction) => {
    return api.post('/api/transactions/log', transaction);
  }
};

// User API
export const userAPI = {
  // Find user by phone number
  findUserByPhone: async (phoneNumber) => {
    return api.get(`/api/auth/user/${phoneNumber}`);
  }
};

export default api;
