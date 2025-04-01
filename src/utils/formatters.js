/**
 * Format a phone number for display
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - The formatted phone number
 */
export const formatPhoneNumber = (input) => {
  if (!input) return '';
  
  // Remove all non-digit characters
  const cleaned = input.replace(/\D/g, '');
  
  // Check if this is a Tanzanian number
  if (cleaned.startsWith('255') || cleaned.startsWith('0')) {
    // Format as Tanzanian number
    if (cleaned.startsWith('255')) {
      // Already has country code
      const formatted = cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '+$1 $2 $3 $4');
      return formatted;
    } else if (cleaned.startsWith('0')) {
      // Convert 0XXX to +255XXX format for display
      const withoutLeadingZero = cleaned.substring(1);
      const formatted = `+255 ${withoutLeadingZero.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}`;
      return formatted;
    }
  }
  
  // Default formatting for other numbers
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return cleaned;
};

/**
 * Format phone number for API requests
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - The formatted phone number
 */
export const formatPhoneForApi = (input) => {
  if (!input) return '';
  
  // Remove all non-digit characters
  const cleaned = input.replace(/\D/g, '');
  
  // If it starts with 255, return as is
  if (cleaned.startsWith('255')) {
    return cleaned;
  }
  
  // If it starts with 0, replace with 255
  if (cleaned.startsWith('0')) {
    return `255${cleaned.substring(1)}`;
  }
  
  // If it's a 9-digit number (without country code or leading zero)
  if (cleaned.length === 9) {
    return `255${cleaned}`;
  }
  
  // Otherwise return as is
  return cleaned;
};

/**
 * Format currency amount
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: 'iTZS')
 * @returns {string} - The formatted amount with currency
 */
export const formatCurrency = (amount, currency = 'iTZS') => {
  return `${parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} ${currency}`;
};

/**
 * Format date to a readable format
 * @param {string|Date} date - The date to format
 * @returns {string} - The formatted date
 */
export const formatDate = (date) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Truncate text with ellipsis
 * @param {string} text - The text to truncate
 * @param {number} length - The maximum length
 * @returns {string} - The truncated text
 */
export const truncateText = (text, length = 20) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
};

/**
 * Format transaction type for display
 * @param {string} type - The transaction type
 * @returns {string} - The formatted transaction type
 */
export const formatTransactionType = (type) => {
  const types = {
    'send': 'Sent',
    'receive': 'Received',
    'deposit': 'Deposited',
    'withdraw': 'Withdrawn'
  };
  
  return types[type.toLowerCase()] || type;
};
