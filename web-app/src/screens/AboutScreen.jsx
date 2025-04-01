import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiGlobe, FiUsers, FiShield, FiTarget } from 'react-icons/fi';

const AboutScreen = () => {
  const navigate = useNavigate();

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
          <h1 className="text-xl font-bold text-text">About NEDApay</h1>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="card p-5 mb-6"
        >
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
              <img src="/logo.png" alt="NEDApay Logo" className="w-16 h-16" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-center text-text mb-2">NEDApay Wallet</h2>
          <p className="text-sm text-center text-text-secondary mb-6">Version 1.0.0</p>
          
          <p className="text-text-secondary mb-4">
            NEDApay is a digital wallet designed to revolutionize payments in Tanzania. Our platform enables secure, fast, and convenient transactions using digital currency.
          </p>
          
          <p className="text-text-secondary mb-6">
            Built on modern blockchain technology, NEDApay provides a reliable alternative to traditional banking while ensuring your funds are secure and accessible anytime, anywhere.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card p-5 mb-6"
        >
          <h3 className="font-bold text-text mb-4">Our Mission</h3>
          
          <div className="flex items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center mr-3">
              <FiTarget className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">
                To provide accessible financial services to all Tanzanians, bridging the gap between traditional banking and the digital economy.
              </p>
            </div>
          </div>
          
          <div className="flex items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex-shrink-0 flex items-center justify-center mr-3">
              <FiGlobe className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">
                To create a borderless payment system that enables seamless transactions across East Africa and beyond.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex-shrink-0 flex items-center justify-center mr-3">
              <FiShield className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">
                To ensure the highest levels of security and transparency in all financial transactions.
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card p-5 mb-6"
        >
          <h3 className="font-bold text-text mb-4">Our Team</h3>
          
          <div className="flex items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex-shrink-0 flex items-center justify-center mr-3">
              <FiUsers className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">
                NEDApay was founded by a team of financial and technology experts with a passion for financial inclusion and innovation in Tanzania.
              </p>
            </div>
          </div>
          
          <p className="text-text-secondary text-sm mb-4">
            Our diverse team combines expertise in blockchain technology, financial services, security, and user experience design to create a seamless payment solution.
          </p>
          
          <p className="text-text-secondary text-sm">
            Based in Dar es Salaam, our growing team is committed to transforming how Tanzanians send, receive, and manage money.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="card p-5 mb-6"
        >
          <h3 className="font-bold text-text mb-4">Contact Us</h3>
          
          <div className="mb-3">
            <p className="text-sm font-medium text-text">Email</p>
            <p className="text-text-secondary text-sm">support@nedapay.co.tz</p>
          </div>
          
          <div className="mb-3">
            <p className="text-sm font-medium text-text">Phone</p>
            <p className="text-text-secondary text-sm">+255 744 123 456</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-text">Address</p>
            <p className="text-text-secondary text-sm">123 Innovation Street, Dar es Salaam, Tanzania</p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-text-secondary"
        >
          <p>© 2025 NEDApay. All rights reserved.</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AboutScreen;
