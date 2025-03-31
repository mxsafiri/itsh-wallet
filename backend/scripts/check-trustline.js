// Script to check if a trustline for iTZS has been established
require('dotenv').config();
const StellarSdk = require('stellar-sdk');

// Get configuration from environment variables
const issuingSecret = process.env.ISSUING_SECRET;
const distributionSecret = process.env.DISTRIBUTION_SECRET;
const assetCode = process.env.ASSET_CODE || 'iTZS';
const assetIssuer = process.env.ASSET_ISSUER;
const stellarNetwork = process.env.STELLAR_NETWORK || 'TESTNET';

// Configure Stellar SDK based on network
const server = new StellarSdk.Server(
  stellarNetwork === 'PUBLIC' 
    ? 'https://horizon.stellar.org' 
    : 'https://horizon-testnet.stellar.org'
);

const networkPassphrase = stellarNetwork === 'PUBLIC'
  ? StellarSdk.Networks.PUBLIC
  : StellarSdk.Networks.TESTNET;

async function checkTrustline() {
  try {
    console.log('Checking trustline for iTZS...');
    console.log('Network:', stellarNetwork);
    
    if (!issuingSecret || !distributionSecret) {
      console.error('Error: Issuing or distribution secret keys are not set in environment variables');
      process.exit(1);
    }

    // Create keypairs from secrets
    const issuingKeypair = StellarSdk.Keypair.fromSecret(issuingSecret);
    const distributionKeypair = StellarSdk.Keypair.fromSecret(distributionSecret);
    
    console.log('\nIssuing Account Public Key:', issuingKeypair.publicKey());
    console.log('Distribution Account Public Key:', distributionKeypair.publicKey());
    
    if (assetIssuer && assetIssuer !== issuingKeypair.publicKey()) {
      console.warn('\nWarning: ASSET_ISSUER in .env does not match the public key derived from ISSUING_SECRET');
      console.warn('ASSET_ISSUER in .env:', assetIssuer);
      console.warn('Derived from ISSUING_SECRET:', issuingKeypair.publicKey());
    }
    
    // Check if distribution account exists and has a trustline
    try {
      const distributionAccount = await server.loadAccount(distributionKeypair.publicKey());
      
      console.log('\nDistribution Account Balances:');
      distributionAccount.balances.forEach(balance => {
        if (balance.asset_type === 'native') {
          console.log(`- XLM: ${balance.balance}`);
        } else {
          console.log(`- ${balance.asset_code} (Issuer: ${balance.asset_issuer}): ${balance.balance}`);
        }
      });
      
      // Check specifically for the iTZS trustline
      const hasTrustline = distributionAccount.balances.some(
        balance => 
          balance.asset_type !== 'native' && 
          balance.asset_code === assetCode && 
          balance.asset_issuer === issuingKeypair.publicKey()
      );
      
      if (hasTrustline) {
        console.log(`\n✅ Trustline for ${assetCode} has been established!`);
        
        // Find the specific iTZS balance
        const iTZSBalance = distributionAccount.balances.find(
          balance => 
            balance.asset_type !== 'native' && 
            balance.asset_code === assetCode && 
            balance.asset_issuer === issuingKeypair.publicKey()
        );
        
        if (iTZSBalance) {
          console.log(`Current ${assetCode} balance: ${iTZSBalance.balance}`);
          console.log(`Trustline limit: ${iTZSBalance.limit || 'unlimited'}`);
        }
      } else {
        console.log(`\n❌ No trustline for ${assetCode} has been established yet.`);
        console.log('You can establish a trustline by running:');
        console.log('node -e "require(\'./src/services/stellarService\').initializeStellarAccounts()"');
      }
      
    } catch (error) {
      if (error instanceof StellarSdk.NotFoundError) {
        console.error('\nDistribution account does not exist on the Stellar network.');
        console.error('You may need to fund this account first on the testnet.');
      } else {
        console.error('\nError checking account:', error);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the check
checkTrustline();
