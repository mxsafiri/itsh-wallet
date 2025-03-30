# iTZS Mobile Wallet Backend

This is the Node.js backend for the iTZS mobile wallet app, a non-custodial stablecoin wallet for Tanzania where 1 iTZS = 1 Tanzanian Shilling (TZS), built on the Stellar blockchain.

## Features

- **User Management**: Registration and authentication with phone number + PIN
- **Stellar Integration**: Connection to Stellar testnet for blockchain operations
- **Wallet Operations**: Balance checking, sending and receiving iTZS
- **Transaction History**: Tracking and retrieving transaction records
- **Reserve Management**: Monitoring the total circulating supply vs. reserve

## Project Structure

```
backend/
├── src/
│   ├── api/            # API routes
│   │   ├── authRoutes.js
│   │   ├── walletRoutes.js
│   │   └── transactionRoutes.js
│   ├── services/       # Business logic
│   │   ├── databaseService.js
│   │   └── stellarService.js
│   ├── models/         # Data models
│   ├── utils/          # Utility functions
│   │   └── encryption.js
│   └── config/         # Configuration
│       └── index.js
├── server.js           # Main server file
└── package.json        # Dependencies
```

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- npm or yarn
- SQLite (included as a dependency)

### Installation

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your Stellar account details:
   - For testing, you can leave them blank and the system will generate new testnet accounts
   - For production, you should provide your own secure Stellar account keys

4. Start the server:
   ```bash
   npm start
   ```

## Stellar Integration

The backend connects to the Stellar network to:
- Create and manage user wallets
- Issue and distribute iTZS tokens
- Process transactions with near-zero fees
- Track the total supply of iTZS in circulation

For the MVP, the backend uses the Stellar testnet. In production, it would use the Stellar public network.

## API Endpoints

### Authentication
- `POST /api/auth/login`: Login with phone number and PIN
- `POST /api/auth/register`: Register a new user

### Wallet
- `GET /api/wallet/balance/:userId`: Get user's iTZS balance
- `GET /api/wallet/qrcode/:userId`: Generate QR code for receiving payments
- `POST /api/wallet/deposit`: Mock deposit function (for MVP demo)
- `GET /api/wallet/reserve`: Get reserve statistics

### Transactions
- `POST /api/transactions/send`: Send iTZS to another user
- `GET /api/transactions/history/:userId`: Get transaction history
- `GET /api/transactions/:id`: Get details of a specific transaction

## Security

- User private keys are encrypted before storage
- Sensitive configuration is stored in environment variables
- For the MVP, the backend uses a simple SQLite database
- In production, a more robust database and key management system would be used

## Testing

For the MVP demo, you can use the following test credentials:
- Phone: +255123456789
- PIN: 1234

## Notes for Development

- The backend is designed to be lightweight and focused on the MVP requirements
- For production, additional security measures and scalability improvements would be needed
- The in-memory database is reset on server restart; for persistence, ensure the SQLite file is preserved
