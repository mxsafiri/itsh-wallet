import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiPlus, FiMinus, FiMessageCircle, FiMail, FiPhone, FiHelpCircle } from 'react-icons/fi';

const HelpScreen = () => {
  const navigate = useNavigate();
  const [activeQuestion, setActiveQuestion] = useState(null);

  const faqItems = [
    {
      id: 1,
      question: "How do I send money to another user?",
      answer: "To send money, go to the home screen and tap on 'Send Money'. Enter the amount you want to send, then select a recipient from your contacts or enter their phone number or NEDApay ID. Review the details and confirm the transaction."
    },
    {
      id: 2,
      question: "How do I add money to my NEDApay wallet?",
      answer: "You can add money to your NEDApay wallet through mobile money transfer (M-Pesa, Tigo Pesa, Airtel Money), bank transfer, or by receiving payments from other NEDApay users. Go to the 'Add Money' section on your home screen to see all available options."
    },
    {
      id: 3,
      question: "Is my money safe in NEDApay?",
      answer: "Yes, your money is secure with NEDApay. We use advanced encryption and security protocols to protect your account and transactions. Additionally, your funds are backed by real assets and comply with all regulatory requirements in Tanzania."
    },
    {
      id: 4,
      question: "What fees does NEDApay charge?",
      answer: "NEDApay charges minimal fees for certain transactions. Sending money to other NEDApay users is free. Withdrawals to mobile money or bank accounts may incur a small fee (typically 1-2%). For a complete fee schedule, please visit our website or contact customer support."
    },
    {
      id: 5,
      question: "How do I reset my PIN?",
      answer: "If you've forgotten your PIN, go to the login screen and tap on 'Forgot PIN'. Follow the verification process, which includes confirming your identity through your registered phone number or email. Once verified, you'll be able to create a new PIN."
    },
    {
      id: 6,
      question: "Can I use NEDApay outside Tanzania?",
      answer: "Currently, NEDApay is primarily designed for use within Tanzania. However, we're working on expanding our services to other East African countries. Stay tuned for updates on international capabilities."
    },
    {
      id: 7,
      question: "How do I pay for services using NEDApay?",
      answer: "To pay for services, go to the home screen and tap on 'Pay Services'. Select the service category (electricity, water, etc.), enter the required account information and amount, then confirm your payment. You'll receive a confirmation receipt once the transaction is complete."
    }
  ];

  const toggleQuestion = (id) => {
    setActiveQuestion(activeQuestion === id ? null : id);
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
          <h1 className="text-xl font-bold text-text">Help & Support</h1>
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
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
              <FiHelpCircle className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-text">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-3">
            {faqItems.map((item) => (
              <div key={item.id} className="border-b border-dark-700/30 pb-3 last:border-0 last:pb-0">
                <button 
                  className="w-full flex items-center justify-between text-left py-2"
                  onClick={() => toggleQuestion(item.id)}
                >
                  <span className="font-medium text-text">{item.question}</span>
                  {activeQuestion === item.id ? (
                    <FiMinus className="h-5 w-5 text-primary flex-shrink-0" />
                  ) : (
                    <FiPlus className="h-5 w-5 text-text-secondary flex-shrink-0" />
                  )}
                </button>
                
                <AnimatePresence>
                  {activeQuestion === item.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="text-text-secondary text-sm py-2 pl-1">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card p-5 mb-6"
        >
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
              <FiMessageCircle className="h-5 w-5 text-green-400" />
            </div>
            <h2 className="text-lg font-bold text-text">Contact Support</h2>
          </div>
          
          <p className="text-text-secondary mb-4">
            Our customer support team is available 24/7 to assist you with any questions or issues you may have.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-background-hover rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-3">
                <FiPhone className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">Phone Support</p>
                <p className="text-text-secondary text-sm">+255 744 123 456</p>
                <p className="text-xs text-text-secondary mt-1">Available 24/7</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-background-hover rounded-lg">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mr-3">
                <FiMail className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">Email Support</p>
                <p className="text-text-secondary text-sm">support@nedapay.co.tz</p>
                <p className="text-xs text-text-secondary mt-1">Response within 24 hours</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card p-5 mb-6"
        >
          <h3 className="font-bold text-text mb-3">Report an Issue</h3>
          
          <form className="space-y-4">
            <div>
              <label htmlFor="issue-type" className="block text-sm text-text-secondary mb-2">
                Issue Type
              </label>
              <select 
                id="issue-type" 
                className="w-full p-3 bg-background-hover border border-dark-700/30 rounded-lg text-text"
              >
                <option value="">Select an issue type</option>
                <option value="transaction">Transaction Problem</option>
                <option value="account">Account Access</option>
                <option value="security">Security Concern</option>
                <option value="app">App Technical Issue</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm text-text-secondary mb-2">
                Description
              </label>
              <textarea 
                id="description" 
                rows="4" 
                className="w-full p-3 bg-background-hover border border-dark-700/30 rounded-lg text-text resize-none"
                placeholder="Please describe your issue in detail..."
              ></textarea>
            </div>
            
            <motion.button
              type="button"
              className="btn btn-primary w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Submit Report
            </motion.button>
          </form>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-text-secondary"
        >
          <p>© 2025 NEDApay. All rights reserved.</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HelpScreen;
