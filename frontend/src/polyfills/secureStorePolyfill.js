/**
 * SecureStore polyfill for web
 * This provides localStorage-based implementations of the SecureStore methods
 * for the NEDApay wallet when running in a web browser
 */

// Use a prefix to avoid collisions with other localStorage items
const STORAGE_PREFIX = 'nedapay_secure_';

export async function getItemAsync(key) {
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.error('SecureStore getItemAsync error:', error);
    return null;
  }
}

export async function setItemAsync(key, value) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, value);
    return true;
  } catch (error) {
    console.error('SecureStore setItemAsync error:', error);
    return false;
  }
}

export async function deleteItemAsync(key) {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    return true;
  } catch (error) {
    console.error('SecureStore deleteItemAsync error:', error);
    return false;
  }
}

// Export the methods as the default object
export default {
  getItemAsync,
  setItemAsync,
  deleteItemAsync
};
