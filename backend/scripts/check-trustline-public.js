// Script to check if a trustline for iTZS has been established using public keys only
const StellarSdk = require('stellar-sdk');

// Configuration values from the newly generated keys
const stellarNetwork = 'TESTNET';
const assetCode = 'iTZS';
const assetIssuer = 'GDYKAKUCFPKYERF3H3NY6V6EMUKQM5OD7FDIDEYQJN54F5SIMTAUHZ7N';

// Distribution public key (newly generated)
const distributionPublicKey = 'GDXDJTTJ27V65BKGJ7ILHVJY5OCAYEZHD6M2TUBJN4AQCIPD63HWONUR';

// Configure Stellar SDK based on network
const server = new StellarSdk.Server(
  stellarNetwork === 'PUBLIC' 
    ? 'https://horizon.stellar.org' 
    : 'https://horizon-testnet.stellar.org'
);

async function checkTrustline() {
  try {
    console.log('Checking trustline for iTZS...');
    console.log('Network:', stellarNetwork);
    console.log('\nAsset Code:', assetCode);
    console.log('Asset Issuer:', assetIssuer);
    console.log('Distribution Account:', distributionPublicKey);
    
    // Check if distribution account exists and has a trustline
    try {
      const distributionAccount = await server.loadAccount(distributionPublicKey);
      
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
          balance.asset_issuer === assetIssuer
      );
      
      if (hasTrustline) {
        console.log(`\n✅ Trustline for ${assetCode} has been established!`);
        
        // Find the specific iTZS balance
        const iTZSBalance = distributionAccount.balances.find(
          balance => 
            balance.asset_type !== 'native' && 
            balance.asset_code === assetCode && 
            balance.asset_issuer === assetIssuer
        );
        
        if (iTZSBalance) {
          console.log(`Current ${assetCode} balance: ${iTZSBalance.balance}`);
          console.log(`Trustline limit: ${iTZSBalance.limit || 'unlimited'}`);
        }
      } else {
        console.log(`\n❌ No trustline for ${assetCode} has been established yet.`);
        console.log('\nTo establish a trustline, you need to:');
        console.log('1. Run the initializeStellarAccounts function from your backend');
        console.log('2. Or manually create a trustline using a Stellar wallet');
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
