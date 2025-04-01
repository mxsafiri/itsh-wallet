import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TransactionProvider } from './contexts/TransactionContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

// Loading component
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen bg-green-600">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
  </div>
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
    <div className="flex flex-col items-center justify-center h-screen bg-green-600 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
      <p className="mb-6">The page you are looking for doesn't exist or has been moved.</p>
      <button 
        onClick={() => window.location.href = '/'}
        className="bg-white text-green-600 font-bold py-2 px-6 rounded-full"
      >
        Go to Home
      </button>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <Router>
          <Suspense fallback={<LoadingScreen />}>
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
              
              {/* Fallback route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </TransactionProvider>
    </AuthProvider>
  );
}

export default App;
