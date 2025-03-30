require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3000,
  },
  stellar: {
    network: process.env.STELLAR_NETWORK || 'TESTNET',
    issuingSecret: process.env.ISSUING_SECRET,
    distributionSecret: process.env.DISTRIBUTION_SECRET,
    assetCode: process.env.ASSET_CODE || 'iTZS',
    assetIssuer: process.env.ASSET_ISSUER,
    horizonUrl: process.env.STELLAR_NETWORK === 'PUBLIC' 
      ? 'https://horizon.stellar.org' 
      : 'https://horizon-testnet.stellar.org',
  },
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production',
    jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',
    jwtExpiresIn: '7d',
  },
  reserve: {
    totalReserveTZS: parseInt(process.env.TOTAL_RESERVE_TZS || '2500000'),
  },
  // Mock data for MVP demo
  mockUsers: [
    { phoneNumber: '+255123456789', pin: '1234', initialBalance: 50000 },
    { phoneNumber: '+255987654321', pin: '1234', initialBalance: 50000 },
    { phoneNumber: '+255111222333', pin: '1234', initialBalance: 50000 },
    { phoneNumber: '+255444555666', pin: '1234', initialBalance: 50000 },
    { phoneNumber: '+255777888999', pin: '1234', initialBalance: 50000 },
  ],
};
