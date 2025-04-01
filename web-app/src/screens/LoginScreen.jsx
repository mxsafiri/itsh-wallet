import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatPhoneNumber, formatPhoneForApi } from '../utils/formatters';
import logo from '../assets/logo.svg';

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handlePhoneChange = (e) => {
    const input = e.target.value.replace(/\D/g, '');
    setPhoneNumber(input);
    setFormattedPhoneNumber(formatPhoneNumber(input));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber || !pin) {
      setError('Please enter both phone number and PIN');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Format phone number for API request
      const formattedPhone = formatPhoneForApi(phoneNumber);
      console.log('Submitting with formatted phone:', formattedPhone);
      
      const result = await login(formattedPhone, pin);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Failed to sign in. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="NEDApay Logo" className="h-16" />
          </div>
          
          <h2 className="text-2xl font-bold text-center text-secondary mb-6">Welcome Back</h2>
          
          {error && (
            <div className="bg-red-50 text-error p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                value={formattedPhoneNumber}
                onChange={handlePhoneChange}
                className="custom-input"
                placeholder="+255 XXX XXX XXX"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your Tanzanian phone number (e.g., 0744XXXXXX or +255744XXXXXX)
              </p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
                PIN
              </label>
              <input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="custom-input"
                placeholder="Enter your 4-digit PIN"
                maxLength={4}
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              className="w-full custom-button"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
