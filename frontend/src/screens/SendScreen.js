import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { AuthContext } from '../../App';
import { walletAPI, transactionAPI } from '../services/api';

const SendScreen = ({ navigation, route }) => {
  const { userData } = useContext(AuthContext);
  const [recipientPhone, setRecipientPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchingBalance, setFetchingBalance] = useState(true);
  
  // Check if we have initial recipient from route params
  useEffect(() => {
    if (route.params?.initialRecipient) {
      setRecipientPhone(route.params.initialRecipient);
    }
  }, [route.params]);

  // Fetch user balance
  useEffect(() => {
    const getBalance = async () => {
      try {
        setFetchingBalance(true);
        const response = await walletAPI.getBalance(userData.id);
        if (response.success) {
          setBalance(response.balance);
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
      } finally {
        setFetchingBalance(false);
      }
    };

    getBalance();
    
    // Add listener to refresh balance when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      getBalance();
    });
    
    return unsubscribe;
  }, [userData, navigation]);

  // Handle sending payment
  const handleSendPayment = async () => {
    // Validate inputs
    if (!recipientPhone) {
      Alert.alert('Error', 'Please enter recipient phone number');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amountValue > balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    // Confirm transaction
    Alert.alert(
      'Confirm Transaction',
      `Send ${amountValue.toLocaleString()} iTZS to ${recipientPhone}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await transactionAPI.sendPayment(
                userData.id,
                recipientPhone,
                amountValue
              );

              if (response.success) {
                // Navigate to success screen with transaction details
                navigation.navigate('TransactionSuccess', {
                  amount: amountValue,
                  recipient: recipientPhone,
                  fee: response.transaction?.fee || '0.000001',
                  transactionId: response.transaction?.id || 'TX' + Date.now(),
                });
                
                // Clear form
                setRecipientPhone('');
                setAmount('');
                
                // Refresh balance
                const balanceResponse = await walletAPI.getBalance(userData.id);
                if (balanceResponse.success) {
                  setBalance(balanceResponse.balance);
                }
              } else {
                Alert.alert('Error', response.message || 'Transaction failed');
              }
            } catch (error) {
              console.error('Payment error:', error);
              Alert.alert('Error', error.message || 'Something went wrong');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Handle scanning QR code
  const handleScanQR = () => {
    navigation.navigate('ScanQR', {
      onScan: (data) => {
        try {
          // Parse QR data
          const qrData = JSON.parse(data);
          if (qrData.phoneNumber) {
            setRecipientPhone(qrData.phoneNumber);
            // If amount is also included in QR, set it
            if (qrData.amount && !isNaN(parseFloat(qrData.amount))) {
              setAmount(qrData.amount.toString());
            }
          } else if (typeof data === 'string' && data.startsWith('+')) {
            // Handle plain phone number format
            setRecipientPhone(data);
          } else {
            throw new Error('Invalid QR code format');
          }
        } catch (error) {
          console.error('Error parsing QR data:', error);
          Alert.alert('Error', 'Invalid QR code format');
        }
      },
    });
  };

  return (
    <LinearGradient colors={['#0A2463', '#1E3A8A']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Send iTZS</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              {fetchingBalance ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.balanceValue}>
                  {balance.toLocaleString()} <Text style={styles.currency}>iTZS</Text>
                </Text>
              )}
            </View>

            <View style={styles.formContainer}>
              <View style={styles.recipientContainer}>
                <TextInput
                  label="Recipient Phone Number"
                  value={recipientPhone}
                  onChangeText={setRecipientPhone}
                  style={styles.input}
                  keyboardType="phone-pad"
                  mode="outlined"
                  outlineColor="#FFFFFF50"
                  activeOutlineColor="#FFFFFF"
                  textColor="#FFFFFF"
                  left={<TextInput.Icon icon="phone" color="#FFFFFF" />}
                  theme={{ colors: { placeholder: '#FFFFFF80', text: '#FFFFFF' } }}
                />
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={handleScanQR}
                >
                  <Ionicons name="qr-code" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <TextInput
                label="Amount (iTZS)"
                value={amount}
                onChangeText={setAmount}
                style={styles.input}
                keyboardType="numeric"
                mode="outlined"
                outlineColor="#FFFFFF50"
                activeOutlineColor="#FFFFFF"
                textColor="#FFFFFF"
                left={<TextInput.Icon icon="cash" color="#FFFFFF" />}
                theme={{ colors: { placeholder: '#FFFFFF80', text: '#FFFFFF' } }}
              />

              <View style={styles.quickAmountContainer}>
                <TouchableOpacity
                  style={styles.quickAmountButton}
                  onPress={() => setAmount('5000')}
                >
                  <Text style={styles.quickAmountText}>5,000</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickAmountButton}
                  onPress={() => setAmount('10000')}
                >
                  <Text style={styles.quickAmountText}>10,000</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickAmountButton}
                  onPress={() => setAmount('20000')}
                >
                  <Text style={styles.quickAmountText}>20,000</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickAmountButton}
                  onPress={() => setAmount(balance.toString())}
                >
                  <Text style={styles.quickAmountText}>MAX</Text>
                </TouchableOpacity>
              </View>

              <Button
                mode="contained"
                onPress={handleSendPayment}
                style={styles.sendButton}
                labelStyle={styles.sendButtonText}
                loading={loading}
                disabled={loading || fetchingBalance}
                buttonColor="#00A86B"
              >
                Send Payment
              </Button>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                Transactions are processed on the Stellar blockchain with near-zero fees.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
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
  },
  balanceContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 5,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  currency: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  recipientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    marginBottom: 15,
  },
  scanButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 168, 107, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  quickAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickAmountButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  quickAmountText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sendButton: {
    paddingVertical: 8,
    borderRadius: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
  },
});

export default SendScreen;
