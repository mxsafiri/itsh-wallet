# iTZS Mobile Wallet

A mobile wallet application for sending and receiving iTZS tokens on the Stellar network.

## Project Structure

This project consists of two main parts:

- **Backend**: Node.js server with Express that handles authentication, wallet operations, and transactions
- **Frontend**: React Native mobile app built with Expo

## Deployment on Vercel

This project is configured for deployment on Vercel. The `vercel.json` file in the root directory specifies how to build and deploy both the backend and frontend components.

### Environment Variables

Make sure to set up the following environment variables in your Vercel project settings:

#### Backend Environment Variables
- `PORT`: Port for the server to listen on (default: 3000)
- `JWT_SECRET`: Secret key for JWT token generation
- `ENCRYPTION_KEY`: Key for encrypting sensitive data
- `STELLAR_NETWORK`: Stellar network to use (testnet or public)
- `ISSUER_SECRET_KEY`: Secret key for the iTZS token issuer account
- `DISTRIBUTION_SECRET_KEY`: Secret key for the iTZS token distribution account

### Automatic Deployments

When you push changes to the main branch of your GitHub repository, Vercel will automatically trigger a new deployment.

## Local Development

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Features

- User authentication with phone number and PIN
- Send and receive iTZS tokens
- QR code generation and scanning for payments
- Transaction history with filtering options
- Detailed transaction information
