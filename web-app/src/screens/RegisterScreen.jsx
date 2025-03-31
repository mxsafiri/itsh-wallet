import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      setError('Please enter your phone number');
      return;
    }
    
    // Format phone number if needed
    let formattedPhone = phoneNumber;
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    }
    
    // In a real app, you would send OTP here
    // For demo purposes, we'll just show the OTP screen
    setShowOTP(true);
    setError('');
    
    // Mock OTP sent message
    setTimeout(() => {
      alert('OTP sent successfully to ' + formattedPhone);
    }, 1000);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }
    
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Format phone number if needed
      let formattedPhone = phoneNumber;
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }
      
      const result = await register(formattedPhone, pin);
      
      if (result.success) {
        navigate('/home');
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
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
        <h1 className="text-xl font-semibold ml-4">
          {showOTP ? 'VERIFY OTP' : 'VERIFY PHONE'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-500/80 text-white p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {!showOTP ? (
        // Phone verification form
        <form onSubmit={handlePhoneSubmit} className="flex-1 flex flex-col">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-6">Enter your phone number</h2>
            
            <div className="mb-6">
              <div className="flex items-center bg-white/10 rounded-lg p-3 mb-2">
                <div className="flex items-center mr-2">
                  <img src="https://flagcdn.com/w20/tz.png" alt="Tanzania" className="h-5 mr-2" />
                  <span>+255</span>
                </div>
                <input
                  type="tel"
                  value={phoneNumber.replace(/^\+255/, '')}
                  onChange={(e) => setPhoneNumber('+255' + e.target.value.replace(/^\+255/, ''))}
                  placeholder="744277496"
                  className="bg-transparent flex-1 outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-primary font-semibold py-3 px-4 rounded-full hover:bg-gray-100 transition duration-200"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Verify Phone'}
          </button>
        </form>
      ) : (
        // Registration form with OTP
        <form onSubmit={handleRegisterSubmit} className="flex-1 flex flex-col">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-6">Create NEDApay Account</h2>
            
            <div className="mb-6">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full bg-white/10 p-3 rounded-lg outline-none mb-4"
                required
              />
              
              <div className="bg-gray-200/20 p-3 rounded-lg text-center mb-4">
                <p>OTP send successfully :)</p>
                <button type="button" className="text-blue-300 mt-1">OK</button>
              </div>
              
              <div className="mb-4">
                <label className="block mb-2">Create PIN</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Create a PIN"
                  className="w-full bg-white/10 p-3 rounded-lg outline-none"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block mb-2">Confirm PIN</label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Confirm your PIN"
                  className="w-full bg-white/10 p-3 rounded-lg outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-primary font-semibold py-3 px-4 rounded-full hover:bg-gray-100 transition duration-200"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      )}

      <div className="mt-6 text-center">
        <p>Already have an account? <Link to="/login" className="underline">Login</Link></p>
      </div>
    </div>
  );
};

export default RegisterScreen;
