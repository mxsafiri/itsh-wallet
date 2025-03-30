import * as StellarSdk from 'stellar-sdk';
import api from './api';

/**
 * Service for handling Stellar SEP-0010 authentication on the client side
 */
class StellarAuthService {
  /**
   * Request a challenge from the server for a specific phone number
   * @param {string} phoneNumber - The user's phone number
   * @returns {Promise<Object>} The challenge response
   */
  async requestChallenge(phoneNumber) {
    try {
      const response = await api.post('/stellar-auth/challenge', { phoneNumber });
      return response.data;
    } catch (error) {
      console.error('Error requesting challenge:', error);
      throw error;
    }
  }

  /**
   * Sign a challenge using a Stellar secret key
   * @param {string} challenge - The challenge string to sign
   * @param {string} secretKey - The Stellar account secret key
   * @returns {string} The signature in base64 format
   */
  signChallenge(challenge, secretKey) {
    try {
      // Create a keypair from the secret key
      const keypair = StellarSdk.Keypair.fromSecret(secretKey);
      
      // Sign the challenge
      const signature = keypair.sign(Buffer.from(challenge));
      
      // Return the signature as a base64 string
      return signature.toString('base64');
    } catch (error) {
      console.error('Error signing challenge:', error);
      throw error;
    }
  }

  /**
   * Verify a signed challenge with the server
   * @param {string} phoneNumber - The user's phone number
   * @param {string} challenge - The challenge string
   * @param {string} signature - The signature in base64 format
   * @returns {Promise<Object>} The verification response
   */
  async verifyChallenge(phoneNumber, challenge, signature) {
    try {
      const response = await api.post('/stellar-auth/verify', {
        phoneNumber,
        challenge,
        signature
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying challenge:', error);
      throw error;
    }
  }

  /**
   * Complete the full SEP-0010 authentication flow
   * @param {string} phoneNumber - The user's phone number
   * @param {string} secretKey - The Stellar account secret key
   * @returns {Promise<Object>} The authentication result
   */
  async authenticate(phoneNumber, secretKey) {
    try {
      // Step 1: Request a challenge
      const challengeResponse = await this.requestChallenge(phoneNumber);
      
      if (!challengeResponse.success) {
        throw new Error(challengeResponse.message || 'Failed to get challenge');
      }
      
      // Step 2: Sign the challenge
      const signature = this.signChallenge(
        challengeResponse.challenge,
        secretKey
      );
      
      // Step 3: Verify the signature
      const verificationResponse = await this.verifyChallenge(
        phoneNumber,
        challengeResponse.challenge,
        signature
      );
      
      return verificationResponse;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }
}

export default new StellarAuthService();
