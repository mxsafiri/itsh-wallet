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

// Initialize database based on environment
const initializeApp = async () => {
  try {
    // For local development without Supabase, use SQLite
    if (process.env.NODE_ENV !== 'production' && !process.env.SUPABASE_URL) {
      console.log('Using SQLite database for development');
      await initializeDatabase();
    } else {
      // For production or when Supabase is configured, use Supabase
      console.log('Using Supabase database');
      const success = await supabaseService.initializeDatabase();
      
      if (!success) {
        console.error('Failed to initialize Supabase database. Exiting...');
        process.exit(1);
      }
    }
    
    // Initialize Stellar accounts
    await initializeStellarAccounts();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stellar-auth', stellarAuthRoutes);

// Root path health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'iTZS Backend API is running' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'iTZS Backend is running' });
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'iTZS API is operational', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: err.message || 'Something went wrong on the server',
  });
});

// Initialize the application
initializeApp();

// For Vercel serverless deployment
module.exports = app;
