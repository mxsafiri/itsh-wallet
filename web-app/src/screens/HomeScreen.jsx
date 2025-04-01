import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTransaction } from '../contexts/TransactionContext';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSend, FiDownload, FiRefreshCw, FiClock, FiArrowUpRight, 
  FiArrowDownLeft, FiChevronRight, FiHome, FiList, FiLock, FiSettings,
  FiPlus, FiDollarSign, FiCreditCard, FiTrendingUp
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-background pb-16"
    >
      {/* Header with Balance */}
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-br from-background to-secondary-light p-6 rounded-b-3xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary/20 p-2 rounded-xl mr-3"
            >
              <FiCreditCard className="text-primary h-6 w-6" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-text">NEDApay</h1>
              <div className="badge badge-primary mt-1">Demo Wallet</div>
            </div>
          </div>
          
          <motion.button 
            onClick={logout} 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-secondary btn-icon"
          >
            <FiSettings className="h-5 w-5" />
          </motion.button>
        </div>
        
        <div className="text-center mb-2">
          <p className="text-text-secondary text-sm mb-1">Current Balance</p>
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-gradient"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {user?.iTZSAmount?.toLocaleString() || '0'}
            <span className="text-lg ml-1 text-text-secondary">iTZS</span>
          </motion.h2>
          
          <motion.button
            onClick={() => setShowBalanceChart(!showBalanceChart)}
            className="text-primary text-xs mt-2 flex items-center mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiTrendingUp className="mr-1" /> 
            {showBalanceChart ? 'Hide Chart' : 'Show Balance History'}
          </motion.button>
        </div>
        
        <AnimatePresence>
          {showBalanceChart && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 150, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 overflow-hidden"
            >
              <ResponsiveContainer width="100%" height={150}>
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
                      borderRadius: '0.5rem',
                      color: '#F1F5F9'
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
        className="px-4 -mt-6 z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="card glass p-4 shadow-glow">
          <div className="grid grid-cols-4 gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center"
              onClick={() => navigate('/send')}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                <FiSend className="h-5 w-5" />
              </div>
              <span className="text-xs text-text-secondary">Send</span>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center"
              onClick={() => navigate('/receive')}
            >
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success mb-2">
                <FiDownload className="h-5 w-5" />
              </div>
              <span className="text-xs text-text-secondary">Receive</span>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center"
              onClick={() => navigate('/scan')}
            >
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center text-warning mb-2">
                <FiCreditCard className="h-5 w-5" />
              </div>
              <span className="text-xs text-text-secondary">Scan</span>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center"
              onClick={() => toast.info('Add funds feature coming soon!', { theme: 'dark' })}
            >
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-2">
                <FiPlus className="h-5 w-5" />
              </div>
              <span className="text-xs text-text-secondary">Add</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Transaction History */}
      <motion.div 
        className="flex-1 px-4 mt-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-text">Recent Transactions</h3>
          <motion.button 
            onClick={handleRefresh}
            disabled={refreshing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-icon btn-secondary"
          >
            <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
        
        <div className="card">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-background-card flex items-center justify-center mb-4 animate-pulse-slow">
                <FiClock className="h-8 w-8 text-text-secondary" />
              </div>
              <p className="text-text-secondary mb-3">No transactions yet</p>
              <motion.button 
                onClick={() => navigate('/send')} 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary"
              >
                <FiSend className="mr-2" /> Make your first transaction
              </motion.button>
            </div>
          ) : (
            <div>
              {transactions.slice(0, 5).map((tx, index) => (
                <motion.div 
                  key={tx.id} 
                  className="transaction-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${tx.incoming ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                      {getTransactionIcon(tx)}
                    </div>
                    <div>
                      <p className="font-medium text-text">{tx.memo || (tx.incoming ? 'Received Payment' : 'Sent Payment')}</p>
                      <div className="flex items-center text-xs text-text-secondary">
                        <FiClock className="mr-1 h-3 w-3" /> {formatDate(tx.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={tx.incoming ? 'amount-positive' : 'amount-negative'}>
                      {formatAmount(tx.amount, tx.incoming)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      tx.status === 'completed' ? 'bg-success/10 text-success' : 
                      tx.status === 'pending' ? 'bg-warning/10 text-warning' : 
                      'bg-error/10 text-error'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </motion.div>
              ))}
              
              {transactions.length > 5 && (
                <motion.div 
                  className="mt-4 text-center"
                  whileHover={{ scale: 1.02 }}
                >
                  <Link 
                    to="/transactions" 
                    className="btn btn-secondary w-full"
                  >
                    View all transactions
                    <FiChevronRight className="ml-1" />
                  </Link>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Bottom Navigation */}
      <motion.nav 
        className="fixed bottom-0 left-0 right-0 bg-background-card border-t border-dark-700/30 px-4 py-2 z-20"
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="flex justify-around">
          <Link to="/home" className="nav-item active">
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

export default HomeScreen;
