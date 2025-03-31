import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Html5Qrcode } from 'html5-qrcode';

const ScanScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    startScanner();
    
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = () => {
    if (!scannerRef.current) return;
    
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };
    
    html5QrCodeRef.current = new Html5Qrcode("qr-scanner");
    
    html5QrCodeRef.current.start(
      { facingMode: "environment" },
      config,
      handleScanSuccess,
      handleScanError
    )
    .catch((err) => {
      setError('Failed to start camera: ' + err);
      setScanning(false);
    });
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current.stop()
        .catch(err => console.error('Error stopping scanner:', err));
    }
  };

  const handleScanSuccess = (decodedText) => {
    setScanning(false);
    stopScanner();
    
    try {
      // Check if it's a Stellar SEP-0007 URI
      if (decodedText.startsWith('web+stellar:')) {
        // Parse the URI
        const uri = new URL(decodedText);
        const operation = uri.pathname.substring(1); // Remove leading slash
        
        if (operation === 'pay') {
          const params = new URLSearchParams(uri.search);
          const destination = params.get('destination');
          const amount = params.get('amount');
          const memo = params.get('memo');
          
          if (destination && amount) {
            setPaymentData({
              destination,
              amount,
              memo: memo || '',
              uri: decodedText
            });
          } else {
            setError('Invalid payment QR code. Missing required parameters.');
          }
        } else {
          setError('Unsupported Stellar operation: ' + operation);
        }
      } else {
        setError('Invalid QR code format. Expected a Stellar payment URI.');
      }
    } catch (err) {
      console.error('Error parsing QR code:', err);
      setError('Failed to parse QR code: ' + err.message);
    }
  };

  const handleScanError = (err) => {
    // Don't show errors during normal scanning
    console.log('QR scan error:', err);
  };

  const handleProceedToPayment = () => {
    // Navigate to send screen with pre-filled data
    navigate('/send', { 
      state: { 
        paymentData,
        fromScanner: true
      } 
    });
  };

  const handleTryAgain = () => {
    setError('');
    setPaymentData(null);
    setScanning(true);
    startScanner();
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
          <h1 className="text-xl font-bold">Scan QR Code</h1>
        </div>
      </header>

      <div className="flex-1 p-6">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
            <button 
              onClick={handleTryAgain}
              className="block w-full mt-2 bg-red-700 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-800 transition duration-200"
            >
              Try Again
            </button>
          </div>
        )}

        {scanning ? (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div 
                id="qr-scanner" 
                ref={scannerRef}
                className="w-full h-64 md:h-80 bg-gray-100 rounded-lg overflow-hidden"
              ></div>
              
              <p className="mt-4 text-gray-600">
                Position the QR code within the frame to scan
              </p>
            </div>
            
            <div className="bg-blue-50 text-blue-700 p-4 rounded-lg">
              <p className="text-sm">
                Scan a NEDApay QR code to make a payment. Make sure the QR code is well-lit and clearly visible.
              </p>
            </div>
          </div>
        ) : paymentData ? (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium">{paymentData.amount} iTZS</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Recipient</span>
                  <span className="font-medium text-xs truncate max-w-[200px]">
                    {paymentData.destination}
                  </span>
                </div>
                
                {paymentData.memo && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Memo</span>
                    <span className="font-medium">{paymentData.memo}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-6 space-y-4">
                <button
                  onClick={handleProceedToPayment}
                  className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-dark transition duration-200"
                >
                  Proceed to Payment
                </button>
                
                <button
                  onClick={handleTryAgain}
                  className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200"
                >
                  Scan Again
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ScanScreen;
