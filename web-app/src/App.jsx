import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TransactionProvider } from './contexts/TransactionContext';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence, motion } from 'framer-motion';
import { FiHome, FiAlertCircle } from 'react-icons/fi';

// Import screens
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import SendScreen from './screens/SendScreen';
import ReceiveScreen from './screens/ReceiveScreen';
import ScanScreen from './screens/ScanScreen';
import TransactionHistoryScreen from './screens/TransactionHistoryScreen';
import SecurityScreen from './screens/SecurityScreen';
import SettingsScreen from './screens/SettingsScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import LearnScreen from './screens/LearnScreen';
import ServicePaymentScreen from './screens/ServicePaymentScreen';
import AboutScreen from './screens/AboutScreen';
import HelpScreen from './screens/HelpScreen';
import TermsScreen from './screens/TermsScreen';

// Loading component
const LoadingScreen = () => (
  <motion.div 
    className="flex items-center justify-center h-screen bg-gray-900"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-500/30 rounded-full"></div>
        <motion.div 
          className="absolute top-0 left-0 w-16 h-16 border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        ></motion.div>
      </div>
      <motion.p 
        className="mt-4 text-gray-400 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Loading NEDApay...
      </motion.p>
    </div>
  </motion.div>
);

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Show loading indicator while auth state is being determined
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public route component (redirects to home if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Show loading indicator while auth state is being determined
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (user) {
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

// Not Found component
const NotFound = () => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center h-screen bg-gray-900 text-gray-100 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <FiAlertCircle className="text-red-500 w-16 h-16 mb-4" />
      <motion.h1 
        className="text-3xl font-bold mb-4 text-blue-400"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Page Not Found
      </motion.h1>
      <motion.p 
        className="mb-6 text-gray-400 text-center max-w-md"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        The page you are looking for doesn't exist or has been moved.
      </motion.p>
      <motion.button 
        onClick={() => window.location.href = '/'}
        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg flex items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiHome className="mr-2" />
        Go to Home
      </motion.button>
    </motion.div>
  );
};

function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <Router>
          <Suspense fallback={<LoadingScreen />}>
            <AnimatePresence mode="wait">
              <Routes>
                {/* Public routes */}
                <Route 
                  path="/" 
                  element={
                    <PublicRoute>
                      <WelcomeScreen />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <LoginScreen />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/register" 
                  element={
                    <PublicRoute>
                      <RegisterScreen />
                    </PublicRoute>
                  } 
                />
                
                {/* Protected routes */}
                <Route 
                  path="/home" 
                  element={
                    <ProtectedRoute>
                      <HomeScreen />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/send" 
                  element={
                    <ProtectedRoute>
                      <SendScreen />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/receive" 
                  element={
                    <ProtectedRoute>
                      <ReceiveScreen />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/scan" 
                  element={
                    <ProtectedRoute>
                      <ScanScreen />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/service-payment" 
                  element={
                    <ProtectedRoute>
                      <ServicePaymentScreen />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/transactions" 
                  element={
                    <ProtectedRoute>
                      <TransactionHistoryScreen />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/security" 
                  element={
                    <ProtectedRoute>
                      <SecurityScreen />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <SettingsScreen />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <EditProfileScreen />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Learn routes */}
                <Route 
                  path="/learn" 
                  element={
                    <ProtectedRoute>
                      <LearnScreen />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/learn/:topic" 
                  element={
                    <ProtectedRoute>
                      <LearnScreen />
                    </ProtectedRoute>
                  } 
                />
                
                {/* About & Help routes */}
                <Route 
                  path="/about" 
                  element={
                    <ProtectedRoute>
                      <AboutScreen />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/help" 
                  element={
                    <ProtectedRoute>
                      <HelpScreen />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/terms" 
                  element={
                    <ProtectedRoute>
                      <TermsScreen />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Fallback route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </Router>
        <ToastContainer
          position="bottom-right"
          autoClose={2000}
          hideProgressBar={true}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover={false}
          theme="dark"
          limit={3}
          transition={Slide}
        />
      </TransactionProvider>
    </AuthProvider>
  );
}

export default App;
