const express = require('express');
const router = express.Router();
const stellarAuthService = require('../services/stellarAuthService');
const databaseService = require('../services/databaseService');

/**
 * Generate a challenge for a Stellar account
 * POST /api/stellar-auth/challenge
 */
router.post('/challenge', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }
    
    // Find the user by phone number
    const user = await databaseService.getUserByPhone(phoneNumber);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Generate a challenge for the user's Stellar account
    const challengeData = stellarAuthService.generateChallenge(user.stellarPublicKey);
    
    return res.status(200).json({
      success: true,
      challenge: challengeData.challenge,
      expiresAt: challengeData.expiresAt
    });
  } catch (error) {
    console.error('Error generating challenge:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while generating challenge'
    });
  }
});

/**
 * Verify a signed challenge
 * POST /api/stellar-auth/verify
 */
router.post('/verify', async (req, res) => {
  try {
    const { phoneNumber, challenge, signature } = req.body;
    
    if (!phoneNumber || !challenge || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, challenge, and signature are required'
      });
    }
    
    // Find the user by phone number
    const user = await databaseService.getUserByPhone(phoneNumber);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify the challenge signature
    const isValid = stellarAuthService.verifyChallenge(
      user.stellarPublicKey,
      challenge,
      signature
    );
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature or expired challenge'
      });
    }
    
    // Authentication successful, return user data
    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        stellarPublicKey: user.stellarPublicKey,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error verifying challenge:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while verifying challenge'
    });
  }
});

module.exports = router;
