import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiFileText, FiLock, FiShield } from 'react-icons/fi';

const TermsScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('terms'); // 'terms' or 'privacy'

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
          <h1 className="text-xl font-bold text-text">Terms & Privacy</h1>
        </div>
      </motion.header>

      {/* Tab Navigation */}
      <div className="flex border-b border-dark-700/30">
        <button
          className={`flex-1 py-3 px-4 text-center font-medium ${
            activeTab === 'terms' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-text-secondary'
          }`}
          onClick={() => setActiveTab('terms')}
        >
          Terms of Service
        </button>
        <button
          className={`flex-1 py-3 px-4 text-center font-medium ${
            activeTab === 'privacy' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-text-secondary'
          }`}
          onClick={() => setActiveTab('privacy')}
        >
          Privacy Policy
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'terms' ? (
            <TermsOfService key="terms" />
          ) : (
            <PrivacyPolicy key="privacy" />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const TermsOfService = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
          <FiFileText className="h-5 w-5 text-blue-400" />
        </div>
        <h2 className="text-lg font-bold text-text">Terms of Service</h2>
      </div>
      
      <div className="card p-5 mb-6">
        <h3 className="font-bold text-text mb-3">1. Acceptance of Terms</h3>
        <p className="text-text-secondary text-sm mb-4">
          By accessing or using the NEDApay wallet application ("App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.
        </p>
        
        <h3 className="font-bold text-text mb-3">2. Description of Services</h3>
        <p className="text-text-secondary text-sm mb-4">
          NEDApay provides a digital wallet service that allows users to store, send, and receive digital currency, as well as pay for goods and services within Tanzania. Our services include but are not limited to:
        </p>
        <ul className="list-disc pl-5 text-text-secondary text-sm mb-4">
          <li className="mb-2">Digital wallet creation and management</li>
          <li className="mb-2">Peer-to-peer money transfers</li>
          <li className="mb-2">Bill payments and service payments</li>
          <li className="mb-2">Mobile money integration</li>
          <li className="mb-2">Transaction history and reporting</li>
        </ul>
        
        <h3 className="font-bold text-text mb-3">3. Account Registration</h3>
        <p className="text-text-secondary text-sm mb-4">
          To use NEDApay services, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
        </p>
        <p className="text-text-secondary text-sm mb-4">
          You are responsible for safeguarding your account credentials and for all activities that occur under your account. You must notify NEDApay immediately of any unauthorized use of your account.
        </p>
        
        <h3 className="font-bold text-text mb-3">4. User Conduct</h3>
        <p className="text-text-secondary text-sm mb-4">
          You agree not to use the App for any illegal purposes or in any manner that could damage, disable, overburden, or impair the App. You further agree not to use the App to:
        </p>
        <ul className="list-disc pl-5 text-text-secondary text-sm mb-4">
          <li className="mb-2">Engage in fraudulent activities</li>
          <li className="mb-2">Violate any applicable laws or regulations</li>
          <li className="mb-2">Infringe on the rights of others</li>
          <li className="mb-2">Attempt to gain unauthorized access to any portion of the App</li>
          <li className="mb-2">Transmit any viruses, worms, or other malicious code</li>
        </ul>
        
        <h3 className="font-bold text-text mb-3">5. Fees and Charges</h3>
        <p className="text-text-secondary text-sm mb-4">
          NEDApay may charge fees for certain transactions or services. All applicable fees will be clearly disclosed before you complete a transaction. We reserve the right to change our fee structure at any time with proper notice to users.
        </p>
        
        <h3 className="font-bold text-text mb-3">6. Limitation of Liability</h3>
        <p className="text-text-secondary text-sm mb-4">
          To the maximum extent permitted by law, NEDApay shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of or in connection with your use of the App.
        </p>
        
        <h3 className="font-bold text-text mb-3">7. Modifications to Terms</h3>
        <p className="text-text-secondary text-sm mb-4">
          NEDApay reserves the right to modify these Terms at any time. We will provide notice of significant changes through the App or by other means. Your continued use of the App after such modifications constitutes your acceptance of the updated Terms.
        </p>
        
        <h3 className="font-bold text-text mb-3">8. Governing Law</h3>
        <p className="text-text-secondary text-sm mb-4">
          These Terms shall be governed by and construed in accordance with the laws of Tanzania, without regard to its conflict of law provisions.
        </p>
        
        <h3 className="font-bold text-text mb-3">9. Contact Information</h3>
        <p className="text-text-secondary text-sm">
          If you have any questions about these Terms, please contact us at:
        </p>
        <p className="text-text-secondary text-sm">
          Email: legal@nedapay.co.tz<br />
          Phone: +255 744 123 456
        </p>
      </div>
      
      <div className="text-center text-xs text-text-secondary mb-6">
        <p>Last Updated: April 1, 2025</p>
      </div>
    </motion.div>
  );
};

const PrivacyPolicy = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
          <FiLock className="h-5 w-5 text-purple-400" />
        </div>
        <h2 className="text-lg font-bold text-text">Privacy Policy</h2>
      </div>
      
      <div className="card p-5 mb-6">
        <h3 className="font-bold text-text mb-3">1. Introduction</h3>
        <p className="text-text-secondary text-sm mb-4">
          At NEDApay, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
        </p>
        
        <h3 className="font-bold text-text mb-3">2. Information We Collect</h3>
        <p className="text-text-secondary text-sm mb-2">
          We may collect the following types of information:
        </p>
        <ul className="list-disc pl-5 text-text-secondary text-sm mb-4">
          <li className="mb-2">
            <span className="font-medium text-text">Personal Information:</span> Name, email address, phone number, date of birth, and identification documents.
          </li>
          <li className="mb-2">
            <span className="font-medium text-text">Financial Information:</span> Bank account details, mobile money account information, and transaction history.
          </li>
          <li className="mb-2">
            <span className="font-medium text-text">Device Information:</span> Device type, operating system, unique device identifiers, and mobile network information.
          </li>
          <li className="mb-2">
            <span className="font-medium text-text">Usage Data:</span> Information about how you use our application, including login times, features used, and user preferences.
          </li>
        </ul>
        
        <h3 className="font-bold text-text mb-3">3. How We Use Your Information</h3>
        <p className="text-text-secondary text-sm mb-2">
          We use the collected information for various purposes, including:
        </p>
        <ul className="list-disc pl-5 text-text-secondary text-sm mb-4">
          <li className="mb-2">Providing and maintaining our services</li>
          <li className="mb-2">Processing and completing transactions</li>
          <li className="mb-2">Verifying your identity and preventing fraud</li>
          <li className="mb-2">Complying with legal and regulatory requirements</li>
          <li className="mb-2">Improving our application and user experience</li>
          <li className="mb-2">Communicating with you about updates, security alerts, and support</li>
        </ul>
        
        <h3 className="font-bold text-text mb-3">4. Data Security</h3>
        <div className="flex items-start mb-4">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex-shrink-0 flex items-center justify-center mr-3 mt-1">
            <FiShield className="h-4 w-4 text-green-400" />
          </div>
          <p className="text-text-secondary text-sm">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption, secure socket layer technology, and regular security assessments.
          </p>
        </div>
        
        <h3 className="font-bold text-text mb-3">5. Data Sharing and Disclosure</h3>
        <p className="text-text-secondary text-sm mb-4">
          We may share your information with:
        </p>
        <ul className="list-disc pl-5 text-text-secondary text-sm mb-4">
          <li className="mb-2">Service providers who assist us in operating our application</li>
          <li className="mb-2">Financial institutions to process transactions</li>
          <li className="mb-2">Regulatory authorities when required by law</li>
          <li className="mb-2">Third parties in the event of a merger, acquisition, or business transfer</li>
        </ul>
        <p className="text-text-secondary text-sm mb-4">
          We will never sell your personal information to third parties for marketing purposes.
        </p>
        
        <h3 className="font-bold text-text mb-3">6. Your Rights</h3>
        <p className="text-text-secondary text-sm mb-4">
          Depending on your location, you may have certain rights regarding your personal information, including:
        </p>
        <ul className="list-disc pl-5 text-text-secondary text-sm mb-4">
          <li className="mb-2">The right to access your personal information</li>
          <li className="mb-2">The right to correct inaccurate information</li>
          <li className="mb-2">The right to delete your personal information</li>
          <li className="mb-2">The right to restrict or object to processing</li>
          <li className="mb-2">The right to data portability</li>
        </ul>
        
        <h3 className="font-bold text-text mb-3">7. Changes to This Privacy Policy</h3>
        <p className="text-text-secondary text-sm mb-4">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
        </p>
        
        <h3 className="font-bold text-text mb-3">8. Contact Us</h3>
        <p className="text-text-secondary text-sm">
          If you have any questions or concerns about this Privacy Policy, please contact our Data Protection Officer at:
        </p>
        <p className="text-text-secondary text-sm">
          Email: privacy@nedapay.co.tz<br />
          Phone: +255 744 123 456
        </p>
      </div>
      
      <div className="text-center text-xs text-text-secondary mb-6">
        <p>Last Updated: April 1, 2025</p>
      </div>
    </motion.div>
  );
};

export default TermsScreen;
