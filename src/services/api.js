import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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
  getBalance: async (phoneNumber) => {
    console.log(`[API] Getting balance for phone number: ${phoneNumber}`);
    return api.get(`/wallet/balance/${phoneNumber}`);
  },
  
  // Generate QR code for receiving payments
  generateQRCode: async (phoneNumber) => {
    console.log(`[API] Generating QR code for phone number: ${phoneNumber}`);
    return api.get(`/wallet/qrcode/${phoneNumber}`);
  },
  
  // Generate payment URI
  generatePayment: async (amount, recipientPhone, memo = '') => {
    console.log(`[API] Generating payment: ${amount} iTZS to ${recipientPhone}`);
    return api.post('/wallet/generate-payment', {
      amount,
      recipientPhone,
      memo
    });
  },
  
  // Get reserve statistics
  getReserveStats: async () => {
    console.log(`[API] Getting reserve stats`);
    return api.get('/wallet/reserve-stats');
  },
  
  // Deposit funds (for demo)
  deposit: async (phoneNumber, amount) => {
    console.log(`[API] Depositing ${amount} iTZS to ${phoneNumber}`);
    return api.post('/wallet/deposit', {
      phoneNumber,
      amount
    });
  }
};

// Transaction API
export const transactionAPI = {
  // Get user transactions
  getTransactions: async (phoneNumber) => {
    console.log(`[API] Getting transactions for phone number: ${phoneNumber}`);
    return api.get(`/transactions/${phoneNumber}`);
  },
  
  // Send payment
  sendPayment: async (senderPhone, recipientPhone, amount, memo = '') => {
    console.log(`[API] Sending payment: ${amount} iTZS from ${senderPhone} to ${recipientPhone}`);
    return api.post('/transactions/send', {
      senderPhone,
      recipientPhone,
      amount,
      memo
    });
  },
  
  // Log transaction (for web demo)
  logTransaction: async (transaction) => {
    console.log(`[API] Logging transaction`);
    return api.post('/wallet/log-transaction', transaction);
  }
};

// User API
export const userAPI = {
  // Find user by phone number
  findUserByPhone: async (phoneNumber) => {
    console.log(`[API] Finding user with phone number: ${phoneNumber}`);
    return api.get(`/auth/user/${phoneNumber}`);
  }
};

export default api;
