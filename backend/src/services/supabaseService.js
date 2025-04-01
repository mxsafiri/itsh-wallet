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

    if (!data) {
      return null;
    }

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
   * @returns {Promise<Array>} The user's transactions
   */
  async getUserTransactions(phoneNumber) {
    // Using admin client for backend operations
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .or(`sender_phone.eq.${phoneNumber},recipient_phone.eq.${phoneNumber}`)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching user transactions:', error.message);
      return [];
    }

    return data.map(tx => ({
      id: tx.id,
      senderPhone: tx.sender_phone,
      recipientPhone: tx.recipient_phone,
      amount: tx.amount,
      memo: tx.memo,
      transactionHash: tx.transaction_hash,
      status: tx.status,
      timestamp: tx.timestamp,
      type: tx.sender_phone === phoneNumber ? 'send' : 'receive'
    }));
  }

  /**
   * Update user's iTZS balance
   * @param {string} phoneNumber - The user's phone number
   * @param {number} amount - The amount to add (positive) or subtract (negative)
   * @returns {Promise<boolean>} Success status
   */
  async updateUserBalance(phoneNumber, amount) {
    // Get current balance
    const user = await this.getUserByPhone(phoneNumber);
    
    if (!user) {
      console.error(`User not found: ${phoneNumber}`);
      return false;
    }
    
    const newBalance = (user.iTZSAmount || 0) + amount;
    
    // Update balance
    const { error } = await supabaseAdmin
      .from('users')
      .update({ iTZS_amount: newBalance })
      .eq('phone', phoneNumber);
    
    if (error) {
      console.error('Error updating user balance:', error.message);
      return false;
    }
    
    return true;
  }

  /**
   * Get user's iTZS balance
   * @param {string} phoneNumber - The user's phone number
   * @returns {Promise<number>} The user's balance
   */
  async getUserBalance(phoneNumber) {
    const user = await this.getUserByPhone(phoneNumber);
    return user ? user.iTZSAmount || 0 : 0;
  }
}

module.exports = new SupabaseService();
