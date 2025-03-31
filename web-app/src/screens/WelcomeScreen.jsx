import React from 'react';
import { Link } from 'react-router-dom';

const WelcomeScreen = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary to-primary-dark text-white p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-white text-primary px-2 py-1">NEDA</span>
            <span className="bg-black text-white px-2 py-1">PAY</span>
          </h1>
          <p className="mt-4 text-lg">Tanzania's Digital Payment Solution</p>
        </div>

        <div className="w-full max-w-md space-y-6 mb-12">
          <div className="bg-white/10 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Welcome to most comprehensive Payment Gateway</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">⚡</span>
                <span>Fast & Secure Payments</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-3">💰</span>
                <span>Digital Tanzanian Shilling (iTZS)</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-3">🌐</span>
                <span>Powered by Stellar Blockchain</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-3">🔒</span>
                <span>Secure & Private Transactions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto space-y-4 mt-auto">
        <Link to="/login" className="block w-full">
          <button className="w-full bg-white text-primary font-semibold py-3 px-4 rounded-full hover:bg-gray-100 transition duration-200">
            Login
          </button>
        </Link>
        <Link to="/register" className="block w-full">
          <button className="w-full bg-transparent border-2 border-white text-white font-semibold py-3 px-4 rounded-full hover:bg-white/10 transition duration-200">
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
};

export default WelcomeScreen;
