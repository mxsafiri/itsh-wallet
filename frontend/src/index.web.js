import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from '../App';

// Polyfill global.crypto for web
if (Platform.OS === 'web' && !window.crypto) {
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
  const secureStoreItems = {};
  
  // Override SecureStore methods for web
  if (!global.expo) global.expo = {};
  if (!global.expo.modules) global.expo.modules = {};
  global.expo.modules.securestore = {
    getValueWithKeyAsync: async (key) => {
      return localStorage.getItem(key);
    },
    setValueWithKeyAsync: async (key, value) => {
      localStorage.setItem(key, value);
      return true;
    },
    deleteValueWithKeyAsync: async (key) => {
      localStorage.removeItem(key);
      return true;
    }
  };
}

// Register the root component
registerRootComponent(App);
