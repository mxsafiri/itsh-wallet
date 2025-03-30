# iTZS Mobile Wallet

A mobile wallet application for sending and receiving iTZS tokens on the Stellar network.

## Project Structure

This project consists of two main parts:

- **Backend**: Node.js server with Express that handles authentication, wallet operations, and transactions
- **Frontend**: React Native mobile app built with Expo

## Deployment on Vercel with Supabase

This project is configured for deployment on Vercel with Supabase as the database. Follow these steps to set up your deployment:

### 1. Supabase Setup

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `supabase-schema.sql` and run the query to create the necessary tables
4. Get your Supabase URL and anon key from the API settings page

### 2. Vercel Setup

1. Install the Vercel CLI: `npm install -g vercel`
2. Log in to Vercel: `vercel login`
3. Deploy the project: `vercel`
4. Set up the environment variables in the Vercel dashboard:

#### Environment Variables

Make sure to set up the following environment variables in your Vercel project settings:

- `PORT`: Port for the server to listen on (default: 3000)
- `NODE_ENV`: Set to "production"
- `JWT_SECRET`: Secret key for JWT token generation
- `ENCRYPTION_KEY`: Key for encrypting sensitive data
- `STELLAR_NETWORK`: Stellar network to use (testnet or public)
- `ISSUER_SECRET_KEY`: Secret key for the iTZS token issuer account
- `DISTRIBUTION_SECRET_KEY`: Secret key for the iTZS token distribution account
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon key
- `CREATE_MOCK_USERS`: Set to "true" to create mock users (for testing only)

### 3. Connecting Vercel to GitHub

1. In the Vercel dashboard, go to your project settings
2. Connect your GitHub repository
3. Configure the build settings:
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/web-build`
   - Install Command: `npm install`

### 4. Stellar Account Setup

For production, you'll need to create real Stellar accounts:

1. Create an issuing account and a distribution account on the Stellar network
2. Fund these accounts with XLM
3. Set up the issuing account to create the iTZS asset
4. Create a trustline from the distribution account to the issuing account
5. Update the environment variables with the real account keys

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
- Secure Stellar SEP-0010 authentication
- Send and receive iTZS tokens
- QR code generation and scanning for payments
- Transaction history with filtering options
- Detailed transaction information
