const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL and Key must be provided in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Error connecting to Supabase:', error.message);
        return false;
      }
      
      console.log('Successfully connected to Supabase database');
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
        phone_number: '+255123456789',
        stellar_public_key: 'MOCK_PUBLIC_KEY_255123456789',
        pin_hash: '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF', // Hashed version of "1234"
      },
      {
        phone_number: '+255987654321',
        stellar_public_key: 'MOCK_PUBLIC_KEY_255987654321',
        pin_hash: '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF',
      },
      {
        phone_number: '+255111222333',
        stellar_public_key: 'MOCK_PUBLIC_KEY_255111222333',
        pin_hash: '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF',
      },
      {
        phone_number: '+255444555666',
        stellar_public_key: 'MOCK_PUBLIC_KEY_255444555666',
        pin_hash: '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF',
      },
      {
        phone_number: '+255777888999',
        stellar_public_key: 'MOCK_PUBLIC_KEY_255777888999',
        pin_hash: '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF',
      },
    ];

    for (const user of mockUsers) {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone_number', user.phone_number)
        .single();

      if (!existingUser) {
        // Insert new user
        const { error } = await supabase
          .from('users')
          .insert([user]);

        if (error) {
          console.error(`Error creating mock user ${user.phone_number}:`, error.message);
        } else {
          console.log(`Created mock user: ${user.phone_number}`);
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (error) {
      console.error('Error fetching user by phone:', error.message);
      return null;
    }

    return {
      id: data.id,
      phoneNumber: data.phone_number,
      stellarPublicKey: data.stellar_public_key,
      pinHash: data.pin_hash,
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
    const { data, error } = await supabase
      .from('users')
      .insert([{
        phone_number: phoneNumber,
        pin_hash: pinHash,
        stellar_public_key: stellarPublicKey
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error.message);
      return null;
    }

    return {
      id: data.id,
      phoneNumber: data.phone_number,
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
    const { data, error } = await supabase
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
        senders:sender_id(phone_number),
        recipients:recipient_id(phone_number)
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
      senderPhone: tx.senders?.phone_number,
      recipientPhone: tx.recipients?.phone_number,
      amount: tx.amount,
      type: tx.transaction_type,
      status: tx.status,
      stellarTransactionId: tx.stellar_transaction_id,
      createdAt: tx.created_at
    }));
  }
}

module.exports = new SupabaseService();
