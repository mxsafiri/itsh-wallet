# iTZS Mobile Wallet Frontend

This is the React Native frontend for the iTZS mobile wallet app, a non-custodial stablecoin wallet for Tanzania where 1 iTZS = 1 Tanzanian Shilling (TZS), built on the Stellar blockchain.

## Features

- **Login/Registration**: Phone number + PIN authentication
- **Balance Display**: View your iTZS balance
- **Send iTZS**: Send payments to other users via phone number or QR code
- **Receive iTZS**: Generate QR codes for receiving payments
- **Transaction History**: View your transaction history
- **Mock Deposits**: Simulate adding funds to your wallet

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # App screens
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── HomeScreen.js
│   │   ├── SendScreen.js
│   │   ├── ReceiveScreen.js
│   │   ├── HistoryScreen.js
│   │   ├── ScanQRScreen.js
│   │   ├── TransactionDetailsScreen.js
│   │   └── TransactionSuccessScreen.js
│   ├── navigation/     # Navigation configuration
│   │   ├── AuthNavigator.js
│   │   └── MainNavigator.js
│   ├── services/       # API services
│   │   └── api.js
│   ├── utils/          # Utility functions
│   └── assets/         # Images, fonts, etc.
├── App.js              # Main app component
└── package.json        # Dependencies
```

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on a device or emulator:
   - Scan the QR code with the Expo Go app on your phone
   - Press 'a' to run on an Android emulator
   - Press 'i' to run on an iOS simulator

## Design

The app follows a modern mobile banking app design with:
- Dark blue gradient backgrounds
- Clean white cards for content
- Green accent color for primary actions
- Intuitive icons and navigation

## Backend Integration

The frontend connects to the iTZS backend API for:
- User authentication
- Wallet operations
- Transaction processing
- QR code generation

Make sure the backend server is running at the correct URL (configured in `src/services/api.js`).

## Testing

For the MVP demo, you can use the following test credentials:
- Phone: +255123456789
- PIN: 1234

## Notes for Development

- The app is built with Expo for easier development and testing
- QR code scanning requires camera permissions
- The app uses SecureStore for local storage of sensitive information
- For the MVP, some features use mock data and simulated functionality
