const express = require('express');
const router = express.Router();
const { userDb } = require('../services/databaseService');
const { getUserBalance, getReserveStats } = require('../services/stellarService');
const QRCode = require('qrcode');

/**
 * @route   GET /api/wallet/balance/:userId
 * @desc    Get user's iTZS balance
 * @access  Private
 */
router.get('/balance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user by ID
    const user = await userDb.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // For the MVP, we'll use mock balances
    // In production, we would fetch the actual balance from Stellar
    const balance = await getUserBalance(user.stellar_public_key);
    
    res.json({
      success: true,
      balance,
      assetCode: 'iTZS'
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching balance' 
    });
  }
});

/**
 * @route   GET /api/wallet/qrcode/:userId
 * @desc    Generate QR code for receiving payments
 * @access  Private
 */
router.get('/qrcode/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user by ID
    const user = await userDb.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Create QR code data with phone number
    // In a real app, you might include more information or use a custom format
    const qrData = JSON.stringify({
      phoneNumber: user.phone_number,
      stellarPublicKey: user.stellar_public_key
    });
    
    // Generate QR code as base64 data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);
    
    res.json({
      success: true,
      qrCode: qrCodeDataUrl,
      phoneNumber: user.phone_number
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while generating QR code' 
    });
  }
});

/**
 * @route   POST /api/wallet/deposit
 * @desc    Mock deposit function (for MVP demo only)
 * @access  Private
 */
router.post('/deposit', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    
    if (!userId || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and amount are required' 
      });
    }
    
    // Find user by ID
    const user = await userDb.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // In a real app, we would process a real deposit
    // For the MVP, we'll just simulate a successful deposit
    
    res.json({
      success: true,
      message: `Successfully deposited ${amount} iTZS`,
      amount
    });
  } catch (error) {
    console.error('Error processing deposit:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while processing deposit' 
    });
  }
});

/**
 * @route   GET /api/wallet/reserve
 * @desc    Get reserve statistics
 * @access  Public
 */
router.get('/reserve', async (req, res) => {
  try {
    const reserveStats = await getReserveStats();
    
    res.json({
      success: true,
      reserve: reserveStats
    });
  } catch (error) {
    console.error('Error fetching reserve stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching reserve statistics' 
    });
  }
});

module.exports = router;
