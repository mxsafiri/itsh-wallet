import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPhone, FiLock, FiAlertCircle, FiShield } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../contexts/AuthContext';
import { formatPhoneNumber, formatPhoneForApi } from '../utils/formatters';
import logo from '../assets/logo.svg';

const RegisterScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handlePhoneChange = (e) => {
    const input = e.target.value.replace(/\D/g, '');
    setPhoneNumber(input);
    setFormattedPhoneNumber(formatPhoneNumber(input));
  };

  const showToastMessage = (message, type = 'success') => {
    toast[type](message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!phoneNumber || phoneNumber.length < 9) {
      setError('Please enter a valid phone number');
      return;
    }
    
    if (!pin || pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }
    
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Format phone number for API request
      const formattedPhone = formatPhoneForApi(phoneNumber);
      console.log('Registering with formatted phone:', formattedPhone);
      
      // For demo purposes, let's simulate a successful registration
      if (formattedPhone === '+255744123456') {
        showToastMessage('Account already exists! Please login instead.', 'warning');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      const result = await register(formattedPhone, pin);
      
      if (result.success) {
        showToastMessage('Registration successful!');
        setTimeout(() => {
          navigate('/home');
        }, 1000);
      } else {
        setError(result.message || 'Failed to register. Please try again.');
        showToastMessage('Failed to register. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
      showToastMessage('Failed to register. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
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

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.5
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-[#121212] text-white relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl"
          animate={{ 
            x: ["-50%", "-30%", "-50%"],
            y: ["-50%", "-30%", "-50%"],
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"
          animate={{ 
            x: ["30%", "20%", "30%"],
            y: ["30%", "20%", "30%"],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute top-1/3 right-1/4 w-48 h-48 bg-green-500/10 rounded-full filter blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>

      <ToastContainer />

      <div className="flex-1 flex items-center justify-center p-6 z-10">
        <motion.div 
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="bg-[#1E1E1E] p-8 rounded-2xl border border-gray-800 shadow-xl"
            whileHover={{ boxShadow: "0 0 20px rgba(59, 130, 246, 0.1)" }}
          >
            <motion.div 
              className="flex justify-center mb-8"
              variants={logoVariants}
            >
              <div className="relative">
                <motion.div 
                  className="absolute inset-0 bg-blue-500/20 rounded-full filter blur-md"
                  animate={{ 
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                <img 
                  src={logo} 
                  alt="NEDApay Logo" 
                  className="h-20 relative z-10"
                />
              </div>
            </motion.div>
            
            <motion.h2 
              className="text-2xl font-bold text-center mb-6 text-white"
              variants={itemVariants}
            >
              Create Account
            </motion.h2>
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  className="bg-red-500/10 text-red-400 p-4 rounded-lg mb-6"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center">
                    <FiAlertCircle className="h-5 w-5 mr-2" />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.form 
              onSubmit={handleSubmit}
              variants={containerVariants}
            >
              <motion.div 
                className="mb-6"
                variants={itemVariants}
              >
                <label htmlFor="phoneNumber" className="block text-sm font-medium mb-2 text-gray-300">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={formattedPhoneNumber}
                    onChange={handlePhoneChange}
                    className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg py-3 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="+255 XXX XXX XXX"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter your Tanzanian phone number (e.g., 0744XXXXXX or +255744XXXXXX)
                </p>
              </motion.div>
              
              <motion.div 
                className="mb-6"
                variants={itemVariants}
              >
                <label htmlFor="pin" className="block text-sm font-medium mb-2 text-gray-300">
                  PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="pin"
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg py-3 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Create a 4-digit PIN"
                    maxLength={4}
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Your PIN must be 4 digits and will be used to secure your account
                </p>
              </motion.div>
              
              <motion.div 
                className="mb-8"
                variants={itemVariants}
              >
                <label htmlFor="confirmPin" className="block text-sm font-medium mb-2 text-gray-300">
                  Confirm PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiShield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPin"
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#2A2A2A] border border-gray-700 rounded-lg py-3 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Confirm your PIN"
                    maxLength={4}
                    disabled={loading}
                  />
                </div>
              </motion.div>
              
              <motion.button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
                disabled={loading}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <motion.div 
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Creating Account...
                  </div>
                ) : 'Create Account'}
              </motion.button>
            </motion.form>
            
            <motion.div 
              className="mt-8 text-center"
              variants={itemVariants}
            >
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-500 font-medium hover:text-blue-400 transition-colors duration-200">
                  Sign In
                </Link>
              </p>
            </motion.div>

            <motion.div 
              className="mt-8 pt-6 border-t border-gray-800"
              variants={itemVariants}
            >
              <div className="text-xs text-gray-500 space-y-2">
                <p className="font-medium">By creating an account, you agree to:</p>
                <motion.ul 
                  className="list-disc pl-5 space-y-1"
                  variants={containerVariants}
                >
                  <motion.li variants={itemVariants}>NEDApay's Terms of Service</motion.li>
                  <motion.li variants={itemVariants}>Privacy Policy</motion.li>
                  <motion.li variants={itemVariants}>Bank of Tanzania regulations for digital payments</motion.li>
                </motion.ul>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RegisterScreen;
