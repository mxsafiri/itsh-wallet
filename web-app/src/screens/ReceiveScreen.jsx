import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { walletAPI } from '../services/api';
import QRCode from 'qrcode.react';

const ReceiveScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [paymentUri, setPaymentUri] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Enter amount, 2: Show QR

  const handleGenerateQR = async (e) => {
    e.preventDefault();
    
    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await walletAPI.generatePayment(
        parseFloat(amount),
        user.id,
        memo
      );
      
      if (response.data.success) {
        setPaymentUri(response.data.paymentUri);
        setQrValue(response.data.paymentUri);
        setStep(2);
      } else {
        setError(response.data.message || 'Failed to generate payment QR code');
      }
    } catch (err) {
      console.error('Error generating payment QR:', err);
      setError('Failed to generate payment QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentUri)
      .then(() => {
        alert('Payment link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NEDApay Payment Request',
          text: `Please pay ${amount} iTZS to ${user.name || 'me'} ${memo ? `for ${memo}` : ''}`,
          url: paymentUri,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white p-4">
        <div className="flex items-center">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/home')} className="mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">
            {step === 1 ? 'Receive iTZS' : 'Payment QR Code'}
          </h1>
        </div>
      </header>

      <div className="flex-1 p-6">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleGenerateQR} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Amount (iTZS)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">iTZS</span>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-12 pr-3 py-3 bg-white rounded-lg border border-gray-300 outline-none"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Memo (Optional)</label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="What's this for?"
                className="w-full p-3 bg-white rounded-lg border border-gray-300 outline-none"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-dark transition duration-200"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate QR Code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <h3 className="text-lg font-semibold mb-4">Scan to Pay {amount} iTZS</h3>
              
              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                {qrValue ? (
                  <QRCode 
                    value={qrValue} 
                    size={200} 
                    level="H"
                    renderAs="svg"
                    includeMargin={true}
                    imageSettings={{
                      src: "https://i.imgur.com/HcQkBT1.png",
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">QR Code</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 mb-6">
                <p className="text-xl font-bold">{amount} iTZS</p>
                {memo && <p className="text-gray-500">{memo}</p>}
                <p className="text-gray-500">To: {user?.name || 'You'}</p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-200 transition duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center bg-primary text-white font-medium py-2 px-4 rounded-lg hover:bg-primary-dark transition duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </button>
              </div>
            </div>
            
            <div className="bg-blue-50 text-blue-700 p-4 rounded-lg">
              <p className="text-sm">
                This QR code contains a payment link that can be scanned by any NEDApay user to send you {amount} iTZS.
              </p>
            </div>
            
            <button
              onClick={() => navigate('/home')}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiveScreen;
