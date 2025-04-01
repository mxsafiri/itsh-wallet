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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [cameraPermission, setCameraPermission] = useState('pending'); // 'pending', 'granted', 'denied'
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    // Request camera permission
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'camera' })
        .then(permissionStatus => {
          setCameraPermission(permissionStatus.state);
          
          permissionStatus.onchange = () => {
            setCameraPermission(permissionStatus.state);
            if (permissionStatus.state === 'granted') {
              startScanner();
            }
          };
          
          if (permissionStatus.state === 'granted') {
            startScanner();
          }
        })
        .catch(err => {
          console.error('Error checking camera permission:', err);
          // Try starting scanner anyway
          startScanner();
        });
    } else {
      // Browsers that don't support permission API
      startScanner();
    }
    
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
    .then(() => {
      setScanning(true);
      showToastMessage('Camera started');
    })
    .catch((err) => {
      console.error('Failed to start camera:', err);
      setError('Failed to start camera: ' + err);
      setScanning(false);
      setCameraPermission('denied');
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
    showToastMessage('QR code detected');
    
    try {
      // For demo purposes, create a mock payment data
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
              uri: decodedText,
              recipientName: 'Tanzania Electric', // Mock data for demo
              recipientPhone: '+255744345678' // Mock data for demo
            });
          } else {
            setError('Invalid payment QR code. Missing required parameters.');
          }
        } else {
          setError('Unsupported Stellar operation: ' + operation);
        }
      } else {
        // For demo purposes, create a mock payment data even for non-stellar URIs
        setPaymentData({
          destination: 'GDKJFHS83HFKS83HF83HFS8H3F8SH38FHS83HF',
          amount: '5000',
          memo: 'Electricity bill payment',
          uri: decodedText,
          recipientName: 'Tanzania Electric',
          recipientPhone: '+255744345678'
        });
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

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleManualEntry = () => {
    navigate('/send');
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
            onClick={() => navigate('/home')} 
            className="mr-3 btn-icon btn-secondary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Scan QR Code</h1>
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
            <button 
              onClick={handleTryAgain}
              className="btn btn-error w-full mt-3"
            >
              Try Again
            </button>
          </div>
        )}

        {cameraPermission === 'denied' && (
          <div className="card bg-warning/10 text-warning mb-6 slide-up">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">Camera access denied</p>
                <p className="text-sm mt-1">
                  Please enable camera access in your browser settings to scan QR codes.
                </p>
                <button 
                  onClick={handleManualEntry}
                  className="btn btn-warning mt-3"
                >
                  Enter Payment Details Manually
                </button>
              </div>
            </div>
          </div>
        )}

        {scanning && cameraPermission !== 'denied' ? (
          <div className="space-y-6 slide-up">
            <div className="card p-4 text-center">
              <div 
                id="qr-scanner" 
                ref={scannerRef}
                className="w-full h-64 md:h-80 bg-background-card rounded-lg overflow-hidden"
              ></div>
              
              <div className="mt-4 flex items-center justify-center">
                <div className="w-3 h-3 bg-primary rounded-full mr-2 pulse-animation"></div>
                <p className="text-text-secondary">
                  Position the QR code within the frame to scan
                </p>
              </div>
            </div>
            
            <div className="card bg-primary/10 text-primary">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm">
                    Scan a NEDApay QR code to make a payment. Make sure the QR code is well-lit and clearly visible.
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleManualEntry}
              className="btn btn-secondary w-full"
            >
              Enter Payment Details Manually
            </button>
          </div>
        ) : paymentData ? (
          <div className="space-y-6 slide-up">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Amount</span>
                  <span className="font-medium">{parseFloat(paymentData.amount).toLocaleString()} iTZS</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-text-secondary">Recipient</span>
                  <span className="font-medium">
                    {paymentData.recipientName || 'Unknown'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-text-secondary">Phone</span>
                  <span className="font-medium">
                    {paymentData.recipientPhone || 'N/A'}
                  </span>
                </div>
                
                {paymentData.memo && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Memo</span>
                    <span className="font-medium">{paymentData.memo}</span>
                  </div>
                )}
                
                <div className="pt-2 mt-2 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Stellar Address</span>
                    <span className="font-mono text-xs text-text-secondary truncate max-w-[180px]">
                      {paymentData.destination}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <button
                  onClick={handleProceedToPayment}
                  className="btn btn-primary w-full"
                >
                  Proceed to Payment
                </button>
                
                <button
                  onClick={handleTryAgain}
                  className="btn btn-secondary w-full"
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
