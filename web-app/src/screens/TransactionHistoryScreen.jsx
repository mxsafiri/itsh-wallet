import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { transactionAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiRefreshCw, FiArrowDown, FiArrowUp, FiAlertCircle, FiFileText, FiInfo } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.05
    }
  },
  exit: { 
    opacity: 0,
    transition: { when: "afterChildren" }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
  exit: { y: -20, opacity: 0 }
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

const TransactionHistoryScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, sent, received
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await transactionAPI.getTransactions(user.id);
      
      if (response.data.success) {
        setTransactions(response.data.transactions || []);
      } else {
        setError(response.data.message || 'Failed to load transactions');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    toast.info('Refreshing transactions...');
    fetchTransactions();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    
    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;
    
    return formatDate(dateString);
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  const groupTransactionsByDate = (transactions) => {
    const grouped = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.timestamp || transaction.date || new Date());
      const dateKey = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(transaction);
    });
    
    return grouped;
  };

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  const handleTransactionClick = (transaction) => {
    navigate(`/transaction/${transaction.id}`, { state: { transaction } });
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-gray-900 text-gray-100 pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Toast Container */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      {/* Header */}
      <motion.header 
        className="p-4 border-b border-gray-800 bg-gray-900"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center">
          <motion.button 
            onClick={() => navigate('/home')} 
            className="mr-3 p-2 rounded-full bg-gray-800 text-gray-200 hover:bg-gray-700"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiArrowLeft className="h-5 w-5" />
          </motion.button>
          <h1 className="text-xl font-bold">Transaction History</h1>
          
          <motion.button 
            onClick={handleRefresh}
            className="ml-auto p-2 rounded-full bg-gray-800 text-gray-200 hover:bg-gray-700"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={refreshing}
          >
            <FiRefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </motion.header>

      {/* Filter Tabs */}
      <motion.div 
        className="bg-gray-800 border-b border-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex">
          <motion.button
            onClick={() => setFilter('all')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              filter === 'all' 
                ? 'text-blue-400' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
            whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              All
              {filter === 'all' && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 mx-auto w-1/2"
                  layoutId="filterIndicator"
                />
              )}
            </div>
          </motion.button>
          <motion.button
            onClick={() => setFilter('received')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              filter === 'received' 
                ? 'text-blue-400' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
            whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              Received
              {filter === 'received' && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 mx-auto w-1/2"
                  layoutId="filterIndicator"
                />
              )}
            </div>
          </motion.button>
          <motion.button
            onClick={() => setFilter('sent')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              filter === 'sent' 
                ? 'text-blue-400' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
            whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              Sent
              {filter === 'sent' && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 mx-auto w-1/2"
                  layoutId="filterIndicator"
                />
              )}
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Transaction List */}
      <div className="flex-1 p-4">
        <AnimatePresence mode="wait">
          {loading && !refreshing ? (
            <motion.div 
              key="loading"
              className="flex justify-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-700 rounded-full"></div>
                <motion.div 
                  className="absolute top-0 left-0 w-12 h-12 border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                ></motion.div>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-red-900/20 border border-red-800 text-red-400 p-4 rounded-xl"
            >
              <motion.div variants={itemVariants} className="flex items-center">
                <FiAlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </motion.div>
              <motion.button 
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleRefresh}
                className="w-full mt-3 p-3 bg-red-800/30 hover:bg-red-800/50 rounded-lg text-red-300 font-medium transition-colors"
              >
                Try Again
              </motion.button>
            </motion.div>
          ) : filteredTransactions.length === 0 ? (
            <motion.div 
              key="empty"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-gray-800 border border-gray-700 p-8 rounded-xl text-center"
            >
              <motion.div 
                variants={itemVariants}
                className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <FiFileText className="h-8 w-8 text-gray-400" />
              </motion.div>
              <motion.p variants={itemVariants} className="text-gray-400 mb-4">
                No transactions found
              </motion.p>
              <motion.button 
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setFilter('all')}
                className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 font-medium transition-colors"
              >
                Show All Transactions
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              key="transactions"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              {Object.entries(groupedTransactions).map(([date, transactions]) => (
                <motion.div key={date} variants={itemVariants}>
                  <h3 className="text-sm font-medium text-gray-400 mb-2 ml-1">{date}</h3>
                  <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                    {transactions.map((transaction, index) => (
                      <motion.div 
                        key={transaction.id || index}
                        variants={itemVariants}
                        whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.8)' }}
                        className={`p-4 ${index !== transactions.length - 1 ? 'border-b border-gray-700' : ''} cursor-pointer transition-colors`}
                        onClick={() => handleTransactionClick(transaction)}
                      >
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                            transaction.type === 'received' 
                              ? 'bg-green-900/30 text-green-400' 
                              : 'bg-red-900/30 text-red-400'
                          }`}>
                            {transaction.type === 'received' ? (
                              <FiArrowDown className="h-5 w-5" />
                            ) : (
                              <FiArrowUp className="h-5 w-5" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <p className="font-medium">{transaction.description || (transaction.type === 'received' ? 'Received' : 'Sent')}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <span>{formatRelativeTime(transaction.timestamp || transaction.date || new Date())}</span>
                              {transaction.transactionId && (
                                <>
                                  <span className="mx-1">•</span>
                                  <span className="font-mono text-xs truncate">{transaction.transactionId.substring(0, 10)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className={`font-semibold ${
                            transaction.type === 'received' 
                              ? 'text-green-400' 
                              : 'text-red-400'
                          }`}>
                            {transaction.type === 'received' ? '+' : '-'}{transaction.amount.toLocaleString()} iTZS
                          </div>
                        </div>
                        
                        {transaction.memo && (
                          <div className="mt-2 ml-14">
                            <p className="text-sm text-gray-500 flex items-center">
                              <FiInfo className="mr-1 h-3 w-3" /> 
                              {transaction.memo}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TransactionHistoryScreen;
