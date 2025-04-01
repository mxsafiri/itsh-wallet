import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiInfo, FiAlertTriangle, FiAlertCircle, FiCamera, FiUser, FiPhone, FiFileText, FiKey, FiCheckCircle, FiX } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

const scannerFrameVariants = {
  scanning: {
    boxShadow: ['0 0 0 0px rgba(59, 130, 246, 0.5)', '0 0 0 4px rgba(59, 130, 246, 0.5)'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "reverse"
    }
  }
};

const ScanScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [cameraPermission, setCameraPermission] = useState('pending'); // 'pending', 'granted', 'denied'
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    // Request camera permission
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'camera' })
        .then(permissionStatus => {
          setCameraPermission(permissionStatus.state);
          
          permissionStatus.onchange = () => {
            setCameraPermission(permissionStatus.state);
            if (permissionStatus.state === 'granted') {
              startScanner();
            }
          };
          
          if (permissionStatus.state === 'granted') {
            startScanner();
          }
        })
        .catch(err => {
          console.error('Error checking camera permission:', err);
          // Try starting scanner anyway
          startScanner();
        });
    } else {
      // Browsers that don't support permission API
      startScanner();
    }
    
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = () => {
    if (!scannerRef.current) return;
    
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };
    
    html5QrCodeRef.current = new Html5Qrcode("qr-scanner");
    
    html5QrCodeRef.current.start(
      { facingMode: "environment" },
      config,
      handleScanSuccess,
      handleScanError
    )
    .then(() => {
      setScanning(true);
      toast.success('Camera started');
    })
    .catch((err) => {
      console.error('Failed to start camera:', err);
      setError('Failed to start camera: ' + err);
      setScanning(false);
      setCameraPermission('denied');
    });
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current.stop()
        .catch(err => console.error('Error stopping scanner:', err));
    }
  };

  const handleScanSuccess = (decodedText) => {
    setScanning(false);
    stopScanner();
    toast.success('QR code detected');
    
    try {
      // For demo purposes, create a mock payment data
      if (decodedText.startsWith('web+stellar:')) {
        // Parse the URI
        const uri = new URL(decodedText);
        const operation = uri.pathname.substring(1); // Remove leading slash
        
        if (operation === 'pay') {
          const params = new URLSearchParams(uri.search);
          const destination = params.get('destination');
          const amount = params.get('amount');
          const memo = params.get('memo');
          
          if (destination && amount) {
            setPaymentData({
              destination,
              amount,
              memo: memo || '',
              uri: decodedText,
              recipientName: 'Tanzania Electric', // Mock data for demo
              recipientPhone: '+255744345678' // Mock data for demo
            });
          } else {
            setError('Invalid payment QR code. Missing required parameters.');
          }
        } else {
          setError('Unsupported Stellar operation: ' + operation);
        }
      } else {
        // For demo purposes, create a mock payment data even for non-stellar URIs
        setPaymentData({
          destination: 'GDKJFHS83HFKS83HF83HFS8H3F8SH38FHS83HF',
          amount: '5000',
          memo: 'Electricity bill payment',
          uri: decodedText,
          recipientName: 'Tanzania Electric',
          recipientPhone: '+255744345678'
        });
      }
    } catch (err) {
      console.error('Error parsing QR code:', err);
      setError('Failed to parse QR code: ' + err.message);
    }
  };

  const handleScanError = (err) => {
    // Don't show errors during normal scanning
    console.log('QR scan error:', err);
  };

  const handleProceedToPayment = () => {
    // Navigate to send screen with pre-filled data
    navigate('/send', { 
      state: { 
        paymentData,
        fromScanner: true
      } 
    });
  };

  const handleTryAgain = () => {
    setError('');
    setPaymentData(null);
    setScanning(true);
    startScanner();
  };

  const handleManualEntry = () => {
    navigate('/send');
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
          <h1 className="text-xl font-bold">Scan QR Code</h1>
        </div>
      </motion.header>

      <div className="flex-1 p-6">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              key="error"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-red-900/20 border border-red-800 text-red-400 p-4 rounded-xl mb-6"
            >
              <motion.div variants={itemVariants} className="flex items-center">
                <FiAlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </motion.div>
              <motion.button 
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleTryAgain}
                className="w-full mt-3 p-3 bg-red-800/30 hover:bg-red-800/50 rounded-lg text-red-300 font-medium transition-colors"
              >
                Try Again
              </motion.button>
            </motion.div>
          )}

          {cameraPermission === 'denied' && (
            <motion.div 
              key="permission-denied"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-yellow-900/20 border border-yellow-800 text-yellow-400 p-4 rounded-xl mb-6"
            >
              <motion.div variants={itemVariants} className="flex items-start">
                <FiAlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Camera access denied</p>
                  <p className="text-sm mt-1 text-yellow-500/80">
                    Please enable camera access in your browser settings to scan QR codes.
                  </p>
                  <motion.button 
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleManualEntry}
                    className="mt-3 p-3 bg-yellow-800/30 hover:bg-yellow-800/50 rounded-lg text-yellow-300 font-medium transition-colors"
                  >
                    Enter Payment Details Manually
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {scanning && cameraPermission !== 'denied' ? (
            <motion.div 
              key="scanning"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <motion.div 
                variants={itemVariants} 
                className="bg-gray-800 border border-gray-700 p-4 rounded-xl text-center"
              >
                <motion.div 
                  variants={scannerFrameVariants}
                  animate="scanning"
                  className="w-full h-64 md:h-80 bg-gray-900 rounded-lg overflow-hidden relative"
                >
                  <div 
                    id="qr-scanner" 
                    ref={scannerRef}
                    className="w-full h-full"
                  ></div>
                  <motion.div 
                    className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none"
                    initial={{ opacity: 0.6 }}
                    animate={{ 
                      opacity: [0.4, 0.8],
                      scale: [0.98, 1.02],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                </motion.div>
                
                <motion.div 
                  variants={itemVariants}
                  className="mt-4 flex items-center justify-center"
                >
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                  <p className="text-gray-400">
                    Position the QR code within the frame to scan
                  </p>
                </motion.div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="bg-blue-900/20 border border-blue-800 text-blue-400 p-4 rounded-xl"
              >
                <div className="flex items-start">
                  <FiInfo className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm">
                      Scan a NEDApay QR code to make a payment. Make sure the QR code is well-lit and clearly visible.
                    </p>
                  </div>
                </div>
              </motion.div>
              
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleManualEntry}
                className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-200 font-medium transition-colors"
              >
                <FiCamera className="inline mr-2" />
                Enter Payment Details Manually
              </motion.button>
            </motion.div>
          ) : paymentData ? (
            <motion.div 
              key="payment-details"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <motion.div 
                variants={itemVariants}
                className="bg-gray-800 border border-gray-700 p-5 rounded-xl"
              >
                <h3 className="text-lg font-semibold mb-4 text-blue-400">Payment Details</h3>
                
                <div className="space-y-4">
                  <motion.div 
                    variants={itemVariants}
                    className="flex justify-between items-center p-3 bg-gray-900/60 rounded-lg"
                  >
                    <span className="text-gray-400">Amount</span>
                    <span className="font-medium text-lg">{parseFloat(paymentData.amount).toLocaleString()} iTZS</span>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    className="flex justify-between items-center p-3 bg-gray-900/60 rounded-lg"
                  >
                    <div className="flex items-center">
                      <FiUser className="mr-2 text-gray-500" />
                      <span className="text-gray-400">Recipient</span>
                    </div>
                    <span className="font-medium">
                      {paymentData.recipientName || 'Unknown'}
                    </span>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    className="flex justify-between items-center p-3 bg-gray-900/60 rounded-lg"
                  >
                    <div className="flex items-center">
                      <FiPhone className="mr-2 text-gray-500" />
                      <span className="text-gray-400">Phone</span>
                    </div>
                    <span className="font-medium">
                      {paymentData.recipientPhone || 'N/A'}
                    </span>
                  </motion.div>
                  
                  {paymentData.memo && (
                    <motion.div 
                      variants={itemVariants}
                      className="flex justify-between items-center p-3 bg-gray-900/60 rounded-lg"
                    >
                      <div className="flex items-center">
                        <FiFileText className="mr-2 text-gray-500" />
                        <span className="text-gray-400">Memo</span>
                      </div>
                      <span className="font-medium">{paymentData.memo}</span>
                    </motion.div>
                  )}
                  
                  <motion.div 
                    variants={itemVariants}
                    className="pt-2 mt-2 border-t border-gray-700"
                  >
                    <div className="flex justify-between items-center p-3 bg-gray-900/60 rounded-lg mt-2">
                      <div className="flex items-center">
                        <FiKey className="mr-2 text-gray-500" />
                        <span className="text-gray-400">Stellar Address</span>
                      </div>
                      <span className="font-mono text-xs text-gray-400 truncate max-w-[180px]">
                        {paymentData.destination}
                      </span>
                    </div>
                  </motion.div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleProceedToPayment}
                    className="w-full p-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors flex items-center justify-center"
                  >
                    <FiCheckCircle className="mr-2" />
                    Proceed to Payment
                  </motion.button>
                  
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleTryAgain}
                    className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 font-medium transition-colors flex items-center justify-center"
                  >
                    <FiCamera className="mr-2" />
                    Scan Again
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ScanScreen;
