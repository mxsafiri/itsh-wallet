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
      // Check connection by fetching a single row from users table
      // Using admin client to ensure we can access the table regardless of RLS
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Error connecting to Supabase:', error.message);
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
      },
      {
        phone: '+255987654321',
        stellar_public_key: 'MOCK_PUBLIC_KEY_255987654321',
        pin: '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF',
      },
      {
        phone: '+255111222333',
        stellar_public_key: 'MOCK_PUBLIC_KEY_255111222333',
        pin: '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF',
      },
      {
        phone: '+255444555666',
        stellar_public_key: 'MOCK_PUBLIC_KEY_255444555666',
        pin: '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF',
      },
      {
        phone: '+255777888999',
        stellar_public_key: 'MOCK_PUBLIC_KEY_255777888999',
        pin: '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF',
      },
    ];

    for (const user of mockUsers) {
      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
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
   * Get a user by ID
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} The user object
   */
  async getUserById(userId) {
    // Using admin client for backend operations
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user by ID:', error.message);
      return null;
    }

    return data;
  }

  /**
   * Get a user by phone number
   * @param {string} phoneNumber - The user's phone number
   * @returns {Promise<Object>} The user object
   */
  async getUserByPhone(phoneNumber) {
    // Using admin client for backend operations
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('phone', phoneNumber)
      .single();

    if (error) {
      console.error('Error fetching user by phone:', error.message);
      return null;
    }

    return {
      id: data.id,
      phoneNumber: data.phone,
      stellarPublicKey: data.stellar_public_key,
      pinHash: data.pin,
      createdAt: data.created_at
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
        iTZS_amount: 0, // Initialize with zero balance
        stellar_key: '' // Empty string for stellar key
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error.message);
      return null;
    }

    return {
      id: data.id,
      phoneNumber: data.phone,
      stellarPublicKey: data.stellar_public_key,
      createdAt: data.created_at
    };
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
        sender_id: transaction.senderId,
        recipient_id: transaction.recipientId,
        amount: transaction.amount,
        transaction_type: transaction.type,
        status: transaction.status,
        stellar_transaction_id: transaction.stellarTransactionId
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving transaction:', error.message);
      return null;
    }

    return {
      id: data.id,
      senderId: data.sender_id,
      recipientId: data.recipient_id,
      amount: data.amount,
      type: data.transaction_type,
      status: data.status,
      stellarTransactionId: data.stellar_transaction_id,
      createdAt: data.created_at
    };
  }

  /**
   * Get a user's transaction history
   * @param {string} userId - The user ID
   * @param {number} limit - Maximum number of transactions to return
   * @returns {Promise<Array>} Array of transaction objects
   */
  async getTransactionHistory(userId, limit = 20) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        sender_id,
        recipient_id,
        amount,
        transaction_type,
        status,
        stellar_transaction_id,
        created_at,
        senders:sender_id(phone),
        recipients:recipient_id(phone)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching transaction history:', error.message);
      return [];
    }

    return data.map(tx => ({
      id: tx.id,
      senderId: tx.sender_id,
      recipientId: tx.recipient_id,
      senderPhone: tx.senders?.phone,
      recipientPhone: tx.recipients?.phone,
      amount: tx.amount,
      type: tx.transaction_type,
      status: tx.status,
      stellarTransactionId: tx.stellar_transaction_id,
      createdAt: tx.created_at
    }));
  }

  /**
   * Get transactions by external ID (Stellar transaction ID)
   * @param {string} externalId - The external transaction ID
   * @returns {Promise<Array>} Array of transactions
   */
  async getTransactionByExternalId(externalId) {
    // Using admin client for backend operations
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('stellar_transaction_id', externalId);

    if (error) {
      console.error('Error fetching transaction by external ID:', error.message);
      return null;
    }

    return data;
  }

  /**
   * Update a transaction
   * @param {string} transactionId - The transaction ID
   * @param {Object} updates - The fields to update
   * @returns {Promise<Object>} The updated transaction
   */
  async updateTransaction(transactionId, updates) {
    // Using admin client for backend operations
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error.message);
      return null;
    }

    return data;
  }

  /**
   * Get user's transaction history
   * @param {string} userId - The user ID
   * @param {number} limit - Maximum number of transactions to return
   * @returns {Promise<Array>} Array of transactions
   */
  async getUserTransactions(userId, limit = 10) {
    // Using admin client for backend operations
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user transactions:', error.message);
      return [];
    }

    return data;
  }
}

module.exports = new SupabaseService();
