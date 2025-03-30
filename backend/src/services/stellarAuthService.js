const StellarSdk = require('stellar-sdk');
const crypto = require('crypto');

/**
 * Service for handling Stellar SEP-0010 authentication
 */
class StellarAuthService {
  constructor() {
    this.challenges = new Map(); // Store active challenges
    this.challengeExpiry = 5 * 60 * 1000; // 5 minutes in milliseconds
  }

  /**
   * Generate a challenge for a specific Stellar account
   * @param {string} stellarPublicKey - The Stellar account public key
   * @returns {Object} Challenge details
   */
  generateChallenge(stellarPublicKey) {
    // Generate a random nonce
    const nonce = crypto.randomBytes(32).toString('base64');
    
    // Create a challenge string
    const challenge = `iTZS-auth-${nonce}-${Date.now()}`;
    
    // Store the challenge with expiry time
    const expiresAt = Date.now() + this.challengeExpiry;
    this.challenges.set(stellarPublicKey, {
      challenge,
      expiresAt
    });
    
    return {
      stellarPublicKey,
      challenge,
      expiresAt
    };
  }

  /**
   * Verify a signed challenge
   * @param {string} stellarPublicKey - The Stellar account public key
   * @param {string} challenge - The challenge string
   * @param {string} signature - The signature in base64 format
   * @returns {boolean} Whether the signature is valid
   */
  verifyChallenge(stellarPublicKey, challenge, signature) {
    // Check if we have an active challenge for this account
    const storedChallenge = this.challenges.get(stellarPublicKey);
    
    if (!storedChallenge) {
      console.log('No active challenge found for this account');
      return false;
    }
    
    // Check if challenge has expired
    if (Date.now() > storedChallenge.expiresAt) {
      console.log('Challenge has expired');
      this.challenges.delete(stellarPublicKey);
      return false;
    }
    
    // Check if the challenge matches
    if (storedChallenge.challenge !== challenge) {
      console.log('Challenge does not match');
      return false;
    }
    
    try {
      // Convert the signature from base64 to buffer
      const signatureBuffer = Buffer.from(signature, 'base64');
      
      // Create a keypair from the public key
      const keypair = StellarSdk.Keypair.fromPublicKey(stellarPublicKey);
      
      // Verify the signature
      const isValid = keypair.verify(Buffer.from(challenge), signatureBuffer);
      
      // Clean up the challenge if verification was successful
      if (isValid) {
        this.challenges.delete(stellarPublicKey);
      }
      
      return isValid;
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }
}

module.exports = new StellarAuthService();
