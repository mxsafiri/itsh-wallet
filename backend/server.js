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

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'NEDApay API Server',
    version: '1.0.0'
  });
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'iTZS API is operational', 
    timestamp: new Date().toISOString() 
  });
});

// Initialize database based on environment
const initializeApp = async () => {
  let usingSupabase = false;
  
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
        console.warn('Failed to initialize Supabase database. Falling back to SQLite...');
        await initializeDatabase();
      } else {
        usingSupabase = true;
      }
    }
    
    // Initialize Stellar accounts
    await initializeStellarAccounts();
    
    // Register routes
    app.use('/api/auth', authRoutes);
    app.use('/api/wallet', walletRoutes);
    app.use('/api/transactions', transactionRoutes);
    app.use('/api/stellar-auth', stellarAuthRoutes);
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        database: usingSupabase ? 'supabase' : 'sqlite',
        environment: process.env.NODE_ENV || 'development'
      });
    });
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
      console.log(`Database: ${usingSupabase ? 'Supabase' : 'SQLite'}`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: err.message || 'Something went wrong on the server',
  });
});

// Start the application
initializeApp();

// For Vercel serverless deployment
module.exports = app;
