# NEDApay Web App

A responsive web version of the NEDApay wallet application that integrates with existing backend APIs for Stellar testnet operations and Supabase interactions.

## Overview

NEDApay is a digital payment solution for Tanzania, allowing users to send and receive iTZS (digital Tanzanian Shilling) through a user-friendly web interface. The application is built with React and Tailwind CSS, providing a seamless experience on both desktop and mobile browsers.

## Features

- **User Authentication**: Phone number verification and PIN-based login
- **Wallet Management**: View balance and transaction history
- **Payment Operations**: 
  - Send iTZS to other users
  - Receive iTZS via QR code
  - Scan QR codes for payments
- **Security**: PIN protection and security settings
- **Responsive Design**: Works on mobile and desktop browsers

## Technology Stack

- **Frontend**: React, React Router, Tailwind CSS
- **State Management**: React Context API
- **API Integration**: Axios
- **QR Code**: QRCode.react for generation, HTML5-QRCode for scanning
- **Build Tool**: Vite

## Project Structure

```
web-app/
├── public/              # Static assets
├── src/
│   ├── contexts/        # React contexts (Auth)
│   ├── screens/         # Screen components
│   ├── services/        # API services
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── postcss.config.js    # PostCSS configuration
```

## Backend Integration

The web app integrates with the existing NEDApay backend APIs:

- **Authentication**: User login and registration
- **Wallet Operations**: Balance checking, payment generation
- **Transactions**: Sending payments, transaction history

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   cd web-app
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   VITE_API_URL=https://itsh-wallet.vercel.app
   ```

### Development

Run the development server:

```
npm run dev
```

### Building for Production

Build the project:

```
npm run build
```

## Deployment

The web app is configured for deployment on Vercel. Simply connect your repository to Vercel and it will automatically build and deploy the application.

## License

This project is proprietary and confidential.
