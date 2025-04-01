import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SettingsScreen = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Set to true by default for our dark theme
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [confirmLogout, setConfirmLogout] = useState(false);
  
  // Mock user data for demo
  const mockUser = {
    name: 'John Doe',
    phone: '+255744123456',
    email: 'john.doe@example.com',
    stellarPublicKey: 'GAXHJ...UXLM',
    joinDate: '2023-09-15'
  };

  useEffect(() => {
    // Load user settings from localStorage or API in a real app
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setNotifications(settings.notifications ?? true);
        setBiometrics(settings.biometrics ?? false);
        setDarkMode(settings.darkMode ?? true);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const saveSettings = (key, value) => {
    try {
      // In a real app, this would be saved to an API
      const savedSettings = localStorage.getItem('userSettings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      settings[key] = value;
      localStorage.setItem('userSettings', JSON.stringify(settings));
      showToastMessage(`${key.charAt(0).toUpperCase() + key.slice(1)} setting updated`);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };
  
  const handleLogout = async () => {
    if (confirmLogout) {
      showToastMessage('Logging out...');
      setTimeout(async () => {
        await logout();
        navigate('/');
      }, 1000);
    } else {
      setConfirmLogout(true);
      setTimeout(() => {
        setConfirmLogout(false);
      }, 3000);
    }
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleToggleNotifications = () => {
    setNotifications(!notifications);
    saveSettings('notifications', !notifications);
  };

  const handleToggleBiometrics = () => {
    setBiometrics(!biometrics);
    saveSettings('biometrics', !biometrics);
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    saveSettings('darkMode', !darkMode);
    // In a real app, this would trigger a theme change in the app
    showToastMessage(`Dark mode ${!darkMode ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-dark text-text-primary pb-16">
      {/* Toast Notification */}
      {showToast && (
        <div className="toast-container">
          <div className="toast toast-success slide-in">
            <div className="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="wallet-header" style={{ paddingBottom: 'var(--spacing-md)' }}>
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/home')} 
            className="mr-3 btn-icon btn-secondary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <div className="flex-1 p-4">
        {/* Profile Section */}
        <div className="card p-6 mb-6 slide-up">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold">{user?.name || mockUser.name}</h2>
              <p className="text-text-secondary">{user?.phoneNumber || mockUser.phone}</p>
              {(user?.email || mockUser.email) && (
                <p className="text-text-secondary text-sm">{user?.email || mockUser.email}</p>
              )}
            </div>
          </div>
          
          <button
            onClick={() => navigate('/profile')}
            className="btn btn-secondary w-full mt-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Profile
          </button>
        </div>
        
        {/* Settings List */}
        <div className="card overflow-hidden mb-6 slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="p-4 border-b border-border">
            <h3 className="font-medium">App Settings</h3>
          </div>
          
          {/* Notifications */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <span>Notifications</span>
                <p className="text-xs text-text-secondary mt-1">Receive payment and security alerts</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={notifications}
                onChange={handleToggleNotifications}
              />
              <div className="w-11 h-6 bg-background-card-hover peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          {/* Biometric Authentication */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </div>
              <div>
                <span>Biometric Authentication</span>
                <p className="text-xs text-text-secondary mt-1">Use fingerprint or face ID to login</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={biometrics}
                onChange={handleToggleBiometrics}
              />
              <div className="w-11 h-6 bg-background-card-hover peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          {/* Dark Mode */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <div>
                <span>Dark Mode</span>
                <p className="text-xs text-text-secondary mt-1">Toggle dark/light theme</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={darkMode}
                onChange={handleToggleDarkMode}
              />
              <div className="w-11 h-6 bg-background-card-hover peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
        
        {/* Security Settings */}
        <div className="card overflow-hidden mb-6 slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="p-4 border-b border-border">
            <h3 className="font-medium">Security</h3>
          </div>
          
          <Link to="/security/change-pin" className="flex items-center justify-between p-4 border-b border-border hover:bg-background-card-hover transition-colors">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <span>Change PIN</span>
                <p className="text-xs text-text-secondary mt-1">Update your security PIN</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          
          <Link to="/security/devices" className="flex items-center justify-between p-4 border-b border-border hover:bg-background-card-hover transition-colors">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span>Manage Devices</span>
                <p className="text-xs text-text-secondary mt-1">View and remove connected devices</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <div className="flex items-center justify-between p-4 hover:bg-background-card-hover transition-colors cursor-pointer" onClick={() => navigate('/security/key')}>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <span>Stellar Key</span>
                <p className="text-xs text-text-secondary mt-1">View your Stellar public key</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        
        {/* About & Help */}
        <div className="card overflow-hidden mb-6 slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="p-4 border-b border-border">
            <h3 className="font-medium">About & Help</h3>
          </div>
          
          <Link to="/about" className="flex items-center justify-between p-4 border-b border-border hover:bg-background-card-hover transition-colors">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>About NEDApay</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          
          <Link to="/help" className="flex items-center justify-between p-4 border-b border-border hover:bg-background-card-hover transition-colors">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>Help & Support</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          
          <Link to="/terms" className="flex items-center justify-between p-4 border-b border-border hover:bg-background-card-hover transition-colors">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-500/20 rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span>Terms & Privacy</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          
          <div className="p-4 text-center text-text-secondary text-xs">
            <p>NEDApay Wallet v1.0.0</p>
            <p className="mt-1"> 2025 NEDApay. All rights reserved.</p>
          </div>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`btn w-full ${confirmLogout ? 'btn-error' : 'btn-secondary'} slide-up`}
          style={{ animationDelay: '0.4s' }}
        >
          {confirmLogout ? 'Confirm Logout' : 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default SettingsScreen;
