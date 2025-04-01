const express = require('express');
const router = express.Router();
const { userDb } = require('../services/databaseService');
const { getUserBalance, getReserveStats } = require('../services/stellarService');
const QRCode = require('qrcode');
const StellarSdk = require('stellar-sdk');
const supabaseService = require('../services/supabaseService');
const databaseService = require('../services/databaseService');

// Helper function to get the appropriate database service
const getDbService = () => {
  return process.env.NODE_ENV === 'production' ? supabaseService : databaseService;
};

/**
 * @route   GET /api/wallet/balance/:phoneNumber
 * @desc    Get user's iTZS balance
 * @access  Private
 */
router.get('/balance/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    console.log(`[WALLET] Getting balance for phone number: ${phoneNumber}`);
    
    // Find user by phone number
    const dbService = getDbService();
    const user = await dbService.getUserByPhone(phoneNumber);
    
    if (!user) {
      console.log(`[WALLET] User not found with phone number: ${phoneNumber}`);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    console.log(`[WALLET] Found user:`, user);
    
    // Get balance from database
    let balance = 0;
    
    if (process.env.NODE_ENV === 'production') {
      // In production, get balance from Supabase
      balance = user.iTZSAmount || 0;
    } else {
      // For development, use mock balance or fetch from Stellar
      balance = await getUserBalance(user.stellarPublicKey);
    }
    
    console.log(`[WALLET] User balance: ${balance} iTZS`);
    
    res.json({
      success: true,
      balance,
      assetCode: 'iTZS'
    });
  } catch (error) {
    console.error('[WALLET] Error fetching balance:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching balance' 
    });
  }
});

/**
 * @route   GET /api/wallet/qrcode/:phoneNumber
 * @desc    Generate QR code for receiving payments
 * @access  Private
 */
router.get('/qrcode/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    console.log(`[WALLET] Generating QR code for phone number: ${phoneNumber}`);
    
    // Find user by phone number
    const dbService = getDbService();
    const user = await dbService.getUserByPhone(phoneNumber);
    
    if (!user) {
      console.log(`[WALLET] User not found with phone number: ${phoneNumber}`);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Create QR code data with phone number
    // In a real app, you might include more information or use a custom format
    const qrData = JSON.stringify({
      phoneNumber: user.phoneNumber,
      stellarPublicKey: user.stellarPublicKey
    });
    
    // Generate QR code as base64 data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);
    
    res.json({
      success: true,
      qrCode: qrCodeDataUrl,
      phoneNumber: user.phoneNumber
    });
  } catch (error) {
    console.error('[WALLET] Error generating QR code:', error);
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
    const { phoneNumber, amount } = req.body;
    
    if (!phoneNumber || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and amount are required' 
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
    
    // Update user's balance
    const success = await dbService.updateUserBalance(phoneNumber, parseFloat(amount));
    
    if (!success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update balance' 
      });
    }
    
    // Get updated balance
    const updatedBalance = await dbService.getUserBalance(phoneNumber);
    
    res.json({
      success: true,
      message: `Successfully deposited ${amount} iTZS`,
      balance: updatedBalance
    });
  } catch (error) {
    console.error('[WALLET] Error processing deposit:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during deposit' 
    });
  }
});

/**
 * @route   GET /api/wallet/reserve-stats
 * @desc    Get reserve statistics
 * @access  Public
 */
router.get('/reserve-stats', async (req, res) => {
  try {
    // For the MVP, we'll use mock data
    // In production, we would fetch actual data from Stellar
    const stats = await getReserveStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('[WALLET] Error fetching reserve stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching reserve stats' 
    });
  }
});

/**
 * @route   POST /api/wallet/generate-payment
 * @desc    Generate a payment URI for Stellar SEP-0007
 * @access  Private
 */
router.post('/generate-payment', async (req, res) => {
  try {
    const { amount, memo, senderPhone, recipientPhone } = req.body;
    
    if (!amount || !recipientPhone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount and recipient phone number are required' 
      });
    }
    
    // Find recipient by phone number
    const dbService = getDbService();
    const recipient = await dbService.getUserByPhone(recipientPhone);
    
    if (!recipient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipient not found' 
      });
    }
    
    // Create a payment URI using SEP-0007
    // https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md
    const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    const asset = new StellarSdk.Asset('iTZS', process.env.ISSUER_PUBLIC_KEY);
    
    // Build the URI
    const uri = new URL('web+stellar:pay');
    uri.searchParams.append('destination', recipient.stellarPublicKey);
    uri.searchParams.append('amount', amount);
    uri.searchParams.append('asset_code', 'iTZS');
    uri.searchParams.append('asset_issuer', process.env.ISSUER_PUBLIC_KEY);
    
    if (memo) {
      uri.searchParams.append('memo', memo);
      uri.searchParams.append('memo_type', 'text');
    }
    
    res.json({
      success: true,
      paymentUri: uri.toString(),
      recipient: {
        phoneNumber: recipient.phoneNumber,
        stellarPublicKey: recipient.stellarPublicKey
      }
    });
  } catch (error) {
    console.error('[WALLET] Error generating payment URI:', error);
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
    console.error('[WALLET] Error logging transaction:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while logging transaction' 
    });
  }
});

module.exports = router;
