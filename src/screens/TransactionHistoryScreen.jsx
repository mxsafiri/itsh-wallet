import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { transactionAPI } from '../services/api';

const TransactionHistoryScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, sent, received
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await transactionAPI.getTransactions(user.id);
      
      if (response.data.success) {
        setTransactions(response.data.transactions || []);
      } else {
        setError(response.data.message || 'Failed to load transactions');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    showToastMessage('Refreshing transactions...');
    fetchTransactions();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    
    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;
    
    return formatDate(dateString);
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  const groupTransactionsByDate = (transactions) => {
    const grouped = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.timestamp || transaction.date || new Date());
      const dateKey = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(transaction);
    });
    
    return grouped;
  };

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleTransactionClick = (transaction) => {
    navigate(`/transaction/${transaction.id}`, { state: { transaction } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-dark text-text-primary pb-16">
      {/* Toast Notification */}
      {showToast && (
        <div className="toast-container">
          <div className="toast toast-success slide-in">
            <div className="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="wallet-header" style={{ paddingBottom: 'var(--spacing-md)' }}>
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/home')} 
            className="mr-3 btn-icon btn-secondary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Transaction History</h1>
          
          <button 
            onClick={handleRefresh}
            className="ml-auto btn-icon btn-secondary"
            disabled={refreshing}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="bg-background-card border-b border-border">
        <div className="flex">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              filter === 'all' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('received')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              filter === 'received' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Received
          </button>
          <button
            onClick={() => setFilter('sent')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              filter === 'sent' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Sent
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex-1 p-4">
        {loading && !refreshing ? (
          <div className="flex justify-center py-8">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="bg-error/10 text-error p-4 rounded-lg slide-up">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
            <button 
              onClick={handleRefresh}
              className="btn btn-error w-full mt-3"
            >
              Try Again
            </button>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="card p-8 text-center slide-up">
            <div className="w-16 h-16 bg-background-card-hover rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-text-secondary">No transactions found</p>
            <button 
              onClick={() => setFilter('all')}
              className="btn btn-secondary mt-4"
            >
              Show All Transactions
            </button>
          </div>
        ) : (
          <div className="space-y-6 slide-up">
            {Object.entries(groupedTransactions).map(([date, transactions]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-text-secondary mb-2">{date}</h3>
                <div className="card overflow-hidden">
                  {transactions.map((transaction, index) => (
                    <div 
                      key={transaction.id || index}
                      className={`p-4 ${index !== transactions.length - 1 ? 'border-b border-border' : ''} hover:bg-background-card-hover cursor-pointer transition-colors`}
                      onClick={() => handleTransactionClick(transaction)}
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${transaction.type === 'received' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
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
                          <div className="flex items-center text-sm text-text-secondary">
                            <span>{formatRelativeTime(transaction.timestamp || transaction.date || new Date())}</span>
                            {transaction.transactionId && (
                              <>
                                <span className="mx-1">•</span>
                                <span className="font-mono text-xs truncate">{transaction.transactionId.substring(0, 10)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className={`font-semibold ${transaction.type === 'received' ? 'text-success' : 'text-error'}`}>
                          {transaction.type === 'received' ? '+' : '-'}{transaction.amount.toLocaleString()} iTZS
                        </div>
                      </div>
                      
                      {transaction.memo && (
                        <div className="mt-2 ml-14">
                          <p className="text-sm text-text-secondary">Memo: {transaction.memo}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistoryScreen;
