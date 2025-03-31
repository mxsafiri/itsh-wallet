const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { userDb } = require('../services/databaseService');
const { createTrustline, fundTestnetAccount } = require('../services/stellarService');
const StellarSdk = require('stellar-sdk');
const { encryptData } = require('../utils/encryption');
const bcrypt = require('bcryptjs');
const databaseService = require('../services/databaseService');
const supabaseService = require('../services/supabaseService');

// Helper function to get the appropriate database service
const getDbService = () => {
  return process.env.NODE_ENV === 'development' ? databaseService : supabaseService;
};

/**
 * @route   POST /api/auth/login
 * @desc    Login with phone number and PIN
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { phoneNumber, pin } = req.body;
    
    if (!phoneNumber || !pin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and PIN are required' 
      });
    }
    
    // Find user by phone number
    const dbService = getDbService();
    const user = await dbService.getUserByPhone(phoneNumber);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Verify PIN
    // For the MVP, we're using a simple PIN comparison
    // In a real app, you would use bcrypt.compare
    // const isMatch = await bcrypt.compare(pin, user.pinHash);
    const isMatch = pin === user.pinHash; // Simplified for MVP
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid PIN' 
      });
    }
    
    // Return user data (excluding sensitive information)
    res.json({
      success: true,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        stellarPublicKey: user.stellarPublicKey,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (for MVP demo)
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { phoneNumber, pin } = req.body;
    
    if (!phoneNumber || !pin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and PIN are required' 
      });
    }
    
    // Check if user already exists
    const dbService = getDbService();
    const existingUser = await dbService.getUserByPhone(phoneNumber);
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this phone number already exists' 
      });
    }
    
    // Hash the PIN
    const salt = await bcrypt.genSalt(10);
    const pinHash = await bcrypt.hash(pin, salt);
    
    // Generate a new Stellar keypair for the user
    const userKeypair = StellarSdk.Keypair.random();
    
    // Encrypt the secret key
    const encryptedSecretKey = encryptData(userKeypair.secret());
    
    // Create a new user
    const userId = uuidv4();
    const user = await dbService.createUser(phoneNumber, pinHash, userKeypair.publicKey());
    
    if (!user) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create user' 
      });
    }
    
    // Fund the account on testnet and create trustline
    try {
      // Fund the account on testnet
      await fundTestnetAccount(userKeypair.publicKey());
      
      // Create trustline for iTZS
      const trustlineResult = await createTrustline(encryptedSecretKey);
      
      if (!trustlineResult.success) {
        console.warn('Failed to create trustline for new user:', trustlineResult.message);
      }
    } catch (stellarError) {
      console.warn('Error during Stellar account setup:', stellarError);
      // Continue with registration even if Stellar setup fails
    }
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: userId,
        phoneNumber,
        stellarPublicKey: userKeypair.publicKey()
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

module.exports = router;
