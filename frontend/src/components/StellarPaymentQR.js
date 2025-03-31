import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { walletAPI } from '../services/api';

/**
 * Component for displaying a Stellar SEP-0007 payment QR code
 */
const StellarPaymentQR = ({ senderId, recipientId, amount, memo, onComplete }) => {
  const [paymentUri, setPaymentUri] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    generatePayment();
  }, [senderId, recipientId, amount]);

  const generatePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await walletAPI.generatePayment(senderId, recipientId, amount, memo);
      
      if (response.success) {
        setPaymentUri(response.paymentUri);
        setTransactionId(response.transactionId);
      } else {
        setError('Failed to generate payment URI');
      }
    } catch (error) {
      setError(error.message || 'An error occurred while generating payment URI');
      console.error('Payment generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWallet = async () => {
    try {
      const supported = await Linking.canOpenURL(paymentUri);
      
      if (supported) {
        await Linking.openURL(paymentUri);
      } else {
        Alert.alert(
          'No Stellar Wallet Found',
          'You need a Stellar wallet app installed to make this payment.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error opening wallet:', error);
      Alert.alert('Error', 'Could not open Stellar wallet');
    }
  };

  const checkTransactionStatus = async () => {
    try {
      // In a real app, you would poll the server to check if the transaction was completed
      // For this example, we'll just simulate a successful transaction
      Alert.alert(
        'Transaction Completed',
        'Your payment has been processed successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => {
              if (onComplete) {
                onComplete(transactionId);
              }
            } 
          }
        ]
      );
    } catch (error) {
      console.error('Error checking transaction:', error);
      Alert.alert('Error', 'Could not verify transaction status');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Generating payment...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={generatePayment}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan with Stellar Wallet</Text>
      <Text style={styles.subtitle}>Amount: {amount} iTZS</Text>
      
      <View style={styles.qrContainer}>
        <QRCode
          value={paymentUri}
          size={200}
          color="black"
          backgroundColor="white"
        />
      </View>
      
      <TouchableOpacity style={styles.button} onPress={handleOpenWallet}>
        <Text style={styles.buttonText}>Open in Wallet</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={checkTransactionStatus}>
        <Text style={styles.secondaryButtonText}>I've Completed the Payment</Text>
      </TouchableOpacity>
      
      <Text style={styles.infoText}>
        This QR code contains a Stellar payment URI that can be scanned by any Stellar wallet app.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
  },
  qrContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3498db',
  },
  secondaryButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
    marginVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    marginVertical: 20,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
  },
});

export default StellarPaymentQR;
