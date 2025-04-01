import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatPhoneNumber, formatPhoneForApi } from '../utils/formatters';
import logo from '../assets/logo.svg';

const RegisterScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
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
    
    // Validate form
    if (!phoneNumber || phoneNumber.length < 9) {
      setError('Please enter a valid phone number');
      return;
    }
    
    if (!pin || pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }
    
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Format phone number for API request
      const formattedPhone = formatPhoneForApi(phoneNumber);
      console.log('Registering with formatted phone:', formattedPhone);
      
      const result = await register(formattedPhone, pin);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Failed to register. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
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
          
          <h2 className="text-2xl font-bold text-center text-secondary mb-6">Create Account</h2>
          
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
            
            <div className="mb-4">
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
                PIN
              </label>
              <input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="custom-input"
                placeholder="Create a 4-digit PIN"
                maxLength={4}
                disabled={loading}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm PIN
              </label>
              <input
                id="confirmPin"
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className="custom-input"
                placeholder="Confirm your PIN"
                maxLength={4}
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              className="w-full custom-button"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
