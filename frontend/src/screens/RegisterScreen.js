import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../App';
import { authAPI } from '../services/api';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [step, setStep] = useState(1); // 1: Phone, 2: PIN, 3: Confirmation
  const [errors, setErrors] = useState({});
  const { signUp } = useContext(AuthContext);

  const validatePhoneNumber = () => {
    // Basic validation for Tanzanian phone numbers
    const phoneRegex = /^(\+?255|0)[67]\d{8}$/;
    return phoneRegex.test(phoneNumber);
  };

  const handleNextStep = () => {
    if (step === 1) {
      // Validate phone number
      if (!phoneNumber) {
        setErrors({ phoneNumber: 'Phone number is required' });
        return;
      }
      
      if (!validatePhoneNumber()) {
        setErrors({ phoneNumber: 'Please enter a valid Tanzanian phone number' });
        return;
      }
      
      if (!name.trim()) {
        setErrors({ name: 'Name is required' });
        return;
      }
      
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      // Validate PIN
      if (!pin || pin.length !== 4) {
        setErrors({ pin: 'PIN must be 4 digits' });
        return;
      }
      
      setErrors({});
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleRegister = async () => {
    // Validate inputs
    if (pin !== confirmPin) {
      setErrors({ confirmPin: 'PINs do not match' });
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      
      const response = await authAPI.register(phoneNumber, pin, name);
      
      if (response.success) {
        Alert.alert(
          'Registration Successful',
          'Your NEDApay wallet has been created!',
          [
            {
              text: 'Continue',
              onPress: () => signUp(response.user),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={[styles.stepDot, step >= 1 && styles.activeStepDot]} />
      <View style={styles.stepLine} />
      <View style={[styles.stepDot, step >= 2 && styles.activeStepDot]} />
      <View style={styles.stepLine} />
      <View style={[styles.stepDot, step >= 3 && styles.activeStepDot]} />
    </View>
  );

  const renderStep1 = () => (
    <>
      <Text style={styles.stepTitle}>Step 1: Your Details</Text>
      
      <TextInput
        label="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        mode="outlined"
        outlineColor="#FFFFFF50"
        activeOutlineColor="#FFFFFF"
        textColor="#FFFFFF"
        left={<TextInput.Icon icon="account" color="#FFFFFF" />}
        theme={{ colors: { placeholder: '#FFFFFF80', text: '#FFFFFF' } }}
        error={!!errors.name}
      />
      {errors.name && <HelperText type="error" visible={true}>{errors.name}</HelperText>}
      
      <TextInput
        label="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        style={styles.input}
        keyboardType="phone-pad"
        mode="outlined"
        outlineColor="#FFFFFF50"
        activeOutlineColor="#FFFFFF"
        textColor="#FFFFFF"
        left={<TextInput.Icon icon="phone" color="#FFFFFF" />}
        theme={{ colors: { placeholder: '#FFFFFF80', text: '#FFFFFF' } }}
        error={!!errors.phoneNumber}
      />
      {errors.phoneNumber && <HelperText type="error" visible={true}>{errors.phoneNumber}</HelperText>}
      
      <Text style={styles.phoneHint}>
        Enter your Tanzanian phone number (e.g., 255712345678 or 0712345678)
      </Text>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.stepTitle}>Step 2: Create a PIN</Text>
      
      <TextInput
        label="PIN (4 digits)"
        value={pin}
        onChangeText={setPin}
        secureTextEntry={secureTextEntry}
        style={styles.input}
        keyboardType="numeric"
        maxLength={4}
        mode="outlined"
        outlineColor="#FFFFFF50"
        activeOutlineColor="#FFFFFF"
        textColor="#FFFFFF"
        left={<TextInput.Icon icon="lock" color="#FFFFFF" />}
        right={
          <TextInput.Icon
            icon={secureTextEntry ? 'eye-off' : 'eye'}
            color="#FFFFFF"
            onPress={() => setSecureTextEntry(!secureTextEntry)}
          />
        }
        theme={{ colors: { placeholder: '#FFFFFF80', text: '#FFFFFF' } }}
        error={!!errors.pin}
      />
      {errors.pin && <HelperText type="error" visible={true}>{errors.pin}</HelperText>}
      
      <Text style={styles.pinHint}>
        Your PIN will be used to secure your wallet and authorize transactions
      </Text>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.stepTitle}>Step 3: Confirm PIN</Text>
      
      <TextInput
        label="Confirm PIN"
        value={confirmPin}
        onChangeText={setConfirmPin}
        secureTextEntry={secureTextEntry}
        style={styles.input}
        keyboardType="numeric"
        maxLength={4}
        mode="outlined"
        outlineColor="#FFFFFF50"
        activeOutlineColor="#FFFFFF"
        textColor="#FFFFFF"
        left={<TextInput.Icon icon="lock-check" color="#FFFFFF" />}
        theme={{ colors: { placeholder: '#FFFFFF80', text: '#FFFFFF' } }}
        error={!!errors.confirmPin}
      />
      {errors.confirmPin && <HelperText type="error" visible={true}>{errors.confirmPin}</HelperText>}
      
      <Text style={styles.summaryTitle}>Registration Summary</Text>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Name:</Text>
          <Text style={styles.summaryValue}>{name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Phone:</Text>
          <Text style={styles.summaryValue}>{phoneNumber}</Text>
        </View>
      </View>
    </>
  );

  return (
    <LinearGradient
      colors={['#00A86B', '#008C5A']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView contentContainerStyle={styles.scrollView}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handlePrevStep}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerContainer}>
              <Text style={styles.headerText}>Create Account</Text>
              <Text style={styles.subHeaderText}>
                Register to start using NEDApay for fast, low-cost iTZS payments
              </Text>
            </View>

            {renderStepIndicator()}

            <View style={styles.formContainer}>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}

              <View style={styles.buttonContainer}>
                {step < 3 ? (
                  <Button
                    mode="contained"
                    onPress={handleNextStep}
                    style={styles.nextButton}
                    labelStyle={styles.buttonText}
                    buttonColor="#FFFFFF"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    mode="contained"
                    onPress={handleRegister}
                    loading={loading}
                    disabled={loading}
                    style={styles.registerButton}
                    labelStyle={styles.buttonText}
                    buttonColor="#FFFFFF"
                  >
                    Create Wallet
                  </Button>
                )}
              </View>
            </View>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By registering, you agree to our Terms of Service and Privacy Policy
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
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    marginTop: 10,
    marginBottom: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: 30,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subHeaderText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeStepDot: {
    backgroundColor: '#FFFFFF',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 5,
    maxWidth: 50,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  phoneHint: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 20,
  },
  pinHint: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
  },
  summaryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    width: 80,
  },
  summaryValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },
  buttonContainer: {
    marginTop: 20,
  },
  nextButton: {
    marginBottom: 10,
    borderRadius: 8,
  },
  registerButton: {
    marginBottom: 10,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00A86B',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginText: {
    color: '#FFFFFF',
    opacity: 0.8,
    marginRight: 5,
  },
  loginLink: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  termsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  termsText: {
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: 'center',
    fontSize: 12,
  },
});

export default RegisterScreen;
