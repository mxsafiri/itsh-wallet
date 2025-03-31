import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber || !pin) {
      setError('Please enter both phone number and PIN');
      return;
    }
    
    // Format phone number if needed
    let formattedPhone = phoneNumber;
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await login(formattedPhone, pin);
      
      if (result.success) {
        navigate('/home');
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary to-primary-dark text-white p-6">
      <div className="flex items-center mb-8">
        <Link to="/" className="text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-xl font-semibold ml-4">LOGIN</h1>
      </div>

      {error && (
        <div className="bg-red-500/80 text-white p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-6">Welcome to NEDApay</h2>
          
          <div className="mb-6">
            <label className="block text-white/80 mb-2">Phone Number</label>
            <div className="flex items-center bg-white/10 rounded-lg p-3 mb-2">
              <div className="flex items-center mr-2">
                <img src="https://flagcdn.com/w20/tz.png" alt="Tanzania" className="h-5 mr-2" />
                <span>+255</span>
              </div>
              <input
                type="tel"
                placeholder="712 345 678"
                className="bg-transparent flex-1 outline-none"
                value={phoneNumber.replace(/^\+255/, '')}
                onChange={(e) => setPhoneNumber('+255' + e.target.value.replace(/^\+255/, ''))}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-white/80 mb-2">PIN</label>
            <div className="bg-white/10 rounded-lg p-3 mb-2">
              <input
                type="password"
                placeholder="Enter your PIN"
                className="bg-transparent w-full outline-none"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={6}
              />
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          className="bg-white text-primary font-semibold py-3 rounded-lg"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Login'}
        </button>
        
        <div className="mt-6 text-center">
          <p>Don't have an account? <Link to="/register" className="font-semibold underline">Register</Link></p>
        </div>
      </form>
      
      <div className="mt-8 text-center">
        <img src="/logo-white.png" alt="NEDApay" className="h-8 mx-auto" />
        <p className="mt-2 text-white/70 text-sm">Secure iTZS Wallet</p>
      </div>
    </div>
  );
};

export default LoginScreen;
