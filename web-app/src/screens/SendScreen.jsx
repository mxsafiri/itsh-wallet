import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { transactionAPI, userAPI } from '../services/api';

const SendScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Enter phone, 2: Enter amount, 3: Confirm, 4: Success
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const handleFindRecipient = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Format phone number if needed
      let formattedPhone = recipientPhone;
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }
      
      const response = await userAPI.findUserByPhone(formattedPhone);
      
      if (response.data.success && response.data.user) {
        setRecipientInfo(response.data.user);
        setStep(2);
      } else {
        setError('User not found. Please check the phone number and try again.');
      }
    } catch (err) {
      console.error('Error finding recipient:', err);
      setError('Failed to find recipient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountSubmit = (e) => {
    e.preventDefault();
    
    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    setStep(3);
  };

  const handleSendPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await transactionAPI.sendPayment(
        user.id,
        recipientInfo.id,
        parseFloat(amount),
        memo
      );
      
      if (response.data.success) {
        setTransactionId(response.data.transactionId || 'TX-' + Date.now());
        setStep(4);
      } else {
        setError(response.data.message || 'Transaction failed. Please try again.');
      }
    } catch (err) {
      console.error('Error sending payment:', err);
      setError('Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white p-4">
        <div className="flex items-center">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/home')} className="mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">
            {step === 1 && 'Send iTZS'}
            {step === 2 && 'Enter Amount'}
            {step === 3 && 'Confirm Payment'}
            {step === 4 && 'Payment Sent'}
          </h1>
        </div>
      </header>

      <div className="flex-1 p-6">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleFindRecipient} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Recipient Phone Number</label>
              <div className="flex items-center bg-white rounded-lg border border-gray-300 overflow-hidden">
                <div className="flex items-center bg-gray-100 px-3 py-2 border-r border-gray-300">
                  <img src="https://flagcdn.com/w20/tz.png" alt="Tanzania" className="h-5 mr-2" />
                  <span>+255</span>
                </div>
                <input
                  type="tel"
                  value={recipientPhone.replace(/^\+255/, '')}
                  onChange={(e) => setRecipientPhone('+255' + e.target.value.replace(/^\+255/, ''))}
                  placeholder="744277496"
                  className="flex-1 p-2 outline-none"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-dark transition duration-200"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Continue'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleAmountSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-lg font-semibold">{recipientInfo?.name || 'User'}</p>
              <p className="text-gray-500">{recipientPhone}</p>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Amount (iTZS)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">iTZS</span>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-12 pr-3 py-3 bg-white rounded-lg border border-gray-300 outline-none"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Memo (Optional)</label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="What's this for?"
                className="w-full p-3 bg-white rounded-lg border border-gray-300 outline-none"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-dark transition duration-200"
            >
              Continue
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Recipient</span>
                  <span className="font-medium">{recipientInfo?.name || 'User'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium">{recipientPhone}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium">{amount} iTZS</span>
                </div>
                
                {memo && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Memo</span>
                    <span className="font-medium">{memo}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Fee</span>
                  <span className="font-medium">0 iTZS</span>
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex justify-between">
                  <span className="text-gray-700 font-semibold">Total</span>
                  <span className="font-semibold">{amount} iTZS</span>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSendPayment}>
              <button
                type="submit"
                className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-dark transition duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Slide to Send'
                )}
              </button>
            </form>
          </div>
        )}

        {step === 4 && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold">Payment Successful!</h2>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium">{amount} iTZS</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">To</span>
                  <span className="font-medium">{recipientPhone}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-medium text-xs">{transactionId}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">{new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 pt-4">
              <button
                onClick={() => navigate('/home')}
                className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-dark transition duration-200"
              >
                Back to Home
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
                className="w-full bg-white border border-primary text-primary font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition duration-200"
              >
                Send Another Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendScreen;
