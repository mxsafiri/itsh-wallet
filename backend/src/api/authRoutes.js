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
const jwt = require('jsonwebtoken');

// Helper function to get the appropriate database service
const getDbService = () => {
  return process.env.NODE_ENV === 'production' ? supabaseService : databaseService;
};

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.phoneNumber, phoneNumber: user.phoneNumber },
    process.env.JWT_SECRET || 'nedapay-secret-key',
    { expiresIn: '7d' }
  );
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
    let isMatch = false;
    
    try {
      // Try to use bcrypt compare
      isMatch = await bcrypt.compare(pin, user.pinHash);
    } catch (error) {
      // If bcrypt fails (e.g., if the hash isn't valid), fall back to direct comparison
      // This is for backward compatibility with existing test accounts
      console.warn('Bcrypt comparison failed, falling back to direct comparison');
      isMatch = pin === user.pinHash || pin === '1234'; // Fallback for testing
    }
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid PIN' 
      });
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Return user data (excluding sensitive information)
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        stellarPublicKey: user.stellarPublicKey
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
    
    // Generate JWT token
    const token = generateToken(user);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
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

/**
 * @route   GET /api/auth/user/:phoneNumber
 * @desc    Get user by phone number
 * @access  Public
 */
router.get('/user/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    
    if (!phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number is required' 
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
    
    // Return user data (excluding sensitive information)
    res.json({
      success: true,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        stellarPublicKey: user.stellarPublicKey
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching user' 
    });
  }
});

module.exports = router;
