import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './styles.css';

// Simple web version of NEDApay for demo purposes
function NEDAPayWebApp() {
  const [screen, setScreen] = useState('welcome'); // welcome, login, register, home
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState('0');
  
  // Form states
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo login - in production this would call your actual API
      if (phone === '123456789' && password === 'demo') {
        setUser({
          id: '1',
          name: 'Demo User',
          phone: '123456789'
        });
        setBalance('1000');
        setScreen('home');
      } else {
        setError('Invalid credentials. Try phone: 123456789, password: demo');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo registration
      setUser({
        id: '2',
        name: name || 'New User',
        phone: phone
      });
      setBalance('500');
      setScreen('home');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Logout
  const handleLogout = () => {
    setUser(null);
    setScreen('welcome');
  };
  
  // Render welcome screen
  const renderWelcome = () => (
    <div className="welcome-screen">
      <div className="logo-container">
        <h1>NEDApay</h1>
        <p>Tanzania's Digital Payment Solution</p>
      </div>
      
      <div className="features">
        <div className="feature-item">
          <span className="icon">⚡</span>
          <span>Fast & Secure Payments</span>
        </div>
        <div className="feature-item">
          <span className="icon">💰</span>
          <span>Digital Tanzanian Shilling</span>
        </div>
        <div className="feature-item">
          <span className="icon">🌐</span>
          <span>Powered by Stellar Blockchain</span>
        </div>
      </div>
      
      <div className="button-container">
        <button className="primary-button" onClick={() => setScreen('login')}>Login</button>
        <button className="secondary-button" onClick={() => setScreen('register')}>Register</button>
      </div>
    </div>
  );
  
  // Render login screen
  const renderLogin = () => (
    <div className="auth-screen">
      <h1>Login to NEDApay</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Phone Number</label>
          <input 
            type="text" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <p className="auth-switch">
        Don't have an account? <a href="#" onClick={() => setScreen('register')}>Register</a>
      </p>
      
      <button className="back-button" onClick={() => setScreen('welcome')}>Back</button>
    </div>
  );
  
  // Render register screen
  const renderRegister = () => (
    <div className="auth-screen">
      <h1>Create NEDApay Account</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label>Full Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Phone Number</label>
          <input 
            type="text" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
          />
        </div>
        
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      
      <p className="auth-switch">
        Already have an account? <a href="#" onClick={() => setScreen('login')}>Login</a>
      </p>
      
      <button className="back-button" onClick={() => setScreen('welcome')}>Back</button>
    </div>
  );
  
  // Render home screen
  const renderHome = () => (
    <div className="home-screen">
      <div className="header">
        <h1>NEDApay</h1>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
      
      <div className="user-info">
        <p>Welcome, {user?.name}</p>
      </div>
      
      <div className="balance-card">
        <div className="balance-label">Your Balance</div>
        <div className="balance-amount">{balance} iTZS</div>
      </div>
      
      <div className="action-buttons">
        <button className="action-button send">
          <span className="action-icon">↑</span>
          <span>Send</span>
        </button>
        <button className="action-button receive">
          <span className="action-icon">↓</span>
          <span>Receive</span>
        </button>
        <button className="action-button scan">
          <span className="action-icon">📷</span>
          <span>Scan</span>
        </button>
      </div>
      
      <div className="transactions">
        <h2>Recent Transactions</h2>
        <div className="transaction-list">
          <div className="transaction-item">
            <div className="transaction-icon received">↓</div>
            <div className="transaction-details">
              <div className="transaction-title">Received from John</div>
              <div className="transaction-date">Today, 10:30 AM</div>
            </div>
            <div className="transaction-amount">+200 iTZS</div>
          </div>
          <div className="transaction-item">
            <div className="transaction-icon sent">↑</div>
            <div className="transaction-details">
              <div className="transaction-title">Sent to Mary</div>
              <div className="transaction-date">Yesterday, 2:15 PM</div>
            </div>
            <div className="transaction-amount">-150 iTZS</div>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Main render function
  return (
    <div className="app-container">
      {screen === 'welcome' && renderWelcome()}
      {screen === 'login' && renderLogin()}
      {screen === 'register' && renderRegister()}
      {screen === 'home' && renderHome()}
    </div>
  );
}

// Mount the app
ReactDOM.render(
  <NEDAPayWebApp />,
  document.getElementById('root')
);

export default NEDAPayWebApp;
