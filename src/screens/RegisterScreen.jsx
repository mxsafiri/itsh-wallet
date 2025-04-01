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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Add animation classes after component mounts
    const timer = setTimeout(() => {
      document.querySelector('.logo-container')?.classList.add('logo-animated');
    }, 300);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  const handlePhoneChange = (e) => {
    const input = e.target.value.replace(/\D/g, '');
    setPhoneNumber(input);
    setFormattedPhoneNumber(formatPhoneNumber(input));
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
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
      
      // For demo purposes, let's simulate a successful registration
      if (formattedPhone === '+255744123456') {
        showToastMessage('Account already exists! Please login instead.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      const result = await register(formattedPhone, pin);
      
      if (result.success) {
        showToastMessage('Registration successful!');
        setTimeout(() => {
          navigate('/home');
        }, 1000);
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
    <div className="min-h-screen flex flex-col bg-background-dark text-text-primary relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-success/10 rounded-full filter blur-3xl"></div>
      </div>

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

      <div className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-md slide-up">
          <div className="card p-8 border border-border">
            <div className="flex justify-center mb-8">
              <div className="logo-container relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full filter blur-md animate-pulse"></div>
                <img 
                  src={logo} 
                  alt="NEDApay Logo" 
                  className="h-20 relative z-10 transition-all duration-1000 logo-image"
                />
                <div className="logo-glow absolute inset-0 bg-primary/30 rounded-full filter blur-lg opacity-0 transition-opacity duration-1000"></div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>Create Account</h2>
            
            {error && (
              <div className="bg-error/10 text-error p-4 rounded-lg mb-6 slide-up">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="mb-6">
                <label htmlFor="phoneNumber" className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={formattedPhoneNumber}
                    onChange={handlePhoneChange}
                    className="form-input pl-10"
                    placeholder="+255 XXX XXX XXX"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-text-secondary mt-2">
                  Enter your Tanzanian phone number (e.g., 0744XXXXXX or +255744XXXXXX)
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="pin" className="block text-sm font-medium mb-2">
                  PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="pin"
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="form-input pl-10"
                    placeholder="Create a 4-digit PIN"
                    maxLength={4}
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-text-secondary mt-2">
                  Your PIN must be 4 digits and will be used to secure your account
                </p>
              </div>
              
              <div className="mb-8">
                <label htmlFor="confirmPin" className="block text-sm font-medium mb-2">
                  Confirm PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <input
                    id="confirmPin"
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className="form-input pl-10"
                    placeholder="Confirm your PIN"
                    maxLength={4}
                    disabled={loading}
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : 'Create Account'}
              </button>
            </form>
            
            <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <p className="text-text-secondary">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign In
                </Link>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-border animate-fade-in" style={{ animationDelay: '0.7s' }}>
              <div className="text-xs text-text-secondary space-y-2">
                <p className="font-medium">By creating an account, you agree to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>NEDApay's Terms of Service</li>
                  <li>Privacy Policy</li>
                  <li>Bank of Tanzania regulations for digital payments</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
