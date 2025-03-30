import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Button, TextInput } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { AuthContext } from '../../App';
import { walletAPI } from '../services/api';

const ReceiveScreen = ({ navigation }) => {
  const { userData } = useContext(AuthContext);
  const [qrValue, setQrValue] = useState('');
  const [qrLoading, setQrLoading] = useState(true);
  const [requestAmount, setRequestAmount] = useState('');
  const [showAmountInput, setShowAmountInput] = useState(false);

  // Generate QR code data
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setQrLoading(true);
        // Fetch QR code from backend
        const response = await walletAPI.getQRCode(userData.id);
        
        if (response.success) {
          // For the MVP, we'll just use the phone number and public key
          const qrData = JSON.stringify({
            phoneNumber: response.phoneNumber,
            stellarPublicKey: userData.stellarPublicKey,
            requestAmount: showAmountInput ? parseFloat(requestAmount) || 0 : 0,
          });
          
          setQrValue(qrData);
        } else {
          Alert.alert('Error', 'Failed to generate QR code');
        }
      } catch (error) {
        console.error('Error generating QR code:', error);
        Alert.alert('Error', 'Failed to generate QR code');
      } finally {
        setQrLoading(false);
      }
    };

    generateQRCode();
  }, [userData, requestAmount, showAmountInput]);

  // Handle sharing payment details
  const handleShare = async () => {
    try {
      const message = `Please send iTZS to my wallet:\nPhone: ${userData.phoneNumber}\nAmount: ${showAmountInput && requestAmount ? `${requestAmount} iTZS` : 'Any amount'}\n\nPowered by iTZS mobile wallet`;
      
      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Error sharing payment details:', error);
    }
  };

  // Toggle amount input
  const toggleAmountInput = () => {
    setShowAmountInput(!showAmountInput);
    if (!showAmountInput) {
      setRequestAmount('');
    }
  };

  return (
    <LinearGradient colors={['#0A2463', '#1E3A8A']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Receive iTZS</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.qrContainer}>
            {qrLoading ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <View style={styles.qrCode}>
                <QRCode
                  value={qrValue}
                  size={200}
                  backgroundColor="white"
                  color="black"
                />
              </View>
            )}
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Your Payment Details</Text>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Phone Number:</Text>
              <Text style={styles.infoValue}>{userData.phoneNumber}</Text>
            </View>

            {showAmountInput && (
              <View style={styles.amountInputContainer}>
                <TextInput
                  label="Request Amount (iTZS)"
                  value={requestAmount}
                  onChangeText={setRequestAmount}
                  style={styles.amountInput}
                  keyboardType="numeric"
                  mode="outlined"
                  outlineColor="#FFFFFF50"
                  activeOutlineColor="#FFFFFF"
                  textColor="#FFFFFF"
                  theme={{ colors: { placeholder: '#FFFFFF80', text: '#FFFFFF' } }}
                />
              </View>
            )}

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={toggleAmountInput}
            >
              <Text style={styles.toggleButtonText}>
                {showAmountInput ? 'Remove Amount' : 'Add Amount'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>How to Receive iTZS</Text>
            <Text style={styles.instructionsText}>
              1. Show this QR code to the sender
            </Text>
            <Text style={styles.instructionsText}>
              2. They can scan it with their iTZS app
            </Text>
            <Text style={styles.instructionsText}>
              3. Once they confirm, you'll receive the iTZS instantly
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={handleShare}
            style={styles.shareButton}
            labelStyle={styles.buttonText}
            buttonColor="#00A86B"
            icon="share"
          >
            Share Payment Details
          </Button>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  qrContainer: {
    width: 240,
    height: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  qrCode: {
    padding: 20,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  amountInputContainer: {
    marginVertical: 10,
  },
  amountInput: {
    backgroundColor: 'transparent',
  },
  toggleButton: {
    alignSelf: 'center',
    marginTop: 10,
  },
  toggleButtonText: {
    color: '#00A86B',
    fontWeight: 'bold',
  },
  instructionsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 5,
  },
  shareButton: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReceiveScreen;
