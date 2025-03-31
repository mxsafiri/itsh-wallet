import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SecurityScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePIN = async (e) => {
    e.preventDefault();
    
    if (newPin !== confirmPin) {
      setError('New PINs do not match');
      return;
    }
    
    if (newPin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    // In a real app, you would call an API to change the PIN
    // For demo purposes, we'll just simulate a successful change
    setTimeout(() => {
      setSuccess('PIN changed successfully');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white p-4">
        <div className="flex items-center">
          <button onClick={() => navigate('/home')} className="mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Security</h1>
        </div>
      </header>

      <div className="flex-1 p-6">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
            {success}
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Change PIN</h2>
          
          <form onSubmit={handleChangePIN} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Current PIN</label>
              <input
                type="password"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                placeholder="Enter current PIN"
                className="w-full p-3 bg-white rounded-lg border border-gray-300 outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">New PIN</label>
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Enter new PIN"
                className="w-full p-3 bg-white rounded-lg border border-gray-300 outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Confirm New PIN</label>
              <input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Confirm new PIN"
                className="w-full p-3 bg-white rounded-lg border border-gray-300 outline-none"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-dark transition duration-200"
              disabled={loading}
            >
              {loading ? 'Changing PIN...' : 'Change PIN'}
            </button>
          </form>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Security Tips</h2>
          
          <div className="space-y-4">
            <div className="flex">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-blue-500 font-semibold">1</span>
              </div>
              <p className="text-gray-700">Never share your PIN with anyone, including NEDApay support staff.</p>
            </div>
            
            <div className="flex">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-blue-500 font-semibold">2</span>
              </div>
              <p className="text-gray-700">Use a unique PIN that you don't use for other services.</p>
            </div>
            
            <div className="flex">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-blue-500 font-semibold">3</span>
              </div>
              <p className="text-gray-700">Change your PIN regularly to maintain security.</p>
            </div>
            
            <div className="flex">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-blue-500 font-semibold">4</span>
              </div>
              <p className="text-gray-700">Always verify transaction details before confirming payments.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 py-3 px-6">
        <div className="flex justify-between">
          <Link to="/home" className="flex flex-col items-center text-gray-500">
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
          
          <Link to="/security" className="flex flex-col items-center text-primary">
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

export default SecurityScreen;
