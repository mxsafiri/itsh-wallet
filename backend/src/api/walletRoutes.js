const express = require('express');
const router = express.Router();
const { userDb } = require('../services/databaseService');
const { getUserBalance, getReserveStats } = require('../services/stellarService');
const QRCode = require('qrcode');
const StellarSdk = require('stellar-sdk');
const supabaseService = require('../services/supabaseService');

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

/**
 * @route   POST /api/wallet/generate-payment
 * @desc    Generate a SEP-0007 payment URI for Stellar wallets
 * @access  Private
 */
router.post('/generate-payment', async (req, res) => {
  try {
    const { amount, memo, senderId, recipientId } = req.body;
    
    if (!amount || !recipientId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount and recipient ID are required' 
      });
    }
    
    // Get recipient user
    let recipient;
    if (process.env.NODE_ENV === 'production' || process.env.SUPABASE_URL) {
      recipient = await supabaseService.getUserById(recipientId);
    } else {
      recipient = await userDb.findById(recipientId);
    }
    
    if (!recipient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipient not found' 
      });
    }
    
    // Create a SEP-0007 compliant URI
    // Format: web+stellar:pay?destination=DESTINATION&amount=AMOUNT&memo=MEMO
    const stellarUri = new URL('web+stellar:pay');
    
    // Add destination (recipient's Stellar public key)
    stellarUri.searchParams.append('destination', recipient.stellar_public_key || recipient.stellarPublicKey);
    
    // Add amount and asset code
    stellarUri.searchParams.append('amount', amount);
    stellarUri.searchParams.append('asset_code', process.env.ASSET_CODE || 'iTZS');
    
    // Add asset issuer if available
    if (process.env.ASSET_ISSUER) {
      stellarUri.searchParams.append('asset_issuer', process.env.ASSET_ISSUER);
    }
    
    // Add memo if provided
    if (memo) {
      stellarUri.searchParams.append('memo', memo);
    }
    
    // Add transaction ID for tracking
    const transactionId = `${Date.now()}-${senderId}-${recipientId}`;
    stellarUri.searchParams.append('callback', `${req.protocol}://${req.get('host')}/api/wallet/log-transaction/${transactionId}`);
    
    // Create a pending transaction record
    if (process.env.NODE_ENV === 'production' || process.env.SUPABASE_URL) {
      await supabaseService.saveTransaction({
        senderId,
        recipientId,
        amount,
        type: 'payment',
        status: 'pending',
        stellarTransactionId: transactionId
      });
    } else {
      // Use your local database service
      // This depends on your implementation
    }
    
    res.json({
      success: true,
      paymentUri: stellarUri.toString(),
      transactionId
    });
  } catch (error) {
    console.error('Error generating payment URI:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while generating payment URI' 
    });
  }
});

/**
 * @route   GET /api/wallet/log-transaction/:transactionId
 * @desc    Log a completed transaction from a SEP-0007 callback
 * @access  Public (called by Stellar wallets)
 */
router.get('/log-transaction/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { tx_hash } = req.query;
    
    if (!tx_hash) {
      return res.status(400).json({ 
        success: false, 
        message: 'Transaction hash is required' 
      });
    }
    
    // Update transaction status in database
    if (process.env.NODE_ENV === 'production' || process.env.SUPABASE_URL) {
      // Find the transaction by ID
      const transactions = await supabaseService.getTransactionByExternalId(transactionId);
      
      if (!transactions || transactions.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Transaction not found' 
        });
      }
      
      // Update transaction status
      await supabaseService.updateTransaction(transactions[0].id, {
        status: 'completed',
        stellar_transaction_id: tx_hash
      });
    } else {
      // Use your local database service
      // This depends on your implementation
    }
    
    res.json({
      success: true,
      message: 'Transaction logged successfully'
    });
  } catch (error) {
    console.error('Error logging transaction:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while logging transaction' 
    });
  }
});

module.exports = router;
