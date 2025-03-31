// Script to derive public keys from secret keys
const StellarSdk = require('stellar-sdk');

// Secret keys from .env file
const issuingSecret = 'SAVP7XHF7LSXTNB27TNIAIRIV7DR4IVEBHDSY7TLJF5215NPNDHUC7J5';
const distributionSecret = 'SDMZFS5OV7TOJ2H4FXKPYWSROTJNB2V4JTY23N4LVJAB7A373QXGU7EZ';

try {
  // Try to derive public keys
  console.log('Attempting to derive public keys from secrets...');
  
  try {
    const issuingKeypair = StellarSdk.Keypair.fromSecret(issuingSecret);
    console.log('Issuing Public Key:', issuingKeypair.publicKey());
  } catch (error) {
    console.error('Error deriving issuing public key:', error.message);
    console.log('The issuing secret key may be invalid or incomplete.');
  }
  
  try {
    const distributionKeypair = StellarSdk.Keypair.fromSecret(distributionSecret);
    console.log('Distribution Public Key:', distributionKeypair.publicKey());
  } catch (error) {
    console.error('Error deriving distribution public key:', error.message);
    console.log('The distribution secret key may be invalid or incomplete.');
  }
  
} catch (error) {
  console.error('General error:', error);
}
