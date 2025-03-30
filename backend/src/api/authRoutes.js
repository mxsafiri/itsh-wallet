const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { userDb } = require('../services/databaseService');
const { createTrustline } = require('../services/stellarService');
const StellarSdk = require('stellar-sdk');
const { encryptData } = require('../utils/encryption');

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
    const user = await userDb.findByPhoneNumber(phoneNumber);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Verify PIN
    if (user.pin !== pin) {
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
        phoneNumber: user.phone_number,
        stellarPublicKey: user.stellar_public_key,
        createdAt: user.created_at
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
    const existingUser = await userDb.findByPhoneNumber(phoneNumber);
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this phone number already exists' 
      });
    }
    
    // Generate a new Stellar keypair for the user
    const userKeypair = StellarSdk.Keypair.random();
    
    // Encrypt the secret key
    const encryptedSecretKey = encryptData(userKeypair.secret());
    
    // Create a new user
    const userId = uuidv4();
    await userDb.create({
      id: userId,
      phoneNumber,
      pin,
      stellarPublicKey: userKeypair.publicKey(),
      stellarSecretKey: encryptedSecretKey
    });
    
    // In a real app, we would fund the account and create a trustline
    // For the MVP, we'll just return success
    
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
