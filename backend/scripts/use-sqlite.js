/**
 * Script to switch the NEDApay backend to use SQLite
 * Run with: node scripts/use-sqlite.js
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Path to .env file
const envPath = path.join(__dirname, '..', '.env');

// Load current .env file
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// Update NODE_ENV to development to use SQLite
envConfig.NODE_ENV = 'development';

// Write updated .env file
const updatedEnv = Object.entries(envConfig)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

fs.writeFileSync(envPath, updatedEnv);

console.log('✅ NEDApay backend configured to use SQLite database');
console.log('💾 Database file: itzs_database.db');
console.log('🚀 Restart your server to apply changes');
