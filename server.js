const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'NEDApay API is operational', timestamp: new Date().toISOString() });
});

// Mock Stellar authentication endpoints
app.post('/api/stellar-auth/challenge', (req, res) => {
  const { phoneNumber } = req.body;
  
  if (!phoneNumber) {
    return res.status(400).json({ 
      success: false, 
      message: 'Phone number is required' 
    });
  }
  
  // Generate a mock challenge
  const challenge = `NEDApay auth challenge for ${phoneNumber} at ${new Date().toISOString()}`;
  
  res.json({
    success: true,
    challenge,
    message: 'Challenge generated successfully'
  });
});

app.post('/api/stellar-auth/verify', (req, res) => {
  const { phoneNumber, challenge, signature } = req.body;
  
  if (!phoneNumber || !challenge || !signature) {
    return res.status(400).json({ 
      success: false, 
      message: 'Phone number, challenge, and signature are required' 
    });
  }
  
  // For demo purposes, accept any signature
  res.json({
    success: true,
    user: {
      id: `user_${Date.now()}`,
      phoneNumber,
      name: 'Demo User',
      balance: 1000,
      createdAt: new Date().toISOString()
    },
    token: 'mock_jwt_token',
    message: 'Authentication successful'
  });
});

// Mock login endpoint
app.post('/api/auth/login', (req, res) => {
  const { phoneNumber, pin } = req.body;
  
  if (!phoneNumber || !pin) {
    return res.status(400).json({ 
      success: false, 
      message: 'Phone number and PIN are required' 
    });
  }
  
  // For demo purposes, accept any credentials
  res.json({
    success: true,
    user: {
      id: `user_${Date.now()}`,
      phoneNumber,
      name: 'Demo User',
      balance: 1000,
      createdAt: new Date().toISOString()
    },
    token: 'mock_jwt_token',
    message: 'Login successful'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for Vercel serverless deployment
module.exports = app;
