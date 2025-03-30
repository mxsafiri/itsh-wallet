require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initializeDatabase } = require('./src/services/databaseService');
const supabaseService = require('./src/services/supabaseService');
const { initializeStellarAccounts } = require('./src/services/stellarService');

// Import routes
const authRoutes = require('./src/api/authRoutes');
const walletRoutes = require('./src/api/walletRoutes');
const transactionRoutes = require('./src/api/transactionRoutes');
const stellarAuthRoutes = require('./src/api/stellarAuthRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize database
// For local development, use SQLite
if (process.env.NODE_ENV === 'development') {
  initializeDatabase();
} else {
  // For production, use Supabase
  supabaseService.initializeDatabase()
    .then(success => {
      if (success) {
        console.log('Supabase database initialized');
        // Create mock users for testing
        if (process.env.CREATE_MOCK_USERS === 'true') {
          supabaseService.createMockUsers();
        }
      }
    })
    .catch(error => {
      console.error('Failed to initialize Supabase database:', error);
    });
}

// Initialize Stellar accounts (issuing and distribution)
// This is async but we're not awaiting it here to avoid blocking server startup
// In production, you'd want to handle this more gracefully
initializeStellarAccounts().catch(console.error);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stellar-auth', stellarAuthRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'iTZS Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: err.message || 'Something went wrong on the server',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`iTZS Backend server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});
