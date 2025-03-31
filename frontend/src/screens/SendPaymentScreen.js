import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import StellarPaymentQR from '../components/StellarPaymentQR';
import { walletAPI, transactionAPI } from '../services/api';

const SendPaymentScreen = ({ navigation, route }) => {
  const { user } = useContext(AuthContext);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLookupRecipient = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      // In a real app, you would have an API endpoint to look up users by phone number
      // For this example, we'll simulate finding a recipient
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock recipient data
      const mockRecipient = {
        id: 'recipient-123',
        phoneNumber: phoneNumber,
        stellarPublicKey: 'GBXVHIKD5ZZRX3YZLQVWGWVNZCY2WLNQ5CKIWDPNMZLF3ZNTMJM4UBQ7'
      };
      
      setRecipient(mockRecipient);
      setLoading(false);
    } catch (error) {
      console.error('Error looking up recipient:', error);
      Alert.alert('Error', 'Could not find recipient with that phone number');
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    setShowQR(true);
  };

  const handleTransactionComplete = async (transactionId) => {
    // In a real app, you would update the transaction status in your database
    // For this example, we'll just navigate back to the home screen
    Alert.alert(
      'Payment Successful',
      `You have sent ${amount} iTZS to ${phoneNumber}`,
      [
        { 
          text: 'OK', 
          onPress: () => navigation.navigate('Home')
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Send iTZS</Text>
        
        {!showQR ? (
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Recipient Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+255 XXX XXX XXX"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
              <TouchableOpacity 
                style={styles.lookupButton}
                onPress={handleLookupRecipient}
                disabled={loading}
              >
                <Text style={styles.lookupButtonText}>
                  {loading ? 'Looking up...' : 'Lookup'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {recipient && (
              <>
                <View style={styles.recipientInfo}>
                  <Text style={styles.recipientLabel}>Recipient:</Text>
                  <Text style={styles.recipientValue}>{recipient.phoneNumber}</Text>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Amount (iTZS)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Memo (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="What's this payment for?"
                    value={memo}
                    onChangeText={setMemo}
                  />
                </View>
                
                <TouchableOpacity 
                  style={styles.continueButton}
                  onPress={handleContinue}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          <StellarPaymentQR
            senderId={user?.id || 'user-123'}
            recipientId={recipient?.id}
            amount={amount}
            memo={memo}
            onComplete={handleTransactionComplete}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  lookupButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  lookupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  recipientLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  recipientValue: {
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SendPaymentScreen;
