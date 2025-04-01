const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase clients
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL and Key must be provided in environment variables');
  process.exit(1);
}

// Regular client (respects Row Level Security)
const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client (bypasses Row Level Security) - only used in backend
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase; // Fallback to regular client if service key not provided

/**
 * Service for interacting with Supabase database
 */
class SupabaseService {
  /**
   * Initialize the database tables if they don't exist
   */
  async initializeDatabase() {
    console.log('Connecting to Supabase database...');
    
    try {
      // First, check if the users table exists
      const { error: tableError } = await supabaseAdmin
        .from('users')
        .select('phone')
        .limit(1);
      
      // If there's an error about the table not existing, try to create it
      if (tableError && tableError.message.includes('does not exist')) {
        console.log('Users table does not exist. Attempting to create it...');
        
        try {
          // For local development, we'll use a workaround since we can't create tables via the JS client
          // In production, tables should be created via Supabase dashboard or migrations
          
          // Instead, we'll use SQLite for local development
          if (process.env.NODE_ENV !== 'production') {
            console.log('Using SQLite for local development');
            return true; // SQLite will be handled by databaseService
          } else {
            console.error('Supabase tables not set up correctly. Please create the required tables in the Supabase dashboard.');
            return false;
          }
        } catch (createError) {
          console.error('Failed to create users table:', createError.message);
          return false;
        }
      } else if (tableError) {
        console.error('Error connecting to Supabase:', tableError.message);
        return false;
      }
      
      console.log('Successfully connected to Supabase database');
      
      // Create mock users if configured to do so
      if (process.env.CREATE_MOCK_USERS === 'true') {
        await this.createMockUsers();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to connect to Supabase:', error.message);
      return false;
    }
  }

  /**
   * Create mock users for testing
   */
  async createMockUsers() {
    const mockUsers = [
      {
        phone: '+255123456789',
        stellar_public_key: 'MOCK_PUBLIC_KEY_255123456789',
        pin: '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF', // Hashed version of "1234"
        iTZS_amount: 50000
      },
      {
        phone: '+255987654321',
        stellar_public_key: 'MOCK_PUBLIC_KEY_255987654321',
        pin: '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF',
        iTZS_amount: 50000
      }
    ];

    for (const user of mockUsers) {
      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('phone')
        .eq('phone', user.phone)
        .single();

      if (!existingUser) {
        // Insert new user
        const { error } = await supabaseAdmin
          .from('users')
          .insert([user]);

        if (error) {
          console.error(`Error creating mock user ${user.phone}:`, error.message);
        } else {
          console.log(`Created mock user: ${user.phone}`);
        }
      }
    }
  }

  /**
   * Get a user by phone number
   * @param {string} phoneNumber - The user's phone number
   * @returns {Promise<Object>} The user object
   */
  async getUserByPhone(phoneNumber) {
    console.log(`[SUPABASE] Getting user with phone number: ${phoneNumber}`);
    
    // Using admin client for backend operations
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('phone', phoneNumber)
      .single();

    if (error) {
      console.error('[SUPABASE] Error fetching user by phone:', error.message);
      return null;
    }

    if (!data) {
      console.log(`[SUPABASE] No user found with phone number: ${phoneNumber}`);
      return null;
    }

    console.log(`[SUPABASE] Found user with phone: ${phoneNumber}`);
    
    return {
      id: data.phone, // Use phone as ID since there's no id column
      phoneNumber: data.phone,
      stellarPublicKey: data.stellar_public_key,
      pinHash: data.pin,
      iTZSAmount: data.iTZS_amount || 0
    };
  }

  /**
   * Create a new user
   * @param {string} phoneNumber - The user's phone number
   * @param {string} pinHash - The hashed PIN
   * @param {string} stellarPublicKey - The user's Stellar public key
   * @returns {Promise<Object>} The created user object
   */
  async createUser(phoneNumber, pinHash, stellarPublicKey) {
    // Using admin client for backend operations
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{
        phone: phoneNumber,
        pin: pinHash,
        stellar_public_key: stellarPublicKey,
        iTZS_amount: 50000, // Initialize with 50,000 iTZS for testing
        stellar_key: '' // Empty string for stellar key
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error.message);
      return null;
    }

    return {
      id: data.phone, // Use phone as ID since there's no id column
      phoneNumber: data.phone,
      stellarPublicKey: data.stellar_public_key,
      iTZSAmount: data.iTZS_amount || 0
    };
  }

  /**
   * Update user balance
   * @param {string} phoneNumber - The user's phone number
   * @param {number} amount - The amount to add to the balance (can be negative)
   * @returns {Promise<boolean>} Success status
   */
  async updateUserBalance(phoneNumber, amount) {
    console.log(`[SUPABASE] Updating balance for ${phoneNumber} by ${amount}`);
    
    try {
      // First get the current balance
      const user = await this.getUserByPhone(phoneNumber);
      
      if (!user) {
        console.log(`[SUPABASE] No user found with phone number: ${phoneNumber}`);
        return false;
      }
      
      const newBalance = (user.iTZSAmount || 0) + amount;
      
      // Update the balance
      const { error } = await supabaseAdmin
        .from('users')
        .update({ iTZS_amount: newBalance })
        .eq('phone', phoneNumber);
      
      if (error) {
        console.error('[SUPABASE] Error updating user balance:', error.message);
        return false;
      }
      
      console.log(`[SUPABASE] Successfully updated balance for ${phoneNumber} to ${newBalance}`);
      return true;
    } catch (error) {
      console.error('[SUPABASE] Error in updateUserBalance:', error);
      return false;
    }
  }
  
  /**
   * Get user balance
   * @param {string} phoneNumber - The user's phone number
   * @returns {Promise<number>} The user's balance
   */
  async getUserBalance(phoneNumber) {
    console.log(`[SUPABASE] Getting balance for ${phoneNumber}`);
    
    try {
      const user = await this.getUserByPhone(phoneNumber);
      
      if (!user) {
        console.log(`[SUPABASE] No user found with phone number: ${phoneNumber}`);
        return 0;
      }
      
      console.log(`[SUPABASE] Retrieved balance for ${phoneNumber}: ${user.iTZSAmount}`);
      return user.iTZSAmount || 0;
    } catch (error) {
      console.error('[SUPABASE] Error in getUserBalance:', error);
      return 0;
    }
  }

  /**
   * Save a transaction to the database
   * @param {Object} transaction - The transaction details
   * @returns {Promise<Object>} The saved transaction
   */
  async saveTransaction(transaction) {
    // Using admin client for backend operations
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .insert([{
        sender_phone: transaction.senderPhone,
        recipient_phone: transaction.recipientPhone,
        amount: transaction.amount,
        memo: transaction.memo || '',
        transaction_hash: transaction.transactionHash || '',
        status: transaction.status || 'completed',
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving transaction:', error.message);
      return null;
    }

    return data;
  }

  /**
   * Get transactions for a user
   * @param {string} phoneNumber - The user's phone number
   * @param {number} limit - Maximum number of transactions to return
   * @returns {Promise<Array>} List of transactions
   */
  async getTransactionsByPhone(phoneNumber, limit = 10) {
    console.log(`[SUPABASE] Getting transactions for ${phoneNumber}`);
    
    try {
      // Get transactions where user is sender or recipient
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .or(`sender_phone.eq.${phoneNumber},recipient_phone.eq.${phoneNumber}`)
        .order('timestamp', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('[SUPABASE] Error fetching transactions:', error.message);
        return [];
      }
      
      console.log(`[SUPABASE] Found ${data.length} transactions for ${phoneNumber}`);
      return data || [];
    } catch (error) {
      console.error('[SUPABASE] Error in getTransactionsByPhone:', error);
      return [];
    }
  }

  /**
   * Get reserve statistics
   * @returns {Promise<Object>} Reserve statistics
   */
  async getReserveStats() {
    // For MVP, return mock data
    // In a real app, this would query the Supabase database
    return {
      totalMinted: 1000000,
      totalBurned: 0,
      totalCirculating: 1000000,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get wallet balance
   * @param {string} walletAddress - The wallet address
   * @returns {Promise<number>} The wallet balance
   */
  async getWalletBalance(walletAddress) {
    console.log(`[SUPABASE] Getting wallet balance for ${walletAddress}`);
    
    try {
      const { data, error } = await supabaseAdmin
        .from('wallets')
        .select('balance')
        .eq('address', walletAddress)
        .single();
      
      if (error) {
        console.error('[SUPABASE] Error fetching wallet balance:', error.message);
        return 0;
      }
      
      console.log(`[SUPABASE] Retrieved wallet balance for ${walletAddress}: ${data.balance}`);
      return data.balance || 0;
    } catch (error) {
      console.error('[SUPABASE] Error in getWalletBalance:', error);
      return 0;
    }
  }

  /**
   * Update wallet balance
   * @param {string} walletAddress - The wallet address
   * @param {number} amount - The amount to add to the balance (can be negative)
   * @returns {Promise<boolean>} Success status
   */
  async updateWalletBalance(walletAddress, amount) {
    console.log(`[SUPABASE] Updating wallet balance for ${walletAddress} by ${amount}`);
    
    try {
      // First get the current balance
      const currentBalance = await this.getWalletBalance(walletAddress);
      
      const newBalance = currentBalance + amount;
      
      // Update the balance
      const { error } = await supabaseAdmin
        .from('wallets')
        .update({ balance: newBalance })
        .eq('address', walletAddress);
      
      if (error) {
        console.error('[SUPABASE] Error updating wallet balance:', error.message);
        return false;
      }
      
      console.log(`[SUPABASE] Successfully updated wallet balance for ${walletAddress} to ${newBalance}`);
      return true;
    } catch (error) {
      console.error('[SUPABASE] Error in updateWalletBalance:', error);
      return false;
    }
  }

  /**
   * Save a wallet transaction to the database
   * @param {Object} transaction - The transaction details
   * @returns {Promise<Object>} The saved transaction
   */
  async saveWalletTransaction(transaction) {
    // Using admin client for backend operations
    const { data, error } = await supabaseAdmin
      .from('wallet_transactions')
      .insert([{
        wallet_address: transaction.walletAddress,
        amount: transaction.amount,
        memo: transaction.memo || '',
        transaction_hash: transaction.transactionHash || '',
        status: transaction.status || 'completed',
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving wallet transaction:', error.message);
      return null;
    }

    return data;
  }

  /**
   * Get wallet transactions for a wallet
   * @param {string} walletAddress - The wallet address
   * @param {number} limit - Maximum number of transactions to return
   * @returns {Promise<Array>} List of transactions
   */
  async getWalletTransactionsByAddress(walletAddress, limit = 10) {
    console.log(`[SUPABASE] Getting wallet transactions for ${walletAddress}`);
    
    try {
      // Get transactions where wallet is sender or recipient
      const { data, error } = await supabaseAdmin
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_address', walletAddress)
        .order('timestamp', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('[SUPABASE] Error fetching wallet transactions:', error.message);
        return [];
      }
      
      console.log(`[SUPABASE] Found ${data.length} wallet transactions for ${walletAddress}`);
      return data || [];
    } catch (error) {
      console.error('[SUPABASE] Error in getWalletTransactionsByAddress:', error);
      return [];
    }
  }
}

module.exports = new SupabaseService();
