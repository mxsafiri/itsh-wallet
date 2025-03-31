import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { walletAPI, transactionAPI } from '../services/api';

const HomeScreen = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch balance
      const balanceResponse = await walletAPI.getBalance(user.id);
      if (balanceResponse.data.success) {
        setBalance(balanceResponse.data.balance);
      }
      
      // Fetch transactions
      const transactionsResponse = await transactionAPI.getTransactions(user.id);
      if (transactionsResponse.data.success) {
        setTransactions(transactionsResponse.data.transactions || []);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load your wallet data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUserData();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={() => navigate('/settings')} className="mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">NEDApay</h1>
          </div>
          <button onClick={logout} className="bg-white/20 px-3 py-1 rounded-full text-sm">
            Logout
          </button>
        </div>
      </header>

      {/* Balance Card */}
      <div className="bg-primary text-white p-6 pb-12 rounded-b-3xl shadow-md">
        <div className="text-center">
          <p className="text-white/80 mb-1">Amount Balance</p>
          <div className="flex justify-center items-baseline">
            <h2 className="text-4xl font-bold">{balance.toLocaleString()}</h2>
            <span className="ml-2">iTZS</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center -mt-6 px-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-4 w-full flex justify-around">
          <Link to="/send" className="flex flex-col items-center p-2">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <span className="text-sm font-medium">Send</span>
          </Link>
          
          <Link to="/receive" className="flex flex-col items-center p-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
            <span className="text-sm font-medium">Receive</span>
          </Link>
          
          <Link to="/scan" className="flex flex-col items-center p-2">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <span className="text-sm font-medium">Scan</span>
          </Link>
        </div>
      </div>

      {/* Transaction History */}
      <div className="flex-1 px-6 pb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <button 
            onClick={handleRefresh}
            className="text-primary flex items-center"
            disabled={refreshing}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-1 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {loading && !refreshing ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <p className="text-gray-500">No transactions yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {transactions.map((transaction, index) => (
              <div 
                key={transaction.id || index}
                className={`flex items-center p-4 ${index !== transactions.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${transaction.type === 'received' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                  {transaction.type === 'received' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="font-medium">{transaction.description || (transaction.type === 'received' ? 'Received' : 'Sent')}</p>
                  <p className="text-sm text-gray-500">{formatDate(transaction.timestamp || new Date())}</p>
                </div>
                
                <div className={`font-semibold ${transaction.type === 'received' ? 'text-green-500' : 'text-red-500'}`}>
                  {transaction.type === 'received' ? '+' : '-'}{transaction.amount} iTZS
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 py-3 px-6">
        <div className="flex justify-between">
          <Link to="/home" className="flex flex-col items-center text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>
          
          <Link to="/transactions" className="flex flex-col items-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs mt-1">History</span>
          </Link>
          
          <Link to="/security" className="flex flex-col items-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs mt-1">Security</span>
          </Link>
          
          <Link to="/settings" className="flex flex-col items-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
