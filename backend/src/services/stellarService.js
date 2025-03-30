const StellarSdk = require('stellar-sdk');
const config = require('../config');
const { decryptData } = require('../utils/encryption');
const { reserveDb } = require('./databaseService');

// Configure Stellar SDK based on network (testnet/public)
const server = new StellarSdk.Server(config.stellar.horizonUrl);
const networkPassphrase = config.stellar.network === 'PUBLIC'
  ? StellarSdk.Networks.PUBLIC
  : StellarSdk.Networks.TESTNET;

// Asset configuration
const assetCode = config.stellar.assetCode;
let assetIssuer = config.stellar.assetIssuer;

// Initialize Stellar accounts (issuing and distribution)
async function initializeStellarAccounts() {
  try {
    console.log('Initializing Stellar accounts...');
    
    // For the MVP, we'll create new accounts if secrets aren't provided
    // In production, you would use existing accounts with proper key management
    
    let issuingKeypair, distributionKeypair;
    
    // Check if we have existing keys
    if (config.stellar.issuingSecret && config.stellar.distributionSecret) {
      issuingKeypair = StellarSdk.Keypair.fromSecret(config.stellar.issuingSecret);
      distributionKeypair = StellarSdk.Keypair.fromSecret(config.stellar.distributionSecret);
      
      console.log('Using existing Stellar accounts');
    } else {
      // For demo purposes only - in production, never generate keys programmatically
      issuingKeypair = StellarSdk.Keypair.random();
      distributionKeypair = StellarSdk.Keypair.random();
      
      console.log('Generated new Stellar keypairs for demo');
      console.log(`Issuing Account Public Key: ${issuingKeypair.publicKey()}`);
      console.log(`Issuing Account Secret Key: ${issuingKeypair.secret()}`);
      console.log(`Distribution Account Public Key: ${distributionKeypair.publicKey()}`);
      console.log(`Distribution Account Secret Key: ${distributionKeypair.secret()}`);
      
      // Fund the accounts on testnet
      await fundTestnetAccount(issuingKeypair.publicKey());
      await fundTestnetAccount(distributionKeypair.publicKey());
    }
    
    // Set the asset issuer
    assetIssuer = issuingKeypair.publicKey();
    
    // Create the iTZS asset
    const iTZSAsset = new StellarSdk.Asset(assetCode, assetIssuer);
    
    // Check if distribution account already trusts the asset
    const distributionAccount = await server.loadAccount(distributionKeypair.publicKey());
    const hasTrustline = distributionAccount.balances.some(
      balance => balance.asset_code === assetCode && balance.asset_issuer === assetIssuer
    );
    
    if (!hasTrustline) {
      // Create trustline from distribution to issuing account
      const trustlineTransaction = new StellarSdk.TransactionBuilder(distributionAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase
      })
        .addOperation(StellarSdk.Operation.changeTrust({
          asset: iTZSAsset,
          limit: '2500000' // Maximum amount of iTZS that can be held (matches reserve)
        }))
        .setTimeout(30)
        .build();
      
      trustlineTransaction.sign(distributionKeypair);
      await server.submitTransaction(trustlineTransaction);
      console.log('Created trustline for distribution account');
    }
    
    // Check if we need to mint initial iTZS tokens
    if (!hasTrustline) {
      // Mint initial iTZS tokens (2,500,000 to match the reserve)
      const issuingAccount = await server.loadAccount(issuingKeypair.publicKey());
      
      const mintTransaction = new StellarSdk.TransactionBuilder(issuingAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase
      })
        .addOperation(StellarSdk.Operation.payment({
          destination: distributionKeypair.publicKey(),
          asset: iTZSAsset,
          amount: '2500000' // 2,500,000 iTZS
        }))
        .setTimeout(30)
        .build();
      
      mintTransaction.sign(issuingKeypair);
      await server.submitTransaction(mintTransaction);
      
      // Update reserve stats
      await reserveDb.updateStats(2500000, 0);
      
      console.log('Minted 2,500,000 iTZS tokens');
    }
    
    // Lock the issuing account with multi-signature (simulated for MVP)
    // In production, you would set up proper multi-sig with bank partners
    console.log('Issuing account configured with simulated multi-signature for the MVP');
    
    return {
      issuingPublicKey: issuingKeypair.publicKey(),
      distributionPublicKey: distributionKeypair.publicKey()
    };
  } catch (error) {
    console.error('Error initializing Stellar accounts:', error);
    throw error;
  }
}

// Helper function to fund testnet accounts
async function fundTestnetAccount(publicKey) {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    const responseJSON = await response.json();
    console.log(`Funded account ${publicKey} on testnet`);
    return responseJSON;
  } catch (error) {
    console.error('Error funding testnet account:', error);
    throw error;
  }
}

// Get user balance from Stellar network
async function getUserBalance(stellarPublicKey) {
  try {
    const account = await server.loadAccount(stellarPublicKey);
    
    // Find the iTZS balance
    const iTZSBalance = account.balances.find(
      balance => balance.asset_code === assetCode && balance.asset_issuer === assetIssuer
    );
    
    return iTZSBalance ? parseFloat(iTZSBalance.balance) : 0;
  } catch (error) {
    console.error('Error getting user balance:', error);
    
    // If the account doesn't exist yet, return 0
    if (error instanceof StellarSdk.NotFoundError) {
      return 0;
    }
    
    throw error;
  }
}

// Send iTZS from one user to another
async function sendPayment(senderSecretKey, recipientPublicKey, amount) {
  try {
    // Decrypt the sender's secret key
    const decryptedSecret = decryptData(senderSecretKey);
    const senderKeypair = StellarSdk.Keypair.fromSecret(decryptedSecret);
    
    // Load the sender's account
    const senderAccount = await server.loadAccount(senderKeypair.publicKey());
    
    // Create the iTZS asset
    const iTZSAsset = new StellarSdk.Asset(assetCode, assetIssuer);
    
    // Build the transaction
    const transaction = new StellarSdk.TransactionBuilder(senderAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: recipientPublicKey,
        asset: iTZSAsset,
        amount: amount.toString()
      }))
      .setTimeout(30)
      .build();
    
    // Sign the transaction
    transaction.sign(senderKeypair);
    
    // Submit the transaction
    const result = await server.submitTransaction(transaction);
    
    return {
      success: true,
      stellarTxId: result.id,
      fee: parseFloat(result.fee_charged) / 10000000, // Convert stroops to XLM
      hash: result.hash
    };
  } catch (error) {
    console.error('Error sending payment:', error);
    
    // Extract useful error information from Stellar
    let errorMessage = 'Transaction failed';
    if (error.response && error.response.data && error.response.data.extras) {
      errorMessage = error.response.data.extras.result_codes.operations 
        ? error.response.data.extras.result_codes.operations.join(', ')
        : error.response.data.extras.result_codes.transaction;
    }
    
    throw new Error(errorMessage);
  }
}

// Create a trustline for a user to accept iTZS
async function createTrustline(userSecretKey) {
  try {
    // Decrypt the user's secret key
    const decryptedSecret = decryptData(userSecretKey);
    const userKeypair = StellarSdk.Keypair.fromSecret(decryptedSecret);
    
    // Load the user's account
    const userAccount = await server.loadAccount(userKeypair.publicKey());
    
    // Create the iTZS asset
    const iTZSAsset = new StellarSdk.Asset(assetCode, assetIssuer);
    
    // Check if trustline already exists
    const hasTrustline = userAccount.balances.some(
      balance => balance.asset_code === assetCode && balance.asset_issuer === assetIssuer
    );
    
    if (hasTrustline) {
      return { success: true, message: 'Trustline already exists' };
    }
    
    // Build the transaction
    const transaction = new StellarSdk.TransactionBuilder(userAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase
    })
      .addOperation(StellarSdk.Operation.changeTrust({
        asset: iTZSAsset,
        limit: '1000000' // User can hold up to 1,000,000 iTZS
      }))
      .setTimeout(30)
      .build();
    
    // Sign the transaction
    transaction.sign(userKeypair);
    
    // Submit the transaction
    const result = await server.submitTransaction(transaction);
    
    return {
      success: true,
      stellarTxId: result.id
    };
  } catch (error) {
    console.error('Error creating trustline:', error);
    throw error;
  }
}

// Get reserve statistics
async function getReserveStats() {
  try {
    // Get the total minted and burned from the database
    const dbStats = await reserveDb.getStats();
    
    // Calculate circulating supply
    const circulatingSupply = dbStats.total_minted - dbStats.total_burned;
    
    // Calculate reserve ratio
    const reserveRatio = config.reserve.totalReserveTZS / circulatingSupply;
    
    return {
      totalReserveTZS: config.reserve.totalReserveTZS,
      circulatingSupply,
      reserveRatio
    };
  } catch (error) {
    console.error('Error getting reserve stats:', error);
    throw error;
  }
}

module.exports = {
  initializeStellarAccounts,
  getUserBalance,
  sendPayment,
  createTrustline,
  getReserveStats
};
