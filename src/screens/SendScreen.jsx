import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTransaction } from '../contexts/TransactionContext';
import { toast } from 'react-toastify';
import mockTransactionService from '../services/mockTransactionService';
import { formatDistanceToNow } from 'date-fns';

const SendScreen = () => {
  const { user } = useAuth();
  const { 
    sendPayment, 
    recentRecipients, 
    isLoading: transactionLoading 
  } = useTransaction();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Enter phone, 2: Enter amount, 3: Confirm, 4: Success
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [quickAmounts, setQuickAmounts] = useState([1000, 5000, 10000, 20000]);

  // Format phone number as user types
  const formatPhoneNumber = (input) => {
    // Remove any non-digit characters
    let digits = input.replace(/\D/g, '');
    
    // Ensure it starts with Tanzania country code
    if (!digits.startsWith('255')) {
      // If it starts with 0, replace with 255
      if (digits.startsWith('0')) {
        digits = '255' + digits.substring(1);
      } else {
        // Otherwise just add 255 prefix
        digits = '255' + digits;
      }
    }
    
    return '+' + digits;
  };

  const handleFindRecipient = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Format phone number if needed
      let formattedPhone = formatPhoneNumber(recipientPhone);
      
      // Find user from mock service
      const foundUser = mockTransactionService.getUserByPhoneNumber(formattedPhone);
      
      if (foundUser) {
        setRecipientInfo(foundUser);
        toast.success('Recipient found');
        setStep(2);
      } else {
        setError('User not found. Please check the phone number and try again.');
        toast.error('User not found');
      }
    } catch (err) {
      console.error('Error finding recipient:', err);
      setError('Failed to find recipient. Please try again.');
      toast.error('Failed to find recipient');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecipient = (recipient) => {
    setRecipientPhone(recipient.phoneNumber);
    setRecipientInfo(recipient);
    toast.success('Recipient selected');
    setStep(2);
  };

  const handleAmountSubmit = (e) => {
    e.preventDefault();
    
    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      toast.error('Please enter a valid amount');
      return;
    }
    
    // Check if user has sufficient balance
    if (numAmount > user.iTZSAmount) {
      setError(`Insufficient balance. You have ${user.iTZSAmount.toLocaleString()} iTZS available.`);
      toast.error('Insufficient balance');
      return;
    }
    
    toast.success('Amount confirmed');
    setStep(3);
  };

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
  };

  const handleSendPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const numAmount = parseFloat(amount);
      
      // Use the transaction context to send payment
      const result = await sendPayment(
        recipientInfo.phoneNumber,
        numAmount,
        memo
      );
      
      if (result.success) {
        setTransactionId(result.transaction.id);
        setStep(4);
      } else {
        throw new Error(result.error || 'Transaction failed');
      }
    } catch (err) {
      console.error('Error sending payment:', err);
      setError('Transaction failed. Please try again.');
      toast.error('Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-dark text-text-primary pb-16">
      {/* Header */}
      <header className="screen-header">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Send Money</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {/* Step 1: Enter Recipient */}
        {step === 1 && (
          <div className="slide-up">
            <h2 className="text-lg font-semibold mb-4">Enter Recipient</h2>
            
            {/* Recent Recipients */}
            {recentRecipients.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm text-text-secondary mb-2">Recent Recipients</h3>
                <div className="grid grid-cols-2 gap-3">
                  {recentRecipients.map((recipient) => (
                    <button
                      key={recipient.phoneNumber}
                      onClick={() => handleSelectRecipient(recipient)}
                      className="bg-background-card hover:bg-background-card-hover p-3 rounded-lg flex items-center transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-3 flex-shrink-0">
                        {getInitials(recipient.name)}
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="font-medium truncate">{recipient.name}</p>
                        <p className="text-xs text-text-secondary truncate">{formatDate(recipient.lastTransaction)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Phone Number Form */}
            <form onSubmit={handleFindRecipient} className="bg-background-card p-4 rounded-lg">
              <div className="mb-4">
                <label htmlFor="phoneNumber" className="block text-sm text-text-secondary mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+255744123456"
                    className="form-input pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  Enter a Tanzanian phone number (format: +255XXXXXXXXX)
                </p>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-error/10 text-error rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Finding...
                  </div>
                ) : (
                  'Continue'
                )}
              </button>
            </form>
          </div>
        )}
        
        {/* Step 2: Enter Amount */}
        {step === 2 && (
          <div className="slide-up">
            <h2 className="text-lg font-semibold mb-4">Enter Amount</h2>
            
            {/* Recipient Info */}
            <div className="bg-background-card p-4 rounded-lg mb-4 flex items-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-4">
                {getInitials(recipientInfo.name)}
              </div>
              <div>
                <p className="font-medium">{recipientInfo.name}</p>
                <p className="text-sm text-text-secondary">{recipientInfo.phoneNumber}</p>
              </div>
              <button 
                onClick={() => setStep(1)} 
                className="ml-auto text-primary"
              >
                Change
              </button>
            </div>
            
            {/* Amount Form */}
            <form onSubmit={handleAmountSubmit} className="bg-background-card p-4 rounded-lg">
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm text-text-secondary mb-1">
                  Amount (iTZS)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-text-secondary">iTZS</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="form-input pl-12 text-xl font-bold"
                    required
                  />
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  Available balance: {user.iTZSAmount.toLocaleString()} iTZS
                </p>
              </div>
              
              {/* Quick Amounts */}
              <div className="mb-4">
                <p className="text-sm text-text-secondary mb-2">Quick Amounts</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickAmounts.map((quickAmount) => (
                    <button
                      key={quickAmount}
                      type="button"
                      onClick={() => handleQuickAmount(quickAmount)}
                      className="bg-background-card-hover hover:bg-primary/10 p-2 rounded-md text-center transition-colors"
                    >
                      {quickAmount.toLocaleString()} iTZS
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Memo Field */}
              <div className="mb-4">
                <label htmlFor="memo" className="block text-sm text-text-secondary mb-1">
                  Memo (Optional)
                </label>
                <input
                  type="text"
                  id="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="What's this payment for?"
                  className="form-input"
                />
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-error/10 text-error rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-outline flex-1"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={!amount || loading}
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Step 3: Confirm Payment */}
        {step === 3 && (
          <div className="slide-up">
            <h2 className="text-lg font-semibold mb-4">Confirm Payment</h2>
            
            <div className="bg-background-card p-4 rounded-lg mb-4">
              <div className="flex flex-col items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-2">
                  {getInitials(recipientInfo.name)}
                </div>
                <p className="font-medium text-lg">{recipientInfo.name}</p>
                <p className="text-sm text-text-secondary">{recipientInfo.phoneNumber}</p>
              </div>
              
              <div className="border-t border-b border-border py-4 my-4">
                <div className="flex justify-between mb-2">
                  <span className="text-text-secondary">Amount</span>
                  <span className="font-bold">{parseFloat(amount).toLocaleString()} iTZS</span>
                </div>
                {memo && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Memo</span>
                    <span>{memo}</span>
                  </div>
                )}
              </div>
              
              <div className="text-center text-sm text-text-secondary mb-4">
                <p>You are about to send {parseFloat(amount).toLocaleString()} iTZS to {recipientInfo.name}.</p>
                <p>Please confirm to proceed with this transaction.</p>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-error/10 text-error rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(2)}
                  className="btn btn-outline flex-1"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  onClick={handleSendPayment}
                  className="btn btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    'Confirm & Send'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 4: Success */}
        {step === 4 && (
          <div className="slide-up flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full bg-success/20 text-success flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-text-secondary mb-6">
              You have successfully sent {parseFloat(amount).toLocaleString()} iTZS to {recipientInfo.name}.
            </p>
            
            <div className="bg-background-card p-4 rounded-lg w-full mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary">Amount</span>
                <span className="font-bold">{parseFloat(amount).toLocaleString()} iTZS</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary">Recipient</span>
                <span>{recipientInfo.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary">Phone</span>
                <span>{recipientInfo.phoneNumber}</span>
              </div>
              {memo && (
                <div className="flex justify-between mb-2">
                  <span className="text-text-secondary">Memo</span>
                  <span>{memo}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-secondary">Transaction ID</span>
                <span className="text-xs">{transactionId}</span>
              </div>
            </div>
            
            <div className="flex space-x-3 w-full">
              <button
                onClick={() => navigate('/transactions')}
                className="btn btn-outline flex-1"
              >
                View History
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setRecipientPhone('');
                  setRecipientInfo(null);
                  setAmount('');
                  setMemo('');
                  setError('');
                }}
                className="btn btn-primary flex-1"
              >
                New Payment
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <Link to="/home" className="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-7-7v14" />
          </svg>
          <span>Home</span>
        </Link>
        
        <Link to="/transactions" className="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Transactions</span>
        </Link>
        
        <Link to="/security" className="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Security</span>
        </Link>
        
        <Link to="/settings" className="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Settings</span>
        </Link>
      </nav>
    </div>
  );
};

export default SendScreen;
