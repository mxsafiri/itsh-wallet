import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { walletAPI } from '../services/api';
import QRCode from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiDollarSign, FiEdit3, FiCopy, FiShare2, 
  FiDownload, FiInfo, FiHome, FiList, FiLock, FiSettings, 
  FiRefreshCw, FiCreditCard
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const ReceiveScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [paymentUri, setPaymentUri] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Enter amount, 2: Show QR
  const [quickAmounts, setQuickAmounts] = useState([1000, 5000, 10000, 20000]);

  const handleGenerateQR = async (e) => {
    e.preventDefault();
    
    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      toast.error('Please enter a valid amount', { theme: 'dark' });
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // In demo mode, generate a mock payment URI
      const mockPublicKey = user?.stellarPublicKey || 'MOCK_PUBLIC_KEY_255123456789';
      const mockUri = `web+stellar:pay?destination=${mockPublicKey}&amount=${amount}&memo=${encodeURIComponent(memo)}&asset_code=iTZS&network=testnet`;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPaymentUri(mockUri);
      setQrValue(mockUri);
      toast.success('QR code generated successfully', { theme: 'dark' });
      setStep(2);
    } catch (err) {
      console.error('Error generating payment QR:', err);
      setError('Failed to generate payment QR code. Please try again.');
      toast.error('Failed to generate QR code', { theme: 'dark' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentUri)
      .then(() => {
        toast.success('Payment link copied to clipboard!', { theme: 'dark' });
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        setError('Failed to copy link. Please try again.');
        toast.error('Failed to copy link', { theme: 'dark' });
      });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NEDApay Payment Request',
          text: `Please pay ${amount} iTZS to ${user?.phoneNumber || '+255123456789'} ${memo ? `for ${memo}` : ''}`,
          url: paymentUri,
        });
        toast.success('Payment request shared!', { theme: 'dark' });
      } catch (error) {
        console.error('Error sharing:', error);
        if (error.name !== 'AbortError') {
          setError('Failed to share. Please try again.');
          toast.error('Failed to share', { theme: 'dark' });
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('payment-qr-code');
    if (!canvas) return;
    
    // Convert the QR code to a data URL
    const dataUrl = canvas.toDataURL('image/png');
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `NEDApay-${amount}-iTZS.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('QR code downloaded', { theme: 'dark' });
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
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/home')} 
            className="mr-4 w-10 h-10 flex items-center justify-center rounded-full bg-background-hover"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiArrowLeft className="h-5 w-5 text-text" />
          </motion.button>
          <h1 className="text-xl font-bold text-text">
            {step === 1 ? 'Receive iTZS' : 'Payment QR Code'}
          </h1>
        </div>
      </motion.header>

      <div className="flex-1 p-4">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card bg-error/10 text-error p-4 mb-4"
            >
              <div className="flex items-center">
                <FiInfo className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div 
              key="step1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <motion.div 
                variants={itemVariants}
                className="text-center mb-6"
              >
                <div className="avatar w-20 h-20 mx-auto mb-4">
                  <FiCreditCard className="h-10 w-10" />
                </div>
                <h2 className="text-xl font-bold text-text mb-1">Request Payment</h2>
                <p className="text-text-secondary">Generate a QR code for others to scan and pay you</p>
              </motion.div>
              
              <motion.form 
                onSubmit={handleGenerateQR} 
                className="card p-5 space-y-6"
                variants={itemVariants}
              >
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Amount (iTZS)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiDollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="input pl-10 text-xl font-bold text-center"
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
                      iTZS
                    </div>
                  </div>
                </div>
                
                <motion.div variants={itemVariants}>
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
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <label className="block text-sm text-text-secondary mb-2 flex items-center">
                    <FiEdit3 className="mr-2 h-4 w-4" /> Memo (Optional)
                  </label>
                  <input
                    type="text"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="What's this for?"
                    className="input"
                  />
                </motion.div>
                
                <motion.button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  variants={itemVariants}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <FiRefreshCw className="animate-spin h-5 w-5 mr-2" />
                      Generating...
                    </span>
                  ) : 'Generate QR Code'}
                </motion.button>
              </motion.form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <motion.div 
                variants={itemVariants}
                className="card p-5 text-center"
              >
                <motion.h3 
                  className="text-lg font-bold mb-5 text-text"
                  variants={itemVariants}
                >
                  Scan to Pay {parseFloat(amount).toLocaleString()} iTZS
                </motion.h3>
                
                <motion.div 
                  className="bg-white p-4 rounded-lg inline-block mb-5"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  {qrValue ? (
                    <QRCode 
                      id="payment-qr-code"
                      value={qrValue} 
                      size={200} 
                      level="H"
                      renderAs="canvas"
                      includeMargin={true}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                      imageSettings={{
                        src: "https://i.imgur.com/HcQkBT1.png",
                        height: 40,
                        width: 40,
                        excavate: true,
                      }}
                    />
                  ) : (
                    <div className="w-48 h-48 bg-background-card rounded-lg flex items-center justify-center">
                      <span className="text-text-secondary">QR Code</span>
                    </div>
                  )}
                </motion.div>
                
                <motion.div 
                  className="space-y-2 mb-6"
                  variants={itemVariants}
                >
                  <p className="text-2xl font-bold text-text">{parseFloat(amount).toLocaleString()} iTZS</p>
                  {memo && <p className="text-text-secondary">{memo}</p>}
                  <p className="text-text-secondary">To: {user?.phoneNumber || '+255123456789'}</p>
                </motion.div>
                
                <motion.div 
                  className="grid grid-cols-3 gap-3"
                  variants={itemVariants}
                >
                  <motion.button
                    onClick={handleCopyLink}
                    className="card card-hover flex flex-col items-center justify-center py-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiCopy className="h-5 w-5 mb-1 text-primary" />
                    <span className="text-xs">Copy Link</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={handleShare}
                    className="card card-hover flex flex-col items-center justify-center py-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiShare2 className="h-5 w-5 mb-1 text-primary" />
                    <span className="text-xs">Share</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={handleDownloadQR}
                    className="card card-hover flex flex-col items-center justify-center py-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiDownload className="h-5 w-5 mb-1 text-primary" />
                    <span className="text-xs">Download</span>
                  </motion.button>
                </motion.div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="card bg-primary/10 p-4"
              >
                <div className="flex items-start">
                  <FiInfo className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-primary" />
                  <div className="text-primary">
                    <p className="text-sm">
                      This QR code contains a payment link that can be scanned by any NEDApay user to send you {parseFloat(amount).toLocaleString()} iTZS.
                    </p>
                    <p className="text-sm mt-2">
                      The payment will be instantly credited to your wallet once completed.
                    </p>
                  </div>
                </div>
              </motion.div>
              
              <motion.button
                onClick={() => {
                  setStep(1);
                  setAmount('');
                  setMemo('');
                  setQrValue('');
                  setPaymentUri('');
                }}
                className="btn btn-secondary w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                variants={itemVariants}
              >
                Create Another Request
              </motion.button>
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

export default ReceiveScreen;
