const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');
const { encryptData } = require('../utils/encryption');

// Create a database connection
const dbPath = path.join(__dirname, '../../itzs_database.db');
const db = new sqlite3.Database(dbPath);

// Initialize database and create tables if they don't exist
function initializeDatabase() {
  console.log('Initializing database...');
  
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone_number TEXT UNIQUE,
      pin TEXT,
      stellar_public_key TEXT,
      stellar_secret_key TEXT,
      itzs_balance REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create transactions table
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      sender_id TEXT,
      recipient_id TEXT,
      amount REAL,
      fee REAL,
      stellar_tx_id TEXT,
      status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users (id),
      FOREIGN KEY (recipient_id) REFERENCES users (id)
    )
  `);

  // Create a table to track the total iTZS in circulation
  db.run(`
    CREATE TABLE IF NOT EXISTS reserve_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_minted REAL DEFAULT 0,
      total_burned REAL DEFAULT 0,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert initial reserve stats if not exists
  db.get('SELECT * FROM reserve_stats LIMIT 1', (err, row) => {
    if (!row) {
      db.run('INSERT INTO reserve_stats (total_minted, total_burned) VALUES (0, 0)');
    }
  });

  // Create mock users for the MVP demo
  createMockUsers();
}

// Create mock users for the MVP demo
function createMockUsers() {
  const { mockUsers } = config;
  
  mockUsers.forEach(user => {
    db.get('SELECT * FROM users WHERE phone_number = ?', [user.phoneNumber], (err, row) => {
      if (!row) {
        // In a real app, we would generate a Stellar keypair for each user
        // For the MVP, we'll use mock data
        const mockPublicKey = `MOCK_PUBLIC_KEY_${user.phoneNumber.replace('+', '')}`;
        const mockSecretKey = `MOCK_SECRET_KEY_${user.phoneNumber.replace('+', '')}`;
        
        // Encrypt the secret key (in a real app)
        const encryptedSecretKey = encryptData(mockSecretKey);
        
        // Generate a UUID for the user ID
        const userId = require('uuid').v4();
        
        db.run(
          'INSERT INTO users (id, phone_number, pin, stellar_public_key, stellar_secret_key, itzs_balance) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, user.phoneNumber, user.pin, mockPublicKey, encryptedSecretKey, 1000]
        );
        
        console.log(`Created mock user: ${user.phoneNumber}`);
      }
    });
  });
}

// User-related database operations
const userDb = {
  findByPhoneNumber: (phoneNumber) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE phone_number = ?', [phoneNumber], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  },
  
  findById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  },
  
  create: (userData) => {
    return new Promise((resolve, reject) => {
      const { id, phoneNumber, pin, stellarPublicKey, stellarSecretKey } = userData;
      
      db.run(
        'INSERT INTO users (id, phone_number, pin, stellar_public_key, stellar_secret_key, itzs_balance) VALUES (?, ?, ?, ?, ?, ?)',
        [id, phoneNumber, pin, stellarPublicKey, stellarSecretKey, 0],
        function(err) {
          if (err) reject(err);
          resolve({ id, phoneNumber });
        }
      );
    });
  },
  
  // Get user by phone number (for compatibility with wallet routes)
  getUserByPhone: (phoneNumber) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE phone_number = ?', [phoneNumber], (err, row) => {
        if (err) {
          console.error('[DB] Error getting user by phone:', err);
          return reject(err);
        }
        
        if (!row) {
          console.log(`[DB] No user found with phone number: ${phoneNumber}`);
          return resolve(null);
        }
        
        // Transform to match the expected format
        const user = {
          id: row.id,
          phoneNumber: row.phone_number,
          pin: row.pin,
          stellarPublicKey: row.stellar_public_key,
          stellarSecretKey: row.stellar_secret_key,
          iTZSAmount: row.itzs_balance || 0,
          createdAt: row.created_at
        };
        
        console.log(`[DB] Found user with phone number: ${phoneNumber}`);
        resolve(user);
      });
    });
  },
  
  // Update user balance
  updateUserBalance: (phoneNumber, amount) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET itzs_balance = itzs_balance + ? WHERE phone_number = ?',
        [amount, phoneNumber],
        function(err) {
          if (err) {
            console.error('[DB] Error updating user balance:', err);
            return reject(err);
          }
          
          if (this.changes === 0) {
            console.log(`[DB] No user found with phone number: ${phoneNumber}`);
            return resolve(false);
          }
          
          console.log(`[DB] Updated balance for user ${phoneNumber} by ${amount}`);
          resolve(true);
        }
      );
    });
  },
  
  // Get user balance
  getUserBalance: (phoneNumber) => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT itzs_balance FROM users WHERE phone_number = ?',
        [phoneNumber],
        (err, row) => {
          if (err) {
            console.error('[DB] Error getting user balance:', err);
            return reject(err);
          }
          
          if (!row) {
            console.log(`[DB] No user found with phone number: ${phoneNumber}`);
            return resolve(0);
          }
          
          console.log(`[DB] Retrieved balance for user ${phoneNumber}: ${row.itzs_balance}`);
          resolve(row.itzs_balance || 0);
        }
      );
    });
  }
};

// Transaction-related database operations
const transactionDb = {
  create: (transactionData) => {
    return new Promise((resolve, reject) => {
      const { id, senderId, recipientId, amount, fee, stellarTxId, status } = transactionData;
      
      db.run(
        'INSERT INTO transactions (id, sender_id, recipient_id, amount, fee, stellar_tx_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, senderId, recipientId, amount, fee, stellarTxId, status],
        function(err) {
          if (err) reject(err);
          resolve({ id, status });
        }
      );
    });
  },
  
  updateStatus: (id, status, stellarTxId = null) => {
    return new Promise((resolve, reject) => {
      const updateFields = stellarTxId 
        ? 'status = ?, stellar_tx_id = ?' 
        : 'status = ?';
      
      const params = stellarTxId 
        ? [status, stellarTxId, id] 
        : [status, id];
      
      db.run(
        `UPDATE transactions SET ${updateFields} WHERE id = ?`,
        params,
        function(err) {
          if (err) reject(err);
          resolve({ id, status });
        }
      );
    });
  },
  
  getUserTransactions: (userId, limit = 10) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT t.*, 
          s.phone_number as sender_phone, 
          r.phone_number as recipient_phone 
        FROM transactions t
        LEFT JOIN users s ON t.sender_id = s.id
        LEFT JOIN users r ON t.recipient_id = r.id
        WHERE t.sender_id = ? OR t.recipient_id = ?
        ORDER BY t.created_at DESC
        LIMIT ?`,
        [userId, userId, limit],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  },
  
  // Get transactions by phone number
  getTransactionsByPhone: (phoneNumber, limit = 10) => {
    return new Promise((resolve, reject) => {
      // First get the user ID from the phone number
      userDb.getUserByPhone(phoneNumber)
        .then(user => {
          if (!user) {
            return resolve([]);
          }
          
          // Then get transactions using the user ID
          return transactionDb.getUserTransactions(user.id, limit);
        })
        .then(transactions => resolve(transactions))
        .catch(err => reject(err));
    });
  }
};

// Reserve-related database operations
const reserveDb = {
  getStats: () => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM reserve_stats ORDER BY id DESC LIMIT 1', (err, row) => {
        if (err) reject(err);
        resolve(row || { total_minted: 0, total_burned: 0 });
      });
    });
  },
  
  updateStats: (minted = 0, burned = 0) => {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE reserve_stats 
         SET total_minted = total_minted + ?, 
             total_burned = total_burned + ?,
             last_updated = CURRENT_TIMESTAMP
         WHERE id = (SELECT id FROM reserve_stats ORDER BY id DESC LIMIT 1)`,
        [minted, burned],
        function(err) {
          if (err) reject(err);
          resolve({ minted, burned });
        }
      );
    });
  }
};

module.exports = {
  db,
  initializeDatabase,
  userDb,
  transactionDb,
  reserveDb,
  // Add direct methods for wallet routes
  getUserByPhone: userDb.getUserByPhone,
  updateUserBalance: userDb.updateUserBalance,
  getUserBalance: userDb.getUserBalance,
  getTransactionsByPhone: transactionDb.getTransactionsByPhone
};
