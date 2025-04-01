import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTransaction } from '../contexts/TransactionContext';
import { toast } from 'react-toastify';
import mockTransactionService from '../services/mockTransactionService';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiPhone, FiUser, FiDollarSign, FiEdit3, FiCheck,
  FiHome, FiList, FiLock, FiSettings, FiClock, FiRefreshCw
} from 'react-icons/fi';

const SendScreen = () => {
  const { user } = useAuth();
  const { 
    sendPayment, 
    recentRecipients, 
    isLoading: transactionLoading 
  } = useTransaction();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Enter phone, 2: Enter amount, 3: Confirm, 4: Success
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [quickAmounts, setQuickAmounts] = useState([1000, 5000, 10000, 20000]);

  // Format phone number as user types
  const formatPhoneNumber = (input) => {
    // Remove any non-digit characters
    let digits = input.replace(/\D/g, '');
    
    // Ensure it starts with Tanzania country code
    if (!digits.startsWith('255')) {
      // If it starts with 0, replace with 255
      if (digits.startsWith('0')) {
        digits = '255' + digits.substring(1);
      } else {
        // Otherwise just add 255 prefix
        digits = '255' + digits;
      }
    }
    
    return '+' + digits;
  };

  const handleFindRecipient = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Format phone number if needed
      let formattedPhone = formatPhoneNumber(recipientPhone);
      
      // Find user from mock service
      const foundUser = mockTransactionService.getUserByPhoneNumber(formattedPhone);
      
      if (foundUser) {
        setRecipientInfo(foundUser);
        toast.success('Recipient found', { theme: 'dark' });
        setStep(2);
      } else {
        setError('User not found. Please check the phone number and try again.');
        toast.error('User not found', { theme: 'dark' });
      }
    } catch (err) {
      console.error('Error finding recipient:', err);
      setError('Failed to find recipient. Please try again.');
      toast.error('Failed to find recipient', { theme: 'dark' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecipient = (recipient) => {
    setRecipientPhone(recipient.phoneNumber);
    setRecipientInfo(recipient);
    toast.success('Recipient selected', { theme: 'dark' });
    setStep(2);
  };

  const handleAmountSubmit = (e) => {
    e.preventDefault();
    
    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      toast.error('Please enter a valid amount', { theme: 'dark' });
      return;
    }
    
    // Check if user has sufficient balance
    if (numAmount > user.iTZSAmount) {
      setError(`Insufficient balance. You have ${user.iTZSAmount.toLocaleString()} iTZS available.`);
      toast.error('Insufficient balance', { theme: 'dark' });
      return;
    }
    
    toast.success('Amount confirmed', { theme: 'dark' });
    setStep(3);
  };

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
  };

  const handleSendPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const numAmount = parseFloat(amount);
      
      // Use the transaction context to send payment
      const result = await sendPayment(
        recipientInfo.phoneNumber,
        numAmount,
        memo
      );
      
      if (result.success) {
        setTransactionId(result.transaction.id);
        setStep(4);
      } else {
        throw new Error(result.error || 'Transaction failed');
      }
    } catch (err) {
      console.error('Error sending payment:', err);
      setError('Transaction failed. Please try again.');
      toast.error('Transaction failed', { theme: 'dark' });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: { ease: "easeInOut" }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-background pb-16"
    >
      {/* Header */}
      <motion.header 
        className="bg-background-card border-b border-dark-700/30 p-4"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          <motion.button 
            onClick={() => navigate(-1)} 
            className="mr-4 w-10 h-10 flex items-center justify-center rounded-full bg-background-hover"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiArrowLeft className="h-5 w-5 text-text" />
          </motion.button>
          <h1 className="text-xl font-bold text-text">Send Money</h1>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <AnimatePresence mode="wait">
          {/* Step 1: Enter Recipient */}
          {step === 1 && (
            <motion.div 
              key="step1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="h-full"
            >
              <motion.h2 
                variants={itemVariants}
                className="text-xl font-bold mb-4 text-text"
              >
                Enter Recipient
              </motion.h2>
              
              {/* Recent Recipients */}
              {recentRecipients.length > 0 && (
                <motion.div variants={itemVariants} className="mb-6">
                  <h3 className="text-sm text-text-secondary mb-3 flex items-center">
                    <FiClock className="mr-2 h-4 w-4" /> Recent Recipients
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {recentRecipients.map((recipient, index) => (
                      <motion.button
                        key={recipient.phoneNumber}
                        onClick={() => handleSelectRecipient(recipient)}
                        className="card card-hover p-3 flex items-center"
                        variants={itemVariants}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="avatar w-10 h-10 mr-3 flex-shrink-0">
                          {getInitials(recipient.name)}
                        </div>
                        <div className="text-left overflow-hidden">
                          <p className="font-medium truncate text-text">{recipient.name}</p>
                          <div className="flex items-center text-xs text-text-secondary">
                            <FiClock className="mr-1 h-3 w-3" /> {formatDate(recipient.lastTransaction)}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* Phone Number Form */}
              <motion.div variants={itemVariants}>
                <form onSubmit={handleFindRecipient} className="card p-4">
                  <div className="mb-4">
                    <label htmlFor="phoneNumber" className="block text-sm text-text-secondary mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="h-5 w-5 text-text-secondary" />
                      </div>
                      <input
                        type="tel"
                        id="phoneNumber"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        placeholder="+255744123456"
                        className="input pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-text-secondary mt-2">
                      Enter a Tanzanian phone number (format: +255XXXXXXXXX)
                    </p>
                  </div>
                  
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 bg-error/10 text-error rounded-md text-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                  
                  <motion.button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <FiRefreshCw className="animate-spin h-5 w-5 mr-2" />
                        Finding...
                      </div>
                    ) : (
                      'Continue'
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}
          
          {/* Step 2: Enter Amount */}
          {step === 2 && (
            <motion.div 
              key="step2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="h-full"
            >
              <motion.h2 
                variants={itemVariants}
                className="text-xl font-bold mb-4 text-text"
              >
                Enter Amount
              </motion.h2>
              
              {/* Recipient Info */}
              <motion.div 
                variants={itemVariants}
                className="card p-4 mb-4 flex items-center"
              >
                <div className="avatar w-12 h-12 mr-4">
                  {getInitials(recipientInfo.name)}
                </div>
                <div>
                  <p className="font-medium text-text">{recipientInfo.name}</p>
                  <p className="text-sm text-text-secondary">{recipientInfo.phoneNumber}</p>
                </div>
                <motion.button 
                  onClick={() => setStep(1)} 
                  className="ml-auto text-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Change
                </motion.button>
              </motion.div>
              
              {/* Amount Form */}
              <motion.div variants={itemVariants}>
                <form onSubmit={handleAmountSubmit} className="card p-4">
                  <div className="mb-6">
                    <label htmlFor="amount" className="block text-sm text-text-secondary mb-2">
                      Amount (iTZS)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiDollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="input pl-10 text-xl font-bold"
                        required
                      />
                    </div>
                    <p className="text-xs text-text-secondary mt-2 flex justify-between">
                      <span>Available balance:</span> 
                      <span className="text-text font-medium">{user.iTZSAmount.toLocaleString()} iTZS</span>
                    </p>
                  </div>
                  
                  {/* Quick Amounts */}
                  <div className="mb-6">
                    <p className="text-sm text-text-secondary mb-2">Quick Amounts</p>
                    <div className="grid grid-cols-2 gap-2">
                      {quickAmounts.map((quickAmount, index) => (
                        <motion.button
                          key={quickAmount}
                          type="button"
                          onClick={() => handleQuickAmount(quickAmount)}
                          className="bg-background-hover hover:bg-primary/10 p-3 rounded-lg text-center transition-colors"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          variants={itemVariants}
                          transition={{ delay: index * 0.05 }}
                        >
                          {quickAmount.toLocaleString()} iTZS
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Memo Field */}
                  <motion.div className="mb-6" variants={itemVariants}>
                    <label htmlFor="memo" className="block text-sm text-text-secondary mb-2 flex items-center">
                      <FiEdit3 className="mr-2 h-4 w-4" /> Memo (Optional)
                    </label>
                    <input
                      type="text"
                      id="memo"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      placeholder="What's this payment for?"
                      className="input"
                    />
                  </motion.div>
                  
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 bg-error/10 text-error rounded-md text-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                  
                  <div className="flex space-x-3">
                    <motion.button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn btn-secondary flex-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Back
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="btn btn-primary flex-1"
                      disabled={!amount || loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continue
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
          
          {/* Step 3: Confirm Payment */}
          {step === 3 && (
            <motion.div 
              key="step3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="h-full"
            >
              <motion.h2 
                variants={itemVariants}
                className="text-xl font-bold mb-4 text-text"
              >
                Confirm Payment
              </motion.h2>
              
              <motion.div variants={itemVariants} className="card p-5">
                <div className="flex flex-col items-center mb-6">
                  <div className="avatar w-20 h-20 mb-3">
                    {getInitials(recipientInfo.name)}
                  </div>
                  <p className="font-medium text-lg text-text">{recipientInfo.name}</p>
                  <p className="text-sm text-text-secondary">{recipientInfo.phoneNumber}</p>
                </div>
                
                <div className="border-t border-b border-dark-700/30 py-4 my-4">
                  <div className="flex justify-between mb-3">
                    <span className="text-text-secondary">Amount</span>
                    <span className="font-bold text-text">{parseFloat(amount).toLocaleString()} iTZS</span>
                  </div>
                  {memo && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Memo</span>
                      <span className="text-text">{memo}</span>
                    </div>
                  )}
                </div>
                
                <div className="text-center text-sm text-text-secondary mb-6">
                  <p>You are about to send <span className="text-text font-medium">{parseFloat(amount).toLocaleString()} iTZS</span> to <span className="text-text font-medium">{recipientInfo.name}</span>.</p>
                  <p className="mt-1">Please confirm to proceed with this transaction.</p>
                </div>
                
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-error/10 text-error rounded-md text-sm"
                  >
                    {error}
                  </motion.div>
                )}
                
                <div className="flex space-x-3">
                  <motion.button
                    onClick={() => setStep(2)}
                    className="btn btn-secondary flex-1"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    onClick={handleSendPayment}
                    className="btn btn-primary flex-1"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <FiRefreshCw className="animate-spin h-5 w-5 mr-2" />
                        Sending...
                      </div>
                    ) : (
                      'Confirm & Send'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {/* Step 4: Success */}
          {step === 4 && (
            <motion.div 
              key="step4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="h-full flex flex-col items-center justify-center text-center py-6"
            >
              <motion.div 
                className="w-24 h-24 rounded-full bg-success/20 text-success flex items-center justify-center mb-6"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.2
                }}
              >
                <FiCheck className="h-12 w-12" />
              </motion.div>
              
              <motion.h2 
                className="text-2xl font-bold mb-2 text-text"
                variants={itemVariants}
              >
                Payment Successful!
              </motion.h2>
              <motion.p 
                className="text-text-secondary mb-8"
                variants={itemVariants}
              >
                You have successfully sent {parseFloat(amount).toLocaleString()} iTZS to {recipientInfo.name}.
              </motion.p>
              
              <motion.div variants={itemVariants} className="card p-4 w-full mb-8">
                <div className="flex justify-between mb-3">
                  <span className="text-text-secondary">Amount</span>
                  <span className="font-bold text-text">{parseFloat(amount).toLocaleString()} iTZS</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-text-secondary">Recipient</span>
                  <span className="text-text">{recipientInfo.name}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-text-secondary">Phone</span>
                  <span className="text-text">{recipientInfo.phoneNumber}</span>
                </div>
                {memo && (
                  <div className="flex justify-between mb-3">
                    <span className="text-text-secondary">Memo</span>
                    <span className="text-text">{memo}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-dark-700/30">
                  <span className="text-text-secondary">Transaction ID</span>
                  <span className="text-xs text-text-secondary">{transactionId}</span>
                </div>
              </motion.div>
              
              <div className="flex space-x-3 w-full">
                <motion.button
                  onClick={() => navigate('/transactions')}
                  className="btn btn-secondary flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  variants={itemVariants}
                >
                  View History
                </motion.button>
                <motion.button
                  onClick={() => {
                    setStep(1);
                    setRecipientPhone('');
                    setRecipientInfo(null);
                    setAmount('');
                    setMemo('');
                    setError('');
                  }}
                  className="btn btn-primary flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  variants={itemVariants}
                >
                  New Payment
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <motion.nav 
        className="fixed bottom-0 left-0 right-0 bg-background-card border-t border-dark-700/30 px-4 py-2 z-20"
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="flex justify-around">
          <Link to="/home" className="nav-item">
            <FiHome className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          
          <Link to="/transactions" className="nav-item">
            <FiList className="h-5 w-5" />
            <span className="text-xs mt-1">History</span>
          </Link>
          
          <Link to="/security" className="nav-item">
            <FiLock className="h-5 w-5" />
            <span className="text-xs mt-1">Security</span>
          </Link>
          
          <Link to="/settings" className="nav-item">
            <FiSettings className="h-5 w-5" />
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </div>
      </motion.nav>
    </motion.div>
  );
};

export default SendScreen;
