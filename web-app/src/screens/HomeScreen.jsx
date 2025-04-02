import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTransaction } from '../contexts/TransactionContext';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  FiSend, FiDownload, FiRefreshCw, FiClock, FiArrowUpRight, 
  FiArrowDownLeft, FiChevronRight, FiHome, FiList, FiLock, FiSettings,
  FiPlus, FiDollarSign, FiCreditCard, FiTrendingUp, FiActivity,
  FiInfo, FiShield, FiGlobe, FiUsers, FiArrowRight
} from 'react-icons/fi';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const HomeScreen = () => {
  const { user, logout } = useAuth();
  const { 
    transactions, 
    isLoading, 
    refreshTransactions 
  } = useTransaction();
  const navigate = useNavigate();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showBalanceChart, setShowBalanceChart] = useState(false);
  const [balanceHistory, setBalanceHistory] = useState([]);
  const [activeNav, setActiveNav] = useState('home');
  const [navOpen, setNavOpen] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const dragControls = useDragControls();
  const navRef = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    // Generate mock balance history data
    const generateBalanceHistory = () => {
      const today = new Date();
      const data = [];
      let balance = user?.iTZSAmount || 50000;
      
      // Generate data for the last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Random fluctuation between -5% and +8%
        const fluctuation = balance * (Math.random() * 0.13 - 0.05);
        balance += fluctuation;
        
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          balance: Math.round(balance),
        });
      }
      
      setBalanceHistory(data);
    };
    
    generateBalanceHistory();
  }, [user?.iTZSAmount]);

  const handleRefresh = () => {
    setRefreshing(true);
    refreshTransactions();
    toast.info('Refreshing transaction data...', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
    
    // Simulate a delay for the refresh animation
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Wallet data refreshed successfully', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }, 1500);
  };

  const formatDate = (date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown date';
    }
  };

  const formatAmount = (amount, incoming) => {
    return `${incoming ? '+' : '-'} ${amount.toLocaleString()} iTZS`;
  };

  const getTransactionIcon = (tx) => {
    if (tx.incoming) {
      return <FiArrowDownLeft className="h-5 w-5" />;
    } else {
      return <FiArrowUpRight className="h-5 w-5" />;
    }
  };

  // Handle swipe gestures for navigation
  const handleDragEnd = (event, info) => {
    if (info.offset.y > 50) {
      setNavOpen(true);
    } else if (info.offset.y < -50) {
      setNavOpen(false);
    }
  };

  const handleNavClick = (nav) => {
    setActiveNav(nav);
    setNavOpen(false);
    
    // Navigate to the appropriate route
    if (nav !== 'home') {
      navigate(`/${nav}`);
    }
    
    // Add haptic feedback if supported
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  // Educational cards data
  const educationalCards = [
    {
      id: 1,
      title: "Send it.",
      subtitle: "Spend it. Stash it.",
      description: "Send money instantly to anyone in Tanzania",
      descriptionSwahili: "Tuma pesa mara moja kwa mtu yeyote",
      icon: <FiSend className="h-8 w-8" />,
      color: "from-blue-500/90 to-blue-600/90",
      textColor: "text-blue-100",
      learnPath: "send-money"
    },
    {
      id: 2,
      title: "No hidden fees",
      subtitle: "Transparent transactions",
      description: "Zero costs on all your payments",
      descriptionSwahili: "Hakuna gharama zozote zilizofichwa",
      icon: <FiShield className="h-8 w-8" />,
      color: "from-green-500/90 to-green-600/90",
      textColor: "text-green-100",
      learnPath: "no-fees"
    },
    {
      id: 3,
      title: "Secure & Fast",
      subtitle: "Blockchain-powered",
      description: "Advanced security for your money",
      descriptionSwahili: "Usalama wa hali ya juu",
      icon: <FiLock className="h-8 w-8" />,
      color: "from-purple-500/90 to-purple-600/90",
      textColor: "text-purple-100",
      learnPath: "security"
    },
    {
      id: 4,
      title: "For Everyone",
      subtitle: "Financial inclusion",
      description: "Banking for all Tanzanians",
      descriptionSwahili: "Huduma za benki kwa wote",
      icon: <FiUsers className="h-8 w-8" />,
      color: "from-yellow-500/90 to-yellow-600/90",
      textColor: "text-yellow-100",
      learnPath: "inclusion"
    }
  ];

  // Handle card scroll
  const handleCardScroll = (index) => {
    setActiveCard(index);
    if (cardsRef.current) {
      const cardWidth = cardsRef.current.offsetWidth;
      cardsRef.current.scrollTo({
        left: index * (cardWidth + 16), // card width + gap
        behavior: 'smooth'
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col bg-[#121212] pb-8"
    >
      {/* Gesture-based Top Navigation */}
      <motion.div 
        className="fixed top-0 left-0 right-0 z-30 bg-[#151823] shadow-lg"
        initial={{ y: navOpen ? 0 : -150 }}
        animate={{ y: navOpen ? 0 : -150 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <div className="p-5">
          <div className="grid grid-cols-4 gap-4">
            <motion.div 
              className={`flex flex-col items-center p-3 rounded-xl ${activeNav === 'home' ? 'bg-blue-500/20' : 'bg-[#1E1E2D]'}`}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleNavClick('home')}
            >
              <FiHome className={`h-6 w-6 ${activeNav === 'home' ? 'text-blue-400' : 'text-gray-400'}`} />
              <span className={`text-xs mt-1 font-medium ${activeNav === 'home' ? 'text-blue-400' : 'text-gray-400'}`}>Home</span>
            </motion.div>
            
            <motion.div 
              className={`flex flex-col items-center p-3 rounded-xl ${activeNav === 'transactions' ? 'bg-blue-500/20' : 'bg-[#1E1E2D]'}`}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleNavClick('transactions')}
            >
              <FiList className={`h-6 w-6 ${activeNav === 'transactions' ? 'text-blue-400' : 'text-gray-400'}`} />
              <span className={`text-xs mt-1 font-medium ${activeNav === 'transactions' ? 'text-blue-400' : 'text-gray-400'}`}>History</span>
            </motion.div>
            
            <motion.div 
              className={`flex flex-col items-center p-3 rounded-xl ${activeNav === 'security' ? 'bg-blue-500/20' : 'bg-[#1E1E2D]'}`}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleNavClick('security')}
            >
              <FiLock className={`h-6 w-6 ${activeNav === 'security' ? 'text-blue-400' : 'text-gray-400'}`} />
              <span className={`text-xs mt-1 font-medium ${activeNav === 'security' ? 'text-blue-400' : 'text-gray-400'}`}>Security</span>
            </motion.div>
            
            <motion.div 
              className={`flex flex-col items-center p-3 rounded-xl ${activeNav === 'settings' ? 'bg-blue-500/20' : 'bg-[#1E1E2D]'}`}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleNavClick('settings')}
            >
              <FiSettings className={`h-6 w-6 ${activeNav === 'settings' ? 'text-blue-400' : 'text-gray-400'}`} />
              <span className={`text-xs mt-1 font-medium ${activeNav === 'settings' ? 'text-blue-400' : 'text-gray-400'}`}>Settings</span>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* Navigation Pull Handle */}
      <motion.div 
        className="fixed top-0 left-0 right-0 z-20 flex justify-center"
        drag="y"
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 150 }}
        onDragEnd={handleDragEnd}
        ref={navRef}
      >
        <motion.div 
          className="w-12 h-1.5 bg-gray-600 rounded-full mt-1.5"
          whileTap={{ scale: 0.9 }}
        />
      </motion.div>
      
      {/* Main Content with top padding for the navigation handle */}
      <div className="pt-4">
        {/* Header with Balance */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-br from-[#151823] to-[#1E2235] p-6 rounded-b-[2rem]"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          {/* Simplified background elements with reduced animation */}
          <div className="absolute inset-0 overflow-hidden opacity-50">
            <div 
              className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl"
            />
            <div
              className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"
            />
          </div>
          
          {/* NEDApay Logo and Demo Wallet Indicator */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="bg-[#1E2235] p-3 rounded-xl mr-3 flex items-center justify-center">
                <FiCreditCard className="text-blue-500 h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">NEDApay</h1>
                <div className="bg-blue-800/70 text-blue-200 text-xs font-medium px-3 py-1 rounded-full mt-1 inline-block">
                  Demo Wallet
                </div>
              </div>
            </div>
            
            <motion.button 
              onClick={() => navigate('/settings')} 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-[#2A2A3C] rounded-full"
            >
              <FiSettings className="h-5 w-5 text-gray-300" />
            </motion.button>
          </div>
          
          <div className="text-center mb-4">
            <p className="text-gray-400 text-sm mb-2">Current Balance</p>
            <motion.h2 
              className="text-5xl md:text-6xl font-bold text-white"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {user?.iTZSAmount?.toLocaleString() || '50,000'}
              <span className="text-lg ml-2 text-blue-500 font-medium">iTZS</span>
            </motion.h2>
            
            <motion.button
              onClick={() => setShowBalanceChart(!showBalanceChart)}
              className="text-blue-500 text-sm mt-3 flex items-center mx-auto font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiActivity className="mr-2" /> 
              {showBalanceChart ? 'Hide Chart' : 'Show Balance History'}
            </motion.button>
          </div>
          
          <AnimatePresence>
            {showBalanceChart && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 180, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 overflow-hidden"
              >
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart
                    data={balanceHistory}
                    margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0084FF" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0084FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#94A3B8', fontSize: 10 }}
                      axisLine={{ stroke: '#334155' }}
                      tickLine={false}
                    />
                    <YAxis 
                      hide={true}
                      domain={['dataMin - 5000', 'dataMax + 5000']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1E293B', 
                        border: 'none',
                        borderRadius: '0.75rem',
                        color: '#F1F5F9',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                      }}
                      formatter={(value) => [`${value.toLocaleString()} iTZS`, 'Balance']}
                      labelStyle={{ color: '#94A3B8' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#0084FF" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorBalance)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="px-4 mt-6 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="bg-[#1E1E2D] p-5 rounded-2xl shadow-lg border border-gray-800/30">
            <div className="grid grid-cols-4 gap-4">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center"
                onClick={() => navigate('/send')}
              >
                <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 mb-2 shadow-inner shadow-blue-500/5">
                  <FiSend className="h-6 w-6" />
                </div>
                <span className="text-sm text-gray-300 font-medium">Send</span>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center"
                onClick={() => navigate('/receive')}
              >
                <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-2 shadow-inner shadow-green-500/5">
                  <FiDownload className="h-6 w-6" />
                </div>
                <span className="text-sm text-gray-300 font-medium">Receive</span>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center"
                onClick={() => navigate('/service-payment')}
              >
                <div className="w-14 h-14 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 mb-2 shadow-inner shadow-yellow-500/5">
                  <FiGlobe className="h-6 w-6" />
                </div>
                <span className="text-sm text-gray-300 font-medium">Services</span>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center"
                onClick={() => toast.info('Add funds feature coming soon!', { theme: 'dark' })}
              >
                <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 mb-2 shadow-inner shadow-purple-500/5">
                  <FiPlus className="h-6 w-6" />
                </div>
                <span className="text-sm text-gray-300 font-medium">Add Funds</span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Educational Cards Section - "More for your finances" */}
        <motion.div 
          className="flex-1 px-4 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-1">NEDApay</h3>
          </div>
          
          <div className="relative">
            {/* Scrollable Cards - Apple-style design */}
            <div 
              className="flex overflow-x-auto pb-6 hide-scrollbar snap-x snap-mandatory"
              ref={cardsRef}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {educationalCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  className={`min-w-[300px] mr-4 rounded-2xl overflow-hidden snap-center shadow-lg relative`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 * index, duration: 0.3 }}
                  whileHover={{ y: -3 }}
                >
                  {/* Card background with gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color}`}></div>
                  
                  {/* Card content with Apple-inspired typography */}
                  <div className="relative p-6 flex flex-col h-full justify-between">
                    <div>
                      {/* Icon in circle */}
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-5">
                        {card.icon}
                      </div>
                      
                      {/* Main title - large and bold */}
                      <h4 className="text-3xl font-bold text-white leading-tight mb-1">{card.title}</h4>
                      
                      {/* Subtitle - medium size */}
                      <p className="text-xl font-medium text-white/90 mb-4">{card.subtitle}</p>
                    </div>
                    
                    <div>
                      {/* Description - smaller and lighter */}
                      <p className="text-base text-white/80 mb-1">{card.description}</p>
                      <p className={`text-sm ${card.textColor} font-medium`}>{card.descriptionSwahili}</p>
                      
                      {/* Learn more link at bottom */}
                      <div className="mt-4 flex justify-end">
                        <Link to={`/learn/${card.learnPath}`} className="text-white/90 text-sm font-medium flex items-center">
                          Learn more <FiArrowRight className="ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Card Indicators */}
            <div className="flex justify-center mt-2">
              {educationalCards.map((_, index) => (
                <motion.button
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full mx-1 ${activeCard === index ? 'bg-blue-500' : 'bg-gray-600'}`}
                  onClick={() => handleCardScroll(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Transactions Button */}
        <motion.div 
          className="px-4 mt-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Link 
            to="/settings" 
            className="flex items-center justify-between w-full p-4 bg-[#1E1E2D] hover:bg-[#252538] text-white rounded-xl transition-all duration-200 border border-gray-800/30"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-3">
                <FiSettings className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-medium">Update Account</h4>
                <p className="text-xs text-gray-400">Manage your profile and settings</p>
              </div>
            </div>
            <FiChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HomeScreen;
