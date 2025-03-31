/**
 * Script to switch the NEDApay backend to use Supabase
 * Run with: node scripts/use-supabase.js
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Path to .env file
const envPath = path.join(__dirname, '..', '.env');

// Load current .env file
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// Update NODE_ENV to production to use Supabase
envConfig.NODE_ENV = 'production';

// Write updated .env file
const updatedEnv = Object.entries(envConfig)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

fs.writeFileSync(envPath, updatedEnv);

console.log('✅ NEDApay backend configured to use Supabase database');
console.log('📊 Supabase URL:', envConfig.SUPABASE_URL);
console.log('🔑 API Key configured');
console.log('🚀 Restart your server to apply changes');
