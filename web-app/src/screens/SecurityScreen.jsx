import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  FiLock, FiShield, FiFingerprint, FiEye, FiEyeOff, FiAlertTriangle, 
  FiCheckCircle, FiArrowLeft, FiHome, FiList, FiSettings, FiKey,
  FiSmartphone, FiRefreshCw, FiAlertOctagon, FiToggleRight, FiToggleLeft
} from 'react-icons/fi';

const SecurityScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [transactionNotifications, setTransactionNotifications] = useState(true);
  const [securityScore, setSecurityScore] = useState(0);
  const [activeTab, setActiveTab] = useState('pin');

  useEffect(() => {
    // Calculate security score based on enabled security features
    let score = 0;
    if (biometricEnabled) score += 25;
    if (twoFactorEnabled) score += 25;
    if (autoLockEnabled) score += 25;
    if (transactionNotifications) score += 25;
    setSecurityScore(score);
  }, [biometricEnabled, twoFactorEnabled, autoLockEnabled, transactionNotifications]);

  const handleChangePIN = async (e) => {
    e.preventDefault();
    
    if (newPin !== confirmPin) {
      setError('New PINs do not match');
      toast.error('New PINs do not match', { theme: 'dark' });
      return;
    }
    
    if (newPin.length < 4) {
      setError('PIN must be at least 4 digits');
      toast.error('PIN must be at least 4 digits', { theme: 'dark' });
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    // In a real app, you would call an API to change the PIN
    // For demo purposes, we'll just simulate a successful change
    setTimeout(() => {
      setSuccess('PIN changed successfully');
      toast.success('PIN changed successfully', { theme: 'dark' });
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setLoading(false);
    }, 1500);
  };

  const toggleSetting = (setting, value) => {
    switch(setting) {
      case 'biometric':
        setBiometricEnabled(value);
        toast.info(`Biometric authentication ${value ? 'enabled' : 'disabled'}`, { theme: 'dark' });
        break;
      case 'twoFactor':
        setTwoFactorEnabled(value);
        if (value) {
          toast.info('Two-factor authentication enabled', { theme: 'dark' });
        } else {
          toast.warn('Two-factor authentication disabled', { theme: 'dark' });
        }
        break;
      case 'autoLock':
        setAutoLockEnabled(value);
        toast.info(`Auto-lock ${value ? 'enabled' : 'disabled'}`, { theme: 'dark' });
        break;
      case 'notifications':
        setTransactionNotifications(value);
        toast.info(`Transaction notifications ${value ? 'enabled' : 'disabled'}`, { theme: 'dark' });
        break;
      default:
        break;
    }
  };

  const renderSecurityScore = () => {
    let scoreColor = 'text-red-500';
    let scoreText = 'Weak';
    
    if (securityScore >= 75) {
      scoreColor = 'text-green-500';
      scoreText = 'Strong';
    } else if (securityScore >= 50) {
      scoreColor = 'text-yellow-500';
      scoreText = 'Good';
    } else if (securityScore >= 25) {
      scoreColor = 'text-orange-500';
      scoreText = 'Fair';
    }
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-3">Security Score</h3>
        <div className="bg-[#1E1E2D] p-4 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Your score</span>
            <span className={`text-xl font-bold ${scoreColor}`}>{scoreText}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <motion.div 
              className={`h-2.5 rounded-full ${
                securityScore >= 75 ? 'bg-green-500' : 
                securityScore >= 50 ? 'bg-yellow-500' : 
                securityScore >= 25 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${securityScore}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="mt-3 text-xs text-gray-400">
            {securityScore < 100 && (
              <div className="flex items-center">
                <FiAlertTriangle className="text-yellow-500 mr-2" />
                <span>Enable all security features for maximum protection</span>
              </div>
            )}
            {securityScore === 100 && (
              <div className="flex items-center">
                <FiCheckCircle className="text-green-500 mr-2" />
                <span>Your account has maximum security</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderToggleSetting = (title, description, enabled, setting) => {
    return (
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex-1">
          <h4 className="text-white font-medium">{title}</h4>
          <p className="text-gray-400 text-sm mt-1">{description}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => toggleSetting(setting, !enabled)}
          className={`w-12 h-6 rounded-full flex items-center ${enabled ? 'bg-blue-500 justify-end' : 'bg-gray-600 justify-start'} px-1`}
        >
          <motion.div 
            layout
            className="w-4 h-4 bg-white rounded-full"
          />
        </motion.button>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-[#121212]"
    >
      {/* Header */}
      <header className="bg-[#151823] text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <motion.button 
              onClick={() => navigate('/home')} 
              className="mr-3"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiArrowLeft className="h-6 w-6 text-gray-300" />
            </motion.button>
            <h1 className="text-xl font-bold">Security Center</h1>
          </div>
          <div className="flex items-center space-x-2">
            <motion.div 
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                securityScore >= 75 ? 'bg-green-500/20 text-green-400' : 
                securityScore >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 
                'bg-red-500/20 text-red-400'
              }`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span>{securityScore}% Secure</span>
            </motion.div>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 pb-20">
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-6 flex items-start"
            >
              <FiAlertOctagon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-500/10 text-green-400 p-4 rounded-xl mb-6 flex items-start"
            >
              <FiCheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Security Score */}
        {renderSecurityScore()}
        
        {/* Security Tabs */}
        <div className="bg-[#1E1E2D] rounded-xl overflow-hidden mb-6 shadow-lg border border-gray-800/30">
          <div className="flex border-b border-gray-800">
            <button 
              className={`flex-1 py-4 px-4 text-center font-medium ${activeTab === 'pin' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
              onClick={() => setActiveTab('pin')}
            >
              <div className="flex flex-col items-center">
                <FiKey className="h-5 w-5 mb-1" />
                <span>PIN</span>
              </div>
            </button>
            <button 
              className={`flex-1 py-4 px-4 text-center font-medium ${activeTab === 'features' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
              onClick={() => setActiveTab('features')}
            >
              <div className="flex flex-col items-center">
                <FiShield className="h-5 w-5 mb-1" />
                <span>Features</span>
              </div>
            </button>
            <button 
              className={`flex-1 py-4 px-4 text-center font-medium ${activeTab === 'tips' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
              onClick={() => setActiveTab('tips')}
            >
              <div className="flex flex-col items-center">
                <FiAlertTriangle className="h-5 w-5 mb-1" />
                <span>Tips</span>
              </div>
            </button>
          </div>
          
          <div className="p-4">
            {activeTab === 'pin' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-bold text-white mb-4">Change PIN</h3>
                <form onSubmit={handleChangePIN} className="space-y-4">
                  <div className="relative">
                    <label className="block text-gray-400 mb-2 text-sm">Current PIN</label>
                    <div className="relative">
                      <input
                        type={showCurrentPin ? "text" : "password"}
                        value={currentPin}
                        onChange={(e) => setCurrentPin(e.target.value)}
                        placeholder="Enter current PIN"
                        className="w-full p-3 bg-[#252538] rounded-lg border border-gray-700 outline-none text-white"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        onClick={() => setShowCurrentPin(!showCurrentPin)}
                      >
                        {showCurrentPin ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">New PIN</label>
                    <div className="relative">
                      <input
                        type={showNewPin ? "text" : "password"}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        placeholder="Enter new PIN"
                        className="w-full p-3 bg-[#252538] rounded-lg border border-gray-700 outline-none text-white"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        onClick={() => setShowNewPin(!showNewPin)}
                      >
                        {showNewPin ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">Confirm New PIN</label>
                    <div className="relative">
                      <input
                        type={showConfirmPin ? "text" : "password"}
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value)}
                        placeholder="Confirm new PIN"
                        className="w-full p-3 bg-[#252538] rounded-lg border border-gray-700 outline-none text-white"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        onClick={() => setShowConfirmPin(!showConfirmPin)}
                      >
                        {showConfirmPin ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <motion.button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <FiRefreshCw className="animate-spin mr-2" />
                        Changing PIN...
                      </>
                    ) : (
                      <>
                        <FiKey className="mr-2" />
                        Change PIN
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}
            
            {activeTab === 'features' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-bold text-white mb-4">Security Features</h3>
                <div className="divide-y divide-gray-800">
                  {renderToggleSetting(
                    "Biometric Authentication",
                    "Use fingerprint or face recognition to access your wallet",
                    biometricEnabled,
                    "biometric"
                  )}
                  
                  {renderToggleSetting(
                    "Two-Factor Authentication",
                    "Require a verification code in addition to your PIN",
                    twoFactorEnabled,
                    "twoFactor"
                  )}
                  
                  {renderToggleSetting(
                    "Auto-Lock",
                    "Automatically lock your wallet after 5 minutes of inactivity",
                    autoLockEnabled,
                    "autoLock"
                  )}
                  
                  {renderToggleSetting(
                    "Transaction Notifications",
                    "Receive notifications for all wallet transactions",
                    transactionNotifications,
                    "notifications"
                  )}
                </div>
                
                <div className="mt-6">
                  <motion.button
                    className="w-full bg-red-600/20 text-red-400 font-medium py-3 px-4 rounded-lg hover:bg-red-600/30 transition duration-200 flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toast.info('Device deactivation feature coming soon', { theme: 'dark' })}
                  >
                    <FiSmartphone className="mr-2" />
                    Deactivate This Device
                  </motion.button>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'tips' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-bold text-white mb-4">Security Tips</h3>
                
                <div className="space-y-4">
                  <div className="flex bg-blue-500/10 p-4 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-4 flex-shrink-0">
                      <FiLock className="text-blue-400 h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-1">Protect Your PIN</h4>
                      <p className="text-gray-400 text-sm">Never share your PIN with anyone, including NEDApay support staff.</p>
                    </div>
                  </div>
                  
                  <div className="flex bg-green-500/10 p-4 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-4 flex-shrink-0">
                      <FiKey className="text-green-400 h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-1">Use Strong PINs</h4>
                      <p className="text-gray-400 text-sm">Choose a unique PIN that you don't use for other services.</p>
                    </div>
                  </div>
                  
                  <div className="flex bg-purple-500/10 p-4 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-4 flex-shrink-0">
                      <FiRefreshCw className="text-purple-400 h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-1">Regular Updates</h4>
                      <p className="text-gray-400 text-sm">Change your PIN regularly to maintain security.</p>
                    </div>
                  </div>
                  
                  <div className="flex bg-yellow-500/10 p-4 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mr-4 flex-shrink-0">
                      <FiAlertTriangle className="text-yellow-400 h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-1">Verify Transactions</h4>
                      <p className="text-gray-400 text-sm">Always verify transaction details before confirming payments.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
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
          
          <Link to="/security" className="flex flex-col items-center text-blue-500">
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

export default SecurityScreen;
