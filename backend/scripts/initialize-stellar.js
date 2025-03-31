// Script to initialize Stellar accounts and establish trustlines
require('dotenv').config();
const stellarService = require('../src/services/stellarService');

async function initializeStellar() {
  try {
    console.log('Initializing Stellar accounts and establishing trustlines...');
    
    const result = await stellarService.initializeStellarAccounts();
    
    console.log('Initialization complete!');
    console.log('Issuing Public Key:', result.issuingPublicKey);
    console.log('Distribution Public Key:', result.distributionPublicKey);
    
    console.log('\nTrustline should now be established. Run check-trustline-public.js to verify.');
  } catch (error) {
    console.error('Error initializing Stellar accounts:', error);
  }
}

// Run the initialization
initializeStellar();
