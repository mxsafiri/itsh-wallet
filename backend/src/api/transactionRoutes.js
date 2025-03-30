const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { userDb, transactionDb } = require('../services/databaseService');
const { sendPayment } = require('../services/stellarService');

/**
 * @route   POST /api/transactions/send
 * @desc    Send iTZS to another user
 * @access  Private
 */
router.post('/send', async (req, res) => {
  try {
    const { senderId, recipientPhone, amount } = req.body;
    
    if (!senderId || !recipientPhone || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Sender ID, recipient phone, and amount are required' 
      });
    }
    
    // Validate amount
    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount must be a positive number' 
      });
    }
    
    // Find sender by ID
    const sender = await userDb.findById(senderId);
    if (!sender) {
      return res.status(404).json({ 
        success: false, 
        message: 'Sender not found' 
      });
    }
    
    // Find recipient by phone number
    const recipient = await userDb.findByPhoneNumber(recipientPhone);
    if (!recipient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipient not found' 
      });
    }
    
    // Create a transaction record with pending status
    const transactionId = uuidv4();
    await transactionDb.create({
      id: transactionId,
      senderId: sender.id,
      recipientId: recipient.id,
      amount: amountFloat,
      fee: 0.000001, // Stellar transaction fee in XLM
      stellarTxId: null,
      status: 'pending'
    });
    
    // Send payment on Stellar network
    const paymentResult = await sendPayment(
      sender.stellar_secret_key,
      recipient.stellar_public_key,
      amountFloat.toString()
    );
    
    // Update transaction status
    await transactionDb.updateStatus(
      transactionId, 
      'completed', 
      paymentResult.stellarTxId
    );
    
    res.json({
      success: true,
      message: `Successfully sent ${amount} iTZS to ${recipientPhone}`,
      transaction: {
        id: transactionId,
        amount: amountFloat,
        fee: paymentResult.fee,
        stellarTxId: paymentResult.stellarTxId,
        recipient: recipientPhone,
        status: 'completed'
      }
    });
  } catch (error) {
    console.error('Error sending transaction:', error);
    res.status(500).json({ 
      success: false, 
      message: `Transaction failed: ${error.message}` 
    });
  }
});

/**
 * @route   GET /api/transactions/history/:userId
 * @desc    Get transaction history for a user
 * @access  Private
 */
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    
    // Find user by ID
    const user = await userDb.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Get user's transactions
    const transactions = await transactionDb.getUserTransactions(userId, limit);
    
    // Format transactions for the client
    const formattedTransactions = transactions.map(tx => {
      const isSender = tx.sender_id === userId;
      return {
        id: tx.id,
        type: isSender ? 'sent' : 'received',
        amount: tx.amount,
        fee: tx.fee,
        counterparty: isSender ? tx.recipient_phone : tx.sender_phone,
        status: tx.status,
        timestamp: tx.created_at,
        stellarTxId: tx.stellar_tx_id
      };
    });
    
    res.json({
      success: true,
      transactions: formattedTransactions
    });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching transaction history' 
    });
  }
});

/**
 * @route   GET /api/transactions/:id
 * @desc    Get details of a specific transaction
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real app, we would fetch the transaction from the database
    // For the MVP, we'll return a mock transaction
    
    res.json({
      success: true,
      transaction: {
        id,
        senderId: 'mock-sender-id',
        recipientId: 'mock-recipient-id',
        amount: 5000,
        fee: 0.000001,
        stellarTxId: 'mock-stellar-tx-id',
        status: 'completed',
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching transaction details' 
    });
  }
});

module.exports = router;
