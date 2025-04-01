import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiHome, FiList, FiLock, FiSettings, FiSend, FiShield, FiUsers, FiArrowRight, FiChevronRight } from 'react-icons/fi';

const LearnScreen = () => {
  const navigate = useNavigate();
  const { topic } = useParams();
  
  // Educational content for each topic
  const topics = [
    {
      id: 'send-money',
      title: 'Send Money Instantly',
      subtitle: 'Fast, secure money transfers',
      description: 'Learn how NEDApay makes sending money easier than ever',
      icon: <FiSend className="h-8 w-8" />,
      color: "from-blue-500/90 to-blue-600/90",
      content: [
        {
          heading: 'Instant Transfers Anywhere in Tanzania',
          text: 'With NEDApay, you can send money to anyone in Tanzania instantly, regardless of their bank or mobile money provider. Our blockchain-based system ensures that your money arrives securely and without delays.',
          image: '/images/instant-transfer.svg'
        },
        {
          heading: 'No Hidden Fees or Charges',
          text: 'Unlike traditional money transfer services, NEDApay charges zero fees for domestic transfers. What you send is exactly what they receive, with no hidden charges or exchange rate markups.',
          image: '/images/no-fees.svg'
        },
        {
          heading: 'Simple and Intuitive Process',
          text: 'Sending money is as easy as a few taps. Enter the recipient\'s phone number or scan their QR code, enter the amount, confirm with your PIN, and the money is sent instantly.',
          image: '/images/simple-process.svg'
        },
        {
          heading: 'Track Your Transfers in Real-Time',
          text: 'With NEDApay, you can track the status of your transfers in real-time. Get instant notifications when your money is sent, received, or when there\'s any issue with the transfer.',
          image: '/images/track-transfers.svg'
        }
      ]
    },
    {
      id: 'no-fees',
      title: 'No Hidden Fees',
      subtitle: 'Transparent transactions',
      description: 'Understand how NEDApay eliminates hidden costs',
      icon: <FiShield className="h-8 w-8" />,
      color: "from-green-500/90 to-green-600/90",
      content: [
        {
          heading: 'Complete Transparency',
          text: 'NEDApay is built on the principle of complete transparency. We show you exactly what you\'re paying for, with no hidden fees or charges buried in the fine print.',
          image: '/images/transparency.svg'
        },
        {
          heading: 'Zero Transaction Fees',
          text: 'We\'ve eliminated transaction fees for domestic transfers. Send money to friends, family, or businesses within Tanzania without paying any fees or charges.',
          image: '/images/zero-fees.svg'
        },
        {
          heading: 'No Minimum Balance Requirements',
          text: 'Unlike traditional banks, NEDApay doesn\'t require you to maintain a minimum balance in your account. You can use our services without worrying about minimum balance fees.',
          image: '/images/no-minimum.svg'
        },
        {
          heading: 'Clear Fee Structure for International Transfers',
          text: 'For international transfers, we maintain a clear and competitive fee structure. You\'ll always know exactly what you\'re paying before you confirm the transfer.',
          image: '/images/fee-structure.svg'
        }
      ]
    },
    {
      id: 'security',
      title: 'Secure & Fast',
      subtitle: 'Blockchain-powered security',
      description: 'Discover how NEDApay protects your money',
      icon: <FiLock className="h-8 w-8" />,
      color: "from-purple-500/90 to-purple-600/90",
      content: [
        {
          heading: 'Blockchain Technology',
          text: 'NEDApay uses advanced blockchain technology to secure your transactions. Each transaction is encrypted and recorded on a distributed ledger, making it virtually impossible to hack or tamper with.',
          image: '/images/blockchain.svg'
        },
        {
          heading: 'Multi-Factor Authentication',
          text: 'We protect your account with multi-factor authentication. In addition to your password, you can enable biometric verification and PIN protection for an extra layer of security.',
          image: '/images/multi-factor.svg'
        },
        {
          heading: 'Real-Time Fraud Detection',
          text: 'Our advanced AI-powered system monitors transactions in real-time to detect and prevent fraudulent activities. If we detect any suspicious activity, we\'ll alert you immediately.',
          image: '/images/fraud-detection.svg'
        },
        {
          heading: 'End-to-End Encryption',
          text: 'All data transmitted through our platform is protected with end-to-end encryption. Your personal and financial information is never exposed, even to us.',
          image: '/images/encryption.svg'
        }
      ]
    },
    {
      id: 'inclusion',
      title: 'For Everyone',
      subtitle: 'Financial inclusion',
      description: 'How NEDApay is making banking accessible to all',
      icon: <FiUsers className="h-8 w-8" />,
      color: "from-yellow-500/90 to-yellow-600/90",
      content: [
        {
          heading: 'Banking for the Unbanked',
          text: 'NEDApay is designed to bring financial services to the unbanked population in Tanzania. All you need is a mobile phone to access a full range of banking services.',
          image: '/images/unbanked.svg'
        },
        {
          heading: 'Simple, User-Friendly Interface',
          text: 'Our app is designed to be simple and intuitive, making it accessible to everyone, regardless of their technical expertise or financial literacy.',
          image: '/images/user-friendly.svg'
        },
        {
          heading: 'Low Entry Barriers',
          text: 'We\'ve eliminated the barriers that traditionally prevent people from accessing financial services. No minimum balance requirements, no complex paperwork, and no need for a physical bank branch.',
          image: '/images/low-barriers.svg'
        },
        {
          heading: 'Financial Education',
          text: 'We\'re committed to improving financial literacy in Tanzania. Our app includes educational resources to help users make informed financial decisions.',
          image: '/images/education.svg'
        }
      ]
    }
  ];

  // Find the current topic or default to the first one
  const currentTopic = topics.find(t => t.id === topic) || topics[0];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-[#121212]"
    >
      {/* Header */}
      <header className="bg-[#151823] text-white p-4 shadow-md">
        <div className="flex items-center">
          <motion.button 
            onClick={() => navigate('/home')} 
            className="mr-3"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiArrowLeft className="h-6 w-6 text-gray-300" />
          </motion.button>
          <h1 className="text-xl font-bold">Learn</h1>
        </div>
      </header>

      <div className="flex-1 p-4 pb-20">
        {/* Topic Selection */}
        {!topic && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Learn about NEDApay</h2>
            <div className="space-y-4">
              {topics.map((topic) => (
                <motion.div
                  key={topic.id}
                  className="bg-[#1E1E2D] p-4 rounded-xl border border-gray-800/30 shadow-lg"
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/learn/${topic.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${topic.color} flex items-center justify-center mr-4`}>
                        {topic.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{topic.title}</h3>
                        <p className="text-gray-400 text-sm">{topic.description}</p>
                      </div>
                    </div>
                    <FiChevronRight className="text-gray-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Topic Content */}
        {topic && (
          <div>
            <div className="mb-6">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${currentTopic.color} flex items-center justify-center mb-4`}>
                {currentTopic.icon}
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">{currentTopic.title}</h2>
              <p className="text-xl text-gray-400">{currentTopic.subtitle}</p>
            </div>

            <div className="space-y-8 mb-8">
              {currentTopic.content.map((section, index) => (
                <motion.div
                  key={index}
                  className="bg-[#1E1E2D] p-6 rounded-xl border border-gray-800/30 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h3 className="text-xl font-bold text-white mb-3">{section.heading}</h3>
                  <p className="text-gray-300 leading-relaxed mb-4">{section.text}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-between">
              <motion.button
                onClick={() => navigate('/learn')}
                className="bg-[#1E1E2D] text-white px-6 py-3 rounded-lg flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiArrowLeft className="mr-2" /> Back to Topics
              </motion.button>
              
              <motion.button
                onClick={() => navigate('/home')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try NEDApay Now <FiArrowRight className="ml-2" />
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <motion.nav 
        className="fixed bottom-0 left-0 right-0 bg-[#1E1E2D] border-t border-gray-800/30 px-4 py-3 z-20"
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="flex justify-around">
          <Link to="/home" className="flex flex-col items-center text-gray-400 hover:text-gray-300 transition-colors duration-200">
            <FiHome className="h-6 w-6" />
            <span className="text-xs mt-1 font-medium">Home</span>
          </Link>
          
          <Link to="/transactions" className="flex flex-col items-center text-gray-400 hover:text-gray-300 transition-colors duration-200">
            <FiList className="h-6 w-6" />
            <span className="text-xs mt-1 font-medium">History</span>
          </Link>
          
          <Link to="/security" className="flex flex-col items-center text-gray-400 hover:text-gray-300 transition-colors duration-200">
            <FiLock className="h-6 w-6" />
            <span className="text-xs mt-1 font-medium">Security</span>
          </Link>
          
          <Link to="/settings" className="flex flex-col items-center text-gray-400 hover:text-gray-300 transition-colors duration-200">
            <FiSettings className="h-6 w-6" />
            <span className="text-xs mt-1 font-medium">Settings</span>
          </Link>
        </div>
      </motion.nav>
    </motion.div>
  );
};

export default LearnScreen;
