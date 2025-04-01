import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import mockTransactionService from '../services/mockTransactionService';
import { toast } from 'react-toastify';

// Create the context
const TransactionContext = createContext();

// Custom hook to use the transaction context
export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};

// Transaction provider component
export const TransactionProvider = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [recentRecipients, setRecentRecipients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load transactions when user changes or refresh is triggered
  useEffect(() => {
    if (user?.phoneNumber) {
      console.log('[TRANSACTION] Loading data for user:', user.phoneNumber);
      loadTransactions();
      loadRecentRecipients();
    } else {
      console.log('[TRANSACTION] No user, clearing transaction data');
      setTransactions([]);
      setRecentRecipients([]);
    }
  }, [user, refreshTrigger]);

  // Load transactions from the mock service
  const loadTransactions = async () => {
    if (!user?.phoneNumber) return;
    
    setIsLoading(true);
    try {
      console.log('[TRANSACTION] Getting transactions for:', user.phoneNumber);
      const txs = mockTransactionService.getRecentTransactions(user.phoneNumber);
      console.log('[TRANSACTION] Loaded transactions:', txs);
      setTransactions(txs);
    } catch (error) {
      console.error('[TRANSACTION] Error loading transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  // Load recent recipients based on outgoing transactions
  const loadRecentRecipients = async () => {
    if (!user?.phoneNumber) return;
    
    try {
      const txs = mockTransactionService.getRecentTransactions(user.phoneNumber, {
        incoming: false,
        limit: 20
      });
      
      // Extract unique recipients
      const recipients = txs.reduce((acc, tx) => {
        if (tx.counterparty && !acc.some(r => r.phoneNumber === tx.counterparty.phoneNumber)) {
          acc.push({
            phoneNumber: tx.counterparty.phoneNumber,
            name: tx.counterparty.name,
            lastTransaction: tx.timestamp
          });
        }
        return acc;
      }, []);
      
      // Sort by most recent
      recipients.sort((a, b) => b.lastTransaction - a.lastTransaction);
      
      setRecentRecipients(recipients.slice(0, 5)); // Keep top 5
    } catch (error) {
      console.error('Error loading recent recipients:', error);
    }
  };

  // Send payment
  const sendPayment = async (receiverPhoneNumber, amount, memo = '') => {
    if (!user?.phoneNumber) {
      toast.error('You must be logged in to send payments');
      return { success: false };
    }
    
    setIsLoading(true);
    try {
      const result = await mockTransactionService.sendPayment(
        user.phoneNumber,
        receiverPhoneNumber,
        amount,
        memo
      );
      
      if (result.success) {
        toast.success(`Successfully sent ${amount} iTZS`);
        // Refresh transactions
        setRefreshTrigger(prev => prev + 1);
        return result;
      } else {
        toast.error(result.error || 'Payment failed');
        return { success: false };
      }
    } catch (error) {
      console.error('Error sending payment:', error);
      toast.error(error.error || 'Payment failed');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Request payment
  const requestPayment = async (payerPhoneNumber, amount, memo = '') => {
    if (!user?.phoneNumber) {
      toast.error('You must be logged in to request payments');
      return { success: false };
    }
    
    setIsLoading(true);
    try {
      const result = await mockTransactionService.requestPayment(
        user.phoneNumber,
        payerPhoneNumber,
        amount,
        memo
      );
      
      if (result.success) {
        toast.success(`Payment request for ${amount} iTZS sent`);
        return result;
      } else {
        toast.error(result.error || 'Payment request failed');
        return { success: false };
      }
    } catch (error) {
      console.error('Error requesting payment:', error);
      toast.error(error.error || 'Payment request failed');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Generate QR code for payment
  const generatePaymentQR = (amount, memo = '') => {
    if (!user?.phoneNumber) return '';
    
    return mockTransactionService.generatePaymentQRLink(
      user.phoneNumber,
      amount,
      memo
    );
  };

  // Parse QR code
  const parsePaymentQR = (qrData) => {
    return mockTransactionService.parsePaymentQR(qrData);
  };

  // Get transaction by ID
  const getTransactionById = (transactionId) => {
    if (!user?.phoneNumber) return null;
    
    return mockTransactionService.getTransactionById(
      user.phoneNumber,
      transactionId
    );
  };

  // Filter transactions
  const filterTransactions = (filters = {}) => {
    if (!user?.phoneNumber) return [];
    
    return mockTransactionService.getRecentTransactions(
      user.phoneNumber,
      filters
    );
  };

  // Refresh transactions
  const refreshTransactions = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Context value
  const value = {
    transactions,
    recentRecipients,
    isLoading,
    sendPayment,
    requestPayment,
    generatePaymentQR,
    parsePaymentQR,
    getTransactionById,
    filterTransactions,
    refreshTransactions
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export default TransactionContext;
