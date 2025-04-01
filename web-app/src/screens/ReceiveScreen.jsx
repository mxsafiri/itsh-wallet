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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [quickAmounts, setQuickAmounts] = useState([1000, 5000, 10000, 20000]);

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
      // In demo mode, generate a mock payment URI
      const mockPublicKey = user?.stellarPublicKey || 'MOCK_PUBLIC_KEY_255123456789';
      const mockUri = `web+stellar:pay?destination=${mockPublicKey}&amount=${amount}&memo=${encodeURIComponent(memo)}&asset_code=iTZS&network=testnet`;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPaymentUri(mockUri);
      setQrValue(mockUri);
      showToastMessage('QR code generated successfully');
      setStep(2);
    } catch (err) {
      console.error('Error generating payment QR:', err);
      setError('Failed to generate payment QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentUri)
      .then(() => {
        showToastMessage('Payment link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        setError('Failed to copy link. Please try again.');
      });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NEDApay Payment Request',
          text: `Please pay ${amount} iTZS to ${user?.phoneNumber || '+255123456789'} ${memo ? `for ${memo}` : ''}`,
          url: paymentUri,
        });
        showToastMessage('Payment request shared!');
      } catch (error) {
        console.error('Error sharing:', error);
        if (error.name !== 'AbortError') {
          setError('Failed to share. Please try again.');
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('payment-qr-code');
    if (!canvas) return;
    
    // Convert the QR code to a data URL
    const dataUrl = canvas.toDataURL('image/png');
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `NEDApay-${amount}-iTZS.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToastMessage('QR code downloaded');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-dark text-text-primary pb-16">
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

      {/* Header */}
      <header className="wallet-header" style={{ paddingBottom: 'var(--spacing-md)' }}>
        <div className="flex items-center">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/home')} 
            className="mr-3 btn-icon btn-secondary"
          >
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
          <div className="bg-error/10 text-error p-4 rounded-lg mb-6 slide-up">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 slide-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-lg font-semibold">Request Payment</p>
              <p className="text-text-secondary">Generate a QR code for others to scan and pay you</p>
            </div>
            
            <form onSubmit={handleGenerateQR} className="space-y-6">
              <div>
                <label className="form-label">Amount (iTZS)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="form-control text-center text-2xl font-bold"
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
                    iTZS
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {quickAmounts.map(value => (
                  <button
                    key={value}
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleQuickAmount(value)}
                  >
                    {value.toLocaleString()} iTZS
                  </button>
                ))}
              </div>
              
              <div>
                <label className="form-label">Memo (Optional)</label>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="What's this for?"
                  className="form-control"
                />
              </div>
              
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    Generating...
                  </span>
                ) : 'Generate QR Code'}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 slide-up">
            <div className="card text-center">
              <h3 className="text-lg font-semibold mb-4">Scan to Pay {parseFloat(amount).toLocaleString()} iTZS</h3>
              
              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                {qrValue ? (
                  <QRCode 
                    id="payment-qr-code"
                    value={qrValue} 
                    size={200} 
                    level="H"
                    renderAs="canvas"
                    includeMargin={true}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    imageSettings={{
                      src: "https://i.imgur.com/HcQkBT1.png",
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                ) : (
                  <div className="w-48 h-48 bg-background-card rounded-lg flex items-center justify-center">
                    <span className="text-text-secondary">QR Code</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 mb-6">
                <p className="text-xl font-bold">{parseFloat(amount).toLocaleString()} iTZS</p>
                {memo && <p className="text-text-secondary">{memo}</p>}
                <p className="text-text-secondary">To: {user?.phoneNumber || '+255123456789'}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleCopyLink}
                  className="btn btn-secondary flex-col h-auto py-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs">Copy Link</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="btn btn-secondary flex-col h-auto py-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="text-xs">Share</span>
                </button>
                
                <button
                  onClick={handleDownloadQR}
                  className="btn btn-secondary flex-col h-auto py-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="text-xs">Download</span>
                </button>
              </div>
            </div>
            
            <div className="card bg-primary/10 text-primary">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm">
                    This QR code contains a payment link that can be scanned by any NEDApay user to send you {parseFloat(amount).toLocaleString()} iTZS.
                  </p>
                  <p className="text-sm mt-2">
                    The payment will be instantly credited to your wallet once completed.
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => {
                setStep(1);
                setAmount('');
                setMemo('');
                setQrValue('');
                setPaymentUri('');
              }}
              className="btn btn-secondary w-full"
            >
              Create Another Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiveScreen;
