const CryptoJS = require('crypto-js');
const config = require('../config');

// Get encryption key from config
const { encryptionKey } = config.security;

/**
 * Encrypt sensitive data
 * @param {string} data - Data to encrypt
 * @returns {string} - Encrypted data
 */
function encryptData(data) {
  return CryptoJS.AES.encrypt(data, encryptionKey).toString();
}

/**
 * Decrypt sensitive data
 * @param {string} encryptedData - Encrypted data
 * @returns {string} - Decrypted data
 */
function decryptData(encryptedData) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

module.exports = {
  encryptData,
  decryptData
};
