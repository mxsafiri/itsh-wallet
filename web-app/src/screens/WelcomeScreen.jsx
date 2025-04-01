import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const WelcomeScreen = () => {
  useEffect(() => {
    // Add animation classes after component mounts
    const timer = setTimeout(() => {
      document.querySelector('.logo-container')?.classList.add('logo-animated');
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background-dark text-text-primary relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-green/10 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green/10 rounded-full filter blur-3xl translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-green/10 rounded-full filter blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <div className="text-center mb-12 slide-down">
          <div className="logo-container relative inline-block">
            <div className="absolute inset-0 bg-green/20 rounded-full filter blur-md animate-pulse"></div>
            <div className="relative z-10 transition-all duration-1000 logo-image">
              <Logo size="large" />
            </div>
            <div className="logo-glow absolute inset-0 bg-green/30 rounded-full filter blur-lg opacity-0 transition-opacity duration-1000"></div>
          </div>
          <p className="mt-6 text-lg text-text-secondary animate-fade-in" style={{ animationDelay: '0.5s' }}>
            Tanzania's Digital Payment Solution
          </p>
        </div>

        <div className="w-full max-w-md space-y-6 mb-12 slide-up">
          <div className="card p-6 border border-border">
            <h2 className="text-xl font-semibold mb-6 text-center">Welcome to Tanzania's Modern Payment Gateway</h2>
            
            <div className="space-y-5">
              <div className="flex items-center p-3 rounded-lg transition-colors hover:bg-background-card-hover animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="w-12 h-12 rounded-full bg-green/20 flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Fast & Secure Payments</h3>
                  <p className="text-sm text-text-secondary">Instant transfers between users</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 rounded-lg transition-colors hover:bg-background-card-hover animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="w-12 h-12 rounded-full bg-green/20 flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Digital Tanzanian Shilling (iTZS)</h3>
                  <p className="text-sm text-text-secondary">Stable digital currency backed 1:1</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 rounded-lg transition-colors hover:bg-background-card-hover animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="w-12 h-12 rounded-full bg-green/20 flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Powered by Stellar Blockchain</h3>
                  <p className="text-sm text-text-secondary">Secure and transparent transactions</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 rounded-lg transition-colors hover:bg-background-card-hover animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <div className="w-12 h-12 rounded-full bg-green/20 flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Secure & Private Transactions</h3>
                  <p className="text-sm text-text-secondary">End-to-end encrypted payments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto space-y-4 p-6 slide-up" style={{ animationDelay: '0.3s' }}>
        <Link to="/login" className="block w-full">
          <button className="btn btn-green w-full">
            Login
          </button>
        </Link>
        <Link to="/register" className="block w-full">
          <button className="btn btn-outline w-full">
            Get Started
          </button>
        </Link>
        <p className="text-center text-text-secondary text-sm mt-6">
          &copy; 2025 NEDApay. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
