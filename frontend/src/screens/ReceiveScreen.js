import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button, TextInput, Card, Divider } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { AuthContext } from '../../App';
import { walletAPI } from '../services/api';

const ReceiveScreen = ({ navigation }) => {
  const { userData } = useContext(AuthContext);
  const [qrValue, setQrValue] = useState('');
  const [qrLoading, setQrLoading] = useState(true);
  const [requestAmount, setRequestAmount] = useState('');
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [balance, setBalance] = useState(0);

  // Fetch user balance on component mount
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (userData && userData.id) {
          const response = await walletAPI.getBalance(userData.id);
          if (response.success) {
            setBalance(response.balance);
          }
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    fetchBalance();
  }, [userData]);

  // Generate QR code data
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setQrLoading(true);
        
        if (!userData || !userData.id) {
          console.error('User data not available');
          setQrLoading(false);
          return;
        }
        
        // Prepare QR data
        const qrData = JSON.stringify({
          type: 'iTZS_PAYMENT',
          phoneNumber: userData.phoneNumber,
          stellarPublicKey: userData.stellarPublicKey || userData.publicKey,
          requestAmount: showAmountInput && requestAmount ? parseFloat(requestAmount) : null,
          timestamp: new Date().toISOString()
        });
        
        setQrValue(qrData);
        setQrLoading(false);
      } catch (error) {
        console.error('Error generating QR code:', error);
        Alert.alert('Error', 'Failed to generate QR code');
        setQrLoading(false);
      }
    };

    generateQRCode();
  }, [userData, requestAmount, showAmountInput]);

  // Handle sharing payment details
  const handleShare = async () => {
    try {
      const message = `Please send iTZS to my wallet:\nPhone: ${userData.phoneNumber}\n${showAmountInput && requestAmount ? `Amount: ${requestAmount} iTZS\n` : ''}Powered by iTZS mobile wallet`;
      
      await Share.share({
        message,
        title: 'iTZS Payment Request',
      });
    } catch (error) {
      console.error('Error sharing payment details:', error);
      Alert.alert('Error', 'Failed to share payment details');
    }
  };

  return (
    <LinearGradient
      colors={['#00A86B', '#008C5A']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Receive Payment</Text>
            <Text style={styles.balanceText}>Current Balance: {balance} iTZS</Text>
          </View>
          
          <Card style={styles.qrCard}>
            <Card.Content style={styles.qrContent}>
              {qrLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#00A86B" />
                  <Text style={styles.loadingText}>Generating QR Code...</Text>
                </View>
              ) : (
                <View style={styles.qrContainer}>
                  <QRCode
                    value={qrValue}
                    size={220}
                    color="#000000"
                    backgroundColor="#ffffff"
                    logoBackgroundColor="#ffffff"
                  />
                  <Text style={styles.scanText}>Scan to pay me</Text>
                </View>
              )}
              
              <Divider style={styles.divider} />
              
              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Request Specific Amount</Text>
                <View style={styles.amountInputRow}>
                  <TextInput
                    style={styles.amountInput}
                    value={requestAmount}
                    onChangeText={setRequestAmount}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                    disabled={!showAmountInput}
                    mode="outlined"
                    outlineColor={showAmountInput ? "#00A86B" : "#CCCCCC"}
                    activeOutlineColor="#00A86B"
                  />
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      showAmountInput ? styles.toggleButtonActive : {}
                    ]}
                    onPress={() => setShowAmountInput(!showAmountInput)}
                  >
                    <Ionicons
                      name={showAmountInput ? "checkbox" : "square-outline"}
                      size={24}
                      color={showAmountInput ? "#00A86B" : "#555555"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </Card.Content>
          </Card>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Payment Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone Number:</Text>
              <Text style={styles.infoValue}>{userData?.phoneNumber || 'Not available'}</Text>
            </View>
            
            {showAmountInput && requestAmount && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Requested Amount:</Text>
                <Text style={styles.infoValue}>{requestAmount} iTZS</Text>
              </View>
            )}
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account ID:</Text>
              <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
                {userData?.stellarPublicKey || userData?.publicKey || 'Not available'}
              </Text>
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleShare}
              style={styles.shareButton}
              icon="share-variant"
            >
              Share Payment Details
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              labelStyle={styles.backButtonLabel}
            >
              Back to Home
            </Button>
          </View>
        </ScrollView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  balanceText: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  qrCard: {
    borderRadius: 16,
    marginBottom: 24,
    elevation: 4,
  },
  qrContent: {
    alignItems: 'center',
    padding: 16,
  },
  loadingContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555555',
  },
  qrContainer: {
    padding: 16,
    alignItems: 'center',
  },
  scanText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555555',
    fontWeight: '500',
  },
  divider: {
    width: '100%',
    marginVertical: 16,
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  amountContainer: {
    width: '100%',
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: '#333333',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  toggleButton: {
    padding: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#E6F7F0',
    borderRadius: 8,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 15,
    color: '#555555',
    width: 140,
  },
  infoValue: {
    fontSize: 15,
    color: '#333333',
    fontWeight: '500',
    flex: 1,
  },
  buttonContainer: {
    marginTop: 8,
  },
  shareButton: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderRadius: 8,
    paddingVertical: 8,
  },
  backButton: {
    borderColor: '#FFFFFF',
    borderRadius: 8,
  },
  backButtonLabel: {
    color: '#FFFFFF',
  },
});

export default ReceiveScreen;
