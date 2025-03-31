import React, { useState, useContext, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { TextInput, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../App';
import { walletAPI, transactionAPI } from '../services/api';
import QRCode from 'react-native-qrcode-svg';

const SendPaymentScreen = ({ navigation, route }) => {
  const { userData } = useContext(AuthContext);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
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

  const handleLookupRecipient = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      
      // Use the API to look up the recipient by phone number
      const response = await walletAPI.findUserByPhone(phoneNumber);
      
      if (response.success && response.user) {
        setRecipient(response.user);
      } else {
        Alert.alert('User Not Found', 'Could not find a user with that phone number');
      }
    } catch (error) {
      console.error('Error looking up recipient:', error);
      Alert.alert('Error', 'Could not find recipient with that phone number');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    const amountValue = parseFloat(amount);
    
    // Check if user has sufficient balance
    if (amountValue > balance) {
      Alert.alert('Insufficient Balance', `You only have ${balance} iTZS available`);
      return;
    }

    try {
      setLoading(true);
      
      // Generate payment data
      const response = await walletAPI.generatePayment(
        userData.id,
        recipient.id,
        amountValue,
        memo
      );
      
      if (response.success) {
        setPaymentData(response.paymentData);
        setShowQR(true);
      } else {
        Alert.alert('Error', response.message || 'Failed to generate payment');
      }
    } catch (error) {
      console.error('Error generating payment:', error);
      Alert.alert('Error', 'Failed to generate payment data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPayment = async () => {
    try {
      setLoading(true);
      
      // Send the payment using the transaction API
      const response = await transactionAPI.sendPayment(
        userData.id,
        recipient.phoneNumber,
        parseFloat(amount),
        memo
      );
      
      if (response.success) {
        // Navigate to success screen
        navigation.navigate('TransactionSuccess', {
          amount: parseFloat(amount),
          recipient: recipient,
          transactionId: response.transactionId,
          date: new Date().toISOString()
        });
      } else {
        Alert.alert('Transaction Failed', response.message || 'Failed to send payment');
      }
    } catch (error) {
      console.error('Error sending payment:', error);
      Alert.alert('Transaction Error', error.message || 'Failed to send payment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset the form
    setPhoneNumber('');
    setAmount('');
    setMemo('');
    setRecipient(null);
    setShowQR(false);
    setPaymentData(null);
  };

  // Render the initial form to enter recipient and amount
  const renderInputForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Send iTZS</Text>
      <Text style={styles.balanceText}>Available Balance: {balance} iTZS</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Recipient Phone Number</Text>
        <View style={styles.phoneInputContainer}>
          <TextInput
            style={styles.phoneInput}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            disabled={loading || recipient}
          />
          {!recipient && (
            <TouchableOpacity 
              style={styles.lookupButton}
              onPress={handleLookupRecipient}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.lookupButtonText}>Lookup</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {recipient && (
        <>
          <View style={styles.recipientInfo}>
            <Text style={styles.recipientName}>
              Recipient: {recipient.name || recipient.phoneNumber}
            </Text>
            <TouchableOpacity onPress={() => setRecipient(null)}>
              <Ionicons name="close-circle" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount (iTZS)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
              disabled={loading}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Memo (Optional)</Text>
            <TextInput
              style={styles.input}
              value={memo}
              onChangeText={setMemo}
              placeholder="What's this payment for?"
              multiline
              numberOfLines={2}
              disabled={loading}
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSendPayment}
              style={styles.sendButton}
              loading={loading}
              disabled={loading}
            >
              Send Payment
            </Button>
            
            <Button
              mode="outlined"
              onPress={handleCancel}
              style={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </Button>
          </View>
        </>
      )}
    </View>
  );

  // Render the QR code for payment
  const renderQRCode = () => (
    <View style={styles.qrContainer}>
      <Text style={styles.sectionTitle}>Scan to Complete Payment</Text>
      
      {paymentData && (
        <View style={styles.qrCodeWrapper}>
          <QRCode
            value={JSON.stringify(paymentData)}
            size={200}
            color="#000000"
            backgroundColor="#ffffff"
          />
        </View>
      )}
      
      <View style={styles.paymentDetails}>
        <Text style={styles.detailLabel}>Sending to:</Text>
        <Text style={styles.detailValue}>{recipient.name || recipient.phoneNumber}</Text>
        
        <Text style={styles.detailLabel}>Amount:</Text>
        <Text style={styles.detailValue}>{amount} iTZS</Text>
        
        {memo && (
          <>
            <Text style={styles.detailLabel}>Memo:</Text>
            <Text style={styles.detailValue}>{memo}</Text>
          </>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSendPayment}
          style={styles.sendButton}
          loading={loading}
          disabled={loading}
        >
          Confirm Payment
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => setShowQR(false)}
          style={styles.cancelButton}
          disabled={loading}
        >
          Back
        </Button>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {showQR ? renderQRCode() : renderInputForm()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#00A86B',
  },
  balanceText: {
    fontSize: 16,
    marginBottom: 24,
    color: '#555',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    height: 50,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    height: 50,
    marginRight: 8,
  },
  lookupButton: {
    backgroundColor: '#00A86B',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lookupButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e6f7f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  recipientName: {
    fontSize: 16,
    color: '#00A86B',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 24,
  },
  sendButton: {
    backgroundColor: '#00A86B',
    marginBottom: 12,
    paddingVertical: 8,
  },
  cancelButton: {
    borderColor: '#00A86B',
  },
  qrContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    marginBottom: 24,
  },
  paymentDetails: {
    width: '100%',
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
});

export default SendPaymentScreen;
