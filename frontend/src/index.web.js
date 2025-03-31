import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from '../App';

// Debug logging for web environment
console.log('NEDApay Web Initializing...');

// Polyfill global.crypto for web
if (Platform.OS === 'web' && !window.crypto) {
  console.log('Polyfilling window.crypto');
  window.crypto = {
    getRandomValues: function(buffer) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = Math.floor(Math.random() * 256);
      }
      return buffer;
    }
  };
}

// Handle SecureStore polyfill for web
if (Platform.OS === 'web') {
  console.log('Setting up SecureStore polyfill for web');
  
  // Override expo-secure-store for web
  const STORAGE_PREFIX = 'nedapay_secure_';
  
  if (!global.expo) global.expo = {};
  if (!global.expo.modules) global.expo.modules = {};
  
  global.expo.modules.securestore = {
    getValueWithKeyAsync: async (key) => {
      const value = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      console.log(`SecureStore GET: ${key} = ${value}`);
      return value;
    },
    setValueWithKeyAsync: async (key, value) => {
      console.log(`SecureStore SET: ${key} = ${value}`);
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, value);
      return true;
    },
    deleteValueWithKeyAsync: async (key) => {
      console.log(`SecureStore DELETE: ${key}`);
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      return true;
    }
  };
}

// Force the app to show the auth screen for web demo
if (Platform.OS === 'web') {
  localStorage.removeItem('nedapay_secure_userToken');
  localStorage.removeItem('nedapay_secure_userData');
  console.log('Reset auth state for web demo');
}

// Register the root component
console.log('Registering App component');
registerRootComponent(App);
