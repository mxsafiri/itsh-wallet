import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTransaction } from '../contexts/TransactionContext';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';

const HomeScreen = () => {
  const { user, logout } = useAuth();
  const { 
    transactions, 
    isLoading, 
    refreshTransactions 
  } = useTransaction();
  const navigate = useNavigate();
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Initial data fetch is handled by the TransactionContext
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    refreshTransactions();
    toast.info('Refreshing transaction data...');
    
    // Simulate a delay for the refresh animation
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Wallet data refreshed successfully');
    }, 1500);
  };

  const formatDate = (date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown date';
    }
  };

  const formatAmount = (amount, incoming) => {
    return `${incoming ? '+' : '-'} ${amount.toLocaleString()} iTZS`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-dark text-text-primary pb-16">
      {/* Header */}
      <header className="wallet-header">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">NEDApay <span className="demo-badge">Demo</span></h1>
          </div>
          <button onClick={logout} className="btn-secondary text-sm px-3 py-1 rounded-full">
            Logout
          </button>
        </div>
        
        <div className="balance-container">
          <p className="balance-label">Amount Balance</p>
          <h2 className="balance-amount">{user?.iTZSAmount?.toLocaleString() || '0'}</h2>
          <span className="balance-currency">iTZS</span>
        </div>
      </header>

      {/* Action Buttons */}
      <div className="action-buttons">
        <Link to="/send" className="action-button">
          <div className="action-icon send">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          </div>
          <span className="action-label">Send</span>
        </Link>
        
        <Link to="/receive" className="action-button">
          <div className="action-icon receive">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          </div>
          <span className="action-label">Receive</span>
        </Link>
        
        <Link to="/scan" className="action-button">
          <div className="action-icon scan">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <span className="action-label">Scan</span>
        </Link>
      </div>

      {/* Transaction History */}
      <div className="transactions-container">
        <div className="transactions-header">
          <h3 className="transactions-title">Recent Transactions</h3>
          <button 
            onClick={handleRefresh}
            className="refresh-button"
            disabled={refreshing}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-1 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        
        <div className="transactions-list">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="empty-transactions">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-2 text-text-secondary">No transactions yet</p>
              <button 
                onClick={() => navigate('/send')} 
                className="mt-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium"
              >
                Make your first transaction
              </button>
            </div>
          ) : (
            transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="transaction-item">
                <div className={`transaction-icon ${tx.incoming ? 'received' : 'sent'}`}>
                  {tx.incoming ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  )}
                </div>
                <div className="transaction-details">
                  <div className="transaction-info">
                    <span className="transaction-name">{tx.memo || (tx.incoming ? 'Received Payment' : 'Sent Payment')}</span>
                    <span className="transaction-time">{formatDate(tx.timestamp)}</span>
                  </div>
                  <div className="transaction-amount">
                    <span className={`amount ${tx.incoming ? 'received' : 'sent'}`}>
                      {formatAmount(tx.amount, tx.incoming)}
                    </span>
                    <span className={`status ${tx.status}`}>{tx.status}</span>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {transactions.length > 5 && (
            <Link to="/transactions" className="view-all-link">
              View all transactions
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <Link to="/home" className="nav-item active">
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

export default HomeScreen;
