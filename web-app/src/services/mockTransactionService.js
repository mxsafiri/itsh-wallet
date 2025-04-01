/**
 * Mock Transaction Service
 * 
 * This service simulates Stellar blockchain operations for the NEDApay demo.
 * It provides mock implementations for sending, receiving, and tracking transactions
 * that mimic the behavior of the actual Stellar blockchain integration.
 */

import { v4 as uuidv4 } from 'uuid';

// Mock user data
const mockUsers = {
  '+255744123456': {
    phoneNumber: '+255744123456',
    stellarPublicKey: 'GDZKZPFT6XSGPBIYVDJ5IVLYDJ4GRHKGMCNHPSTVMJ2AAUO3NEFKROLF',
    iTZSAmount: 50000,
    name: 'Demo User',
    recentTransactions: []
  },
  '+255744789012': {
    phoneNumber: '+255744789012',
    stellarPublicKey: 'GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI',
    iTZSAmount: 25000,
    name: 'John Doe',
    recentTransactions: []
  },
  '+255744345678': {
    phoneNumber: '+255744345678',
    stellarPublicKey: 'GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT3YZXCYPAFBJZB',
    iTZSAmount: 15000,
    name: 'Jane Smith',
    recentTransactions: []
  },
  '+255744901234': {
    phoneNumber: '+255744901234',
    stellarPublicKey: 'GA2C5RFPE6GCKMY3US5PAB6UZLKIGSPIUKSLRB6Q7Z5QQKZPJDAVFK2S',
    iTZSAmount: 75000,
    name: 'Robert Johnson',
    recentTransactions: []
  },
  '+255744567890': {
    phoneNumber: '+255744567890',
    stellarPublicKey: 'GD5DJQDDBKGAYNEAXU562HYGOOSYAEOO6AS53PZXBOZGCP5M2OPGMZV3',
    iTZSAmount: 32000,
    name: 'Sarah Williams',
    recentTransactions: []
  },
  '+255123456789': {  
    phoneNumber: '+255123456789',
    stellarPublicKey: 'MOCK_PUBLIC_KEY_255123456789',
    iTZSAmount: 50000,
    name: 'Demo User',
    recentTransactions: []
  }
};

// List of common transaction types
const transactionTypes = ['Payment', 'Deposit', 'Withdrawal', 'Transfer'];

// List of transaction statuses
const transactionStatuses = ['success', 'pending', 'failed'];

// Generate a random transaction
const generateRandomTransaction = (userId, incoming = Math.random() > 0.5) => {
  const amount = Math.floor(Math.random() * 10000) + 100; // Random amount between 100 and 10100
  const otherUserIds = Object.keys(mockUsers).filter(id => id !== userId);
  const otherUserId = otherUserIds[Math.floor(Math.random() * otherUserIds.length)];
  const otherUser = mockUsers[otherUserId];
  
  return {
    id: uuidv4(),
    amount,
    currency: 'iTZS',
    type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
    status: transactionStatuses[Math.floor(Math.random() * (transactionStatuses.length - 1))], // Mostly success or pending
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)), // Random date within the last 30 days
    incoming,
    counterparty: {
      phoneNumber: otherUser.phoneNumber,
      stellarPublicKey: otherUser.stellarPublicKey,
      name: otherUser.name
    },
    memo: incoming ? `Payment from ${otherUser.name}` : `Payment to ${otherUser.name}`,
    stellarTxHash: `${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`
  };
};

// Generate initial transactions for each user
Object.keys(mockUsers).forEach(userId => {
  const user = mockUsers[userId];
  const numTransactions = Math.floor(Math.random() * 15) + 5; // 5 to 20 transactions
  
  for (let i = 0; i < numTransactions; i++) {
    const incoming = Math.random() > 0.5;
    user.recentTransactions.push(generateRandomTransaction(userId, incoming));
  }
  
  // Sort transactions by timestamp (newest first)
  user.recentTransactions.sort((a, b) => b.timestamp - a.timestamp);
});

// Local storage key for persisting mock data
const STORAGE_KEY = 'nedapay_mock_data';

// Initialize or load mock data from localStorage
const initializeMockData = () => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      
      // Convert string dates back to Date objects
      Object.keys(parsedData).forEach(userId => {
        parsedData[userId].recentTransactions.forEach(tx => {
          tx.timestamp = new Date(tx.timestamp);
        });
      });
      
      return parsedData;
    }
  } catch (error) {
    console.error('Error loading mock data:', error);
  }
  
  // Save initial mock data to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUsers));
  return mockUsers;
};

// Get or initialize mock data
let mockData = initializeMockData();

// Save mock data to localStorage
const saveMockData = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
  } catch (error) {
    console.error('Error saving mock data:', error);
  }
};

/**
 * Get user information by phone number
 * @param {string} phoneNumber - The user's phone number
 * @returns {Object|null} User information or null if not found
 */
const getUserByPhoneNumber = (phoneNumber) => {
  return mockData[phoneNumber] || null;
};

/**
 * Get user information by Stellar public key
 * @param {string} stellarPublicKey - The user's Stellar public key
 * @returns {Object|null} User information or null if not found
 */
const getUserByStellarPublicKey = (stellarPublicKey) => {
  return Object.values(mockData).find(user => user.stellarPublicKey === stellarPublicKey) || null;
};

/**
 * Get recent transactions for a user
 * @param {string} phoneNumber - The user's phone number
 * @param {Object} options - Filter options
 * @returns {Array} List of transactions
 */
const getRecentTransactions = (phoneNumber, options = {}) => {
  const user = mockData[phoneNumber];
  if (!user) return [];
  
  let transactions = [...user.recentTransactions];
  
  // Apply filters
  if (options.type) {
    transactions = transactions.filter(tx => tx.type === options.type);
  }
  
  if (options.status) {
    transactions = transactions.filter(tx => tx.status === options.status);
  }
  
  if (options.incoming !== undefined) {
    transactions = transactions.filter(tx => tx.incoming === options.incoming);
  }
  
  if (options.startDate) {
    transactions = transactions.filter(tx => tx.timestamp >= options.startDate);
  }
  
  if (options.endDate) {
    transactions = transactions.filter(tx => tx.timestamp <= options.endDate);
  }
  
  // Apply sorting
  if (options.sortBy) {
    const sortField = options.sortBy;
    const sortDirection = options.sortDirection === 'asc' ? 1 : -1;
    
    transactions.sort((a, b) => {
      if (a[sortField] < b[sortField]) return -1 * sortDirection;
      if (a[sortField] > b[sortField]) return 1 * sortDirection;
      return 0;
    });
  } else {
    // Default sort by timestamp (newest first)
    transactions.sort((a, b) => b.timestamp - a.timestamp);
  }
  
  // Apply pagination
  if (options.limit) {
    const start = options.offset || 0;
    const end = start + options.limit;
    transactions = transactions.slice(start, end);
  }
  
  return transactions;
};

/**
 * Send iTZS to another user
 * @param {string} senderPhoneNumber - The sender's phone number
 * @param {string} receiverPhoneNumber - The receiver's phone number
 * @param {number} amount - The amount to send
 * @param {string} memo - Optional memo for the transaction
 * @returns {Promise<Object>} Transaction result
 */
async function sendPayment(senderPhoneNumber, receiverPhoneNumber, amount, memo = '') {
  console.log('[MOCK] Sending payment:', { senderPhoneNumber, receiverPhoneNumber, amount, memo });
  
  // Simulate network delay and transaction processing
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));
  
  try {
    // Get sender and receiver data
    const sender = getUserByPhoneNumber(senderPhoneNumber);
    const receiver = getUserByPhoneNumber(receiverPhoneNumber);
    
    if (!sender) {
      throw new Error(`Sender with phone number ${senderPhoneNumber} not found`);
    }
    
    if (!receiver) {
      throw new Error(`Receiver with phone number ${receiverPhoneNumber} not found`);
    }
    
    // Check if sender has enough balance
    if (sender.iTZSAmount < amount) {
      throw new Error('Insufficient funds');
    }
    
    // Generate transaction ID
    const transactionId = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Create transaction objects
    const senderTransaction = {
      id: transactionId,
      type: 'Payment',
      amount: -amount, // Negative for outgoing
      timestamp,
      counterpartyName: receiver.name,
      counterpartyPhoneNumber: receiver.phoneNumber,
      memo: memo || 'Payment sent',
      status: 'Completed',
      incoming: false
    };
    
    const receiverTransaction = {
      id: transactionId,
      type: 'Payment',
      amount: amount, // Positive for incoming
      timestamp,
      counterpartyName: sender.name,
      counterpartyPhoneNumber: sender.phoneNumber,
      memo: memo || 'Payment received',
      status: 'Completed',
      incoming: true
    };
    
    // Update balances
    sender.iTZSAmount -= amount;
    receiver.iTZSAmount += amount;
    
    // Add transactions to history
    sender.recentTransactions.unshift(senderTransaction);
    receiver.recentTransactions.unshift(receiverTransaction);
    
    // Save updated data
    saveMockData();
    
    console.log('[MOCK] Payment successful:', { transactionId, amount });
    
    // Return transaction details
    return {
      success: true,
      transaction: senderTransaction,
      newBalance: sender.iTZSAmount
    };
  } catch (error) {
    console.error('[MOCK] Payment failed:', error.message);
    throw error;
  }
}

/**
 * Request payment from another user
 * @param {string} requesterPhoneNumber - The requester's phone number
 * @param {string} payerPhoneNumber - The payer's phone number
 * @param {number} amount - The amount to request
 * @param {string} memo - Optional memo for the request
 * @returns {Promise<Object>} Request result
 */
const requestPayment = async (requesterPhoneNumber, payerPhoneNumber, amount, memo = '') => {
  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      const requester = mockData[requesterPhoneNumber];
      const payer = mockData[payerPhoneNumber];
      
      if (!requester) {
        return reject({ error: 'Requester not found' });
      }
      
      if (!payer) {
        return reject({ error: 'Payer not found' });
      }
      
      // Create payment request
      const requestId = uuidv4();
      const timestamp = new Date();
      
      const request = {
        id: requestId,
        amount,
        currency: 'iTZS',
        type: 'PaymentRequest',
        status: 'pending',
        timestamp,
        requester: {
          phoneNumber: requester.phoneNumber,
          stellarPublicKey: requester.stellarPublicKey,
          name: requester.name
        },
        payer: {
          phoneNumber: payer.phoneNumber,
          stellarPublicKey: payer.stellarPublicKey,
          name: payer.name
        },
        memo: memo || `Payment request from ${requester.name}`,
        expiresAt: new Date(timestamp.getTime() + 24 * 60 * 60 * 1000) // Expires in 24 hours
      };
      
      // In a real app, we would store this request and notify the payer
      // For the demo, we'll just return the request details
      
      resolve({
        success: true,
        request
      });
    }, 1000); // 1 second delay to simulate network latency
  });
};

/**
 * Get transaction details by ID
 * @param {string} phoneNumber - The user's phone number
 * @param {string} transactionId - The transaction ID
 * @returns {Object|null} Transaction details or null if not found
 */
const getTransactionById = (phoneNumber, transactionId) => {
  const user = mockData[phoneNumber];
  if (!user) return null;
  
  return user.recentTransactions.find(tx => tx.id === transactionId) || null;
};

/**
 * Generate a QR code payment link
 * @param {string} phoneNumber - The recipient's phone number
 * @param {number} amount - The amount to request
 * @param {string} memo - Optional memo for the payment
 * @returns {string} Payment link for QR code
 */
const generatePaymentQRLink = (phoneNumber, amount, memo = '') => {
  const user = mockData[phoneNumber];
  if (!user) return '';
  
  // Create a SEP-0007 compatible payment URI
  // In a real app, this would be properly encoded for Stellar
  return `web+stellar:pay?destination=${user.stellarPublicKey}&amount=${amount}&asset_code=iTZS&memo=${encodeURIComponent(memo)}`;
};

/**
 * Parse a payment QR code
 * @param {string} qrData - The QR code data
 * @returns {Object|null} Payment details or null if invalid
 */
const parsePaymentQR = (qrData) => {
  try {
    // Simple parsing for demo purposes
    // In a real app, this would properly parse SEP-0007 URIs
    if (!qrData.startsWith('web+stellar:pay?')) {
      return null;
    }
    
    const params = new URLSearchParams(qrData.substring('web+stellar:pay?'.length));
    const destination = params.get('destination');
    const amount = parseFloat(params.get('amount') || '0');
    const assetCode = params.get('asset_code');
    const memo = params.get('memo') || '';
    
    if (!destination || !amount || assetCode !== 'iTZS') {
      return null;
    }
    
    const recipient = getUserByStellarPublicKey(destination);
    if (!recipient) {
      return null;
    }
    
    return {
      recipientPhoneNumber: recipient.phoneNumber,
      recipientName: recipient.name,
      stellarPublicKey: destination,
      amount,
      memo: decodeURIComponent(memo)
    };
  } catch (error) {
    console.error('Error parsing QR code:', error);
    return null;
  }
};

// Export the service functions
export default {
  getUserByPhoneNumber,
  getUserByStellarPublicKey,
  getRecentTransactions,
  sendPayment,
  requestPayment,
  getTransactionById,
  generatePaymentQRLink,
  parsePaymentQR,
  
  // For demo purposes, expose some internals
  getMockUsers: () => Object.values(mockData),
  resetMockData: () => {
    mockData = JSON.parse(JSON.stringify(mockUsers));
    saveMockData();
  }
};
