import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTransaction } from '../contexts/TransactionContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiDollarSign, FiCheck, FiHome, FiList, 
  FiLock, FiSettings, FiRefreshCw, FiZap, FiWifi, 
  FiPhone, FiTv, FiDroplet, FiCreditCard, FiShoppingBag
} from 'react-icons/fi';

const ServicePaymentScreen = () => {
  const { user } = useAuth();
  const { sendPayment } = useTransaction();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Select service, 2: Enter details, 3: Confirm, 4: Processing, 5: Success
  const [selectedService, setSelectedService] = useState(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  
  // List of available services
  const services = [
    { id: 'electricity', name: 'Electricity', icon: <FiZap />, color: 'green', placeholder: 'Meter Number', prefix: 'TANESCO' },
    { id: 'water', name: 'Water Bill', icon: <FiDroplet />, color: 'green', placeholder: 'Account Number', prefix: 'DAWASA' },
    { id: 'internet', name: 'Internet', icon: <FiWifi />, color: 'green', placeholder: 'Account Number', prefix: 'Various' },
    { id: 'tv', name: 'TV Subscription', icon: <FiTv />, color: 'green', placeholder: 'Subscription ID', prefix: 'Various' },
    { id: 'mobile', name: 'Airtime', icon: <FiPhone />, color: 'green', placeholder: 'Phone Number', prefix: 'Various' },
    { id: 'education', name: 'School Fees', icon: <FiCreditCard />, color: 'green', placeholder: 'Student ID', prefix: 'Various' },
    { id: 'shopping', name: 'Shopping', icon: <FiShoppingBag />, color: 'green', placeholder: 'Reference Number', prefix: 'Various' }
  ];
  
  const handleSelectService = (service) => {
    setSelectedService(service);
    setStep(2);
  };
  
  const handleDetailsSubmit = (e) => {
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
    
    // Validate account number
    if (!accountNumber.trim()) {
      setError('Please enter a valid account number');
      toast.error('Please enter a valid account number', { theme: 'dark' });
      return;
    }
    
    toast.success('Details confirmed', { theme: 'dark' });
    setStep(3);
  };
  
  const handlePayment = () => {
    setStep(4); // Move to processing step
    
    // Simulate processing
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setProcessingProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        
        // Generate a random transaction ID
        const randomId = Math.random().toString(36).substring(2, 10).toUpperCase();
        setTransactionId(`SRV${randomId}`);
        
        setTimeout(() => {
          setStep(5); // Move to success screen
        }, 500);
      }
    }, 800);
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
          <h1 className="text-xl font-bold text-text">Pay for Services</h1>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Service */}
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
                What service would you like to pay for?
              </motion.h2>
              
              <motion.div 
                variants={itemVariants}
                className="grid grid-cols-2 gap-3"
              >
                {services.map((service) => (
                  <motion.button
                    key={service.id}
                    onClick={() => handleSelectService(service)}
                    className="card card-hover p-4 flex flex-col items-center"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    variants={itemVariants}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-green-500/20 text-green-500`}>
                      {service.icon}
                    </div>
                    <span className="text-sm font-medium text-text">{service.name}</span>
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          )}
          
          {/* Step 2: Enter Details */}
          {step === 2 && selectedService && (
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
                {selectedService.name} Payment
              </motion.h2>
              
              <motion.div variants={itemVariants}>
                <form onSubmit={handleDetailsSubmit} className="card p-4">
                  <div className="flex items-center mb-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 bg-green-500/20 text-green-500`}>
                      {selectedService.icon}
                    </div>
                    <div>
                      <p className="font-medium text-text">{selectedService.name}</p>
                      <p className="text-sm text-text-secondary">{selectedService.prefix}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="accountNumber" className="block text-sm text-text-secondary mb-2">
                      {selectedService.placeholder}
                    </label>
                    <input
                      type="text"
                      id="accountNumber"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder={`Enter ${selectedService.placeholder}`}
                      className="input"
                      required
                      autoFocus
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="amount" className="block text-sm text-text-secondary mb-2">
                      Amount (iTZS)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiDollarSign className="h-5 w-5 text-green-500" />
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
                      <span className="text-text font-medium">{user?.iTZSAmount?.toLocaleString() || '50,000'} iTZS</span>
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
                      className="btn btn-green flex-1"
                      disabled={!accountNumber || !amount || loading}
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
          {step === 3 && selectedService && (
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
                <div className="flex items-center mb-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mr-4 bg-green-500/20 text-green-500`}>
                    {selectedService.icon}
                  </div>
                  <div>
                    <p className="font-medium text-lg text-text">{selectedService.name}</p>
                    <p className="text-sm text-text-secondary">{selectedService.prefix}</p>
                  </div>
                </div>
                
                <div className="border-t border-b border-dark-700/30 py-4 my-4">
                  <div className="flex justify-between mb-3">
                    <span className="text-text-secondary">{selectedService.placeholder}</span>
                    <span className="font-medium text-text">{accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Amount</span>
                    <span className="font-bold text-text">{parseFloat(amount).toLocaleString()} iTZS</span>
                  </div>
                </div>
                
                <div className="text-center text-sm text-text-secondary mb-6">
                  <p>You are about to pay <span className="text-text font-medium">{parseFloat(amount).toLocaleString()} iTZS</span> for {selectedService.name} service.</p>
                  <p className="mt-1">Please confirm to proceed with this payment.</p>
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
                    onClick={handlePayment}
                    className="btn btn-green flex-1"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Confirm Payment
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {/* Step 4: Processing */}
          {step === 4 && (
            <motion.div 
              key="step4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="h-full flex flex-col items-center justify-center text-center py-6"
            >
              <motion.h2 
                className="text-xl font-bold mb-6 text-text"
                variants={itemVariants}
              >
                Processing Your Payment
              </motion.h2>
              
              {/* Progress bar */}
              <motion.div 
                className="w-full h-2 bg-background-hover rounded-full mb-8 overflow-hidden"
                variants={itemVariants}
              >
                <motion.div 
                  className="h-full bg-green-500"
                  initial={{ width: "0%" }}
                  animate={{ width: `${processingProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
              
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <div className="absolute inset-0 rounded-full bg-green-500/20 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin h-10 w-10 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
              
              <motion.p 
                className="text-text-secondary text-sm"
                variants={itemVariants}
              >
                Please wait while we process your payment to {selectedService?.name}. This may take a few moments.
              </motion.p>
            </motion.div>
          )}
          
          {/* Step 5: Success */}
          {step === 5 && (
            <motion.div 
              key="step5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="h-full flex flex-col items-center justify-center text-center py-6"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <FiCheck className="h-10 w-10 text-green-500" />
              </div>
              
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
                You have successfully paid {parseFloat(amount).toLocaleString()} iTZS for {selectedService?.name} service.
              </motion.p>
              
              <motion.div variants={itemVariants} className="card p-4 w-full mb-8">
                <div className="flex justify-between mb-3">
                  <span className="text-text-secondary">Service</span>
                  <span className="text-text">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-text-secondary">{selectedService?.placeholder}</span>
                  <span className="text-text">{accountNumber}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-text-secondary">Amount</span>
                  <span className="font-bold text-text">{parseFloat(amount).toLocaleString()} iTZS</span>
                </div>
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
                    setSelectedService(null);
                    setAccountNumber('');
                    setAmount('');
                    setError('');
                  }}
                  className="btn btn-green flex-1"
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

export default ServicePaymentScreen;
