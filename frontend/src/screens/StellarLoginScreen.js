import React, { useState, useContext } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text, ScrollView } from 'react-native';
import { TextInput, Button, Title, Paragraph, HelperText } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import stellarAuthService from '../services/stellarAuthService';
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from '../../App';

const StellarLoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter phone, 2: Enter secret key
  const [errors, setErrors] = useState({});
  const { signIn } = useContext(AuthContext);

  const validatePhoneNumber = () => {
    // Basic validation for Tanzanian phone numbers
    const phoneRegex = /^(\+?255|0)[67]\d{8}$/;
    return phoneRegex.test(phoneNumber);
  };

  const handleRequestChallenge = async () => {
    // Reset errors
    setErrors({});

    if (!phoneNumber) {
      setErrors(prev => ({ ...prev, phoneNumber: 'Phone number is required' }));
      return;
    }

    if (!validatePhoneNumber()) {
      setErrors(prev => ({ ...prev, phoneNumber: 'Please enter a valid Tanzanian phone number' }));
      return;
    }

    try {
      setLoading(true);
      const response = await stellarAuthService.requestChallenge(phoneNumber);
      
      if (response.success) {
        setStep(2);
      } else {
        Alert.alert('Challenge Failed', response.message || 'Failed to request challenge');
      }
    } catch (error) {
      console.error('Challenge request error:', error);
      Alert.alert('Error', 'Failed to request authentication challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    // Reset errors
    setErrors({});

    if (!secretKey) {
      setErrors(prev => ({ ...prev, secretKey: 'Secret key is required' }));
      return;
    }

    if (secretKey.length < 50) {
      setErrors(prev => ({ ...prev, secretKey: 'Please enter a valid Stellar secret key' }));
      return;
    }

    try {
      setLoading(true);
      const response = await stellarAuthService.authenticate(phoneNumber, secretKey);
      
      if (response.success) {
        // Store user data and sign in
        await signIn(response.user);
        console.log('User signed in successfully with Stellar');
      } else {
        Alert.alert('Authentication Failed', response.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Authentication Error', 'Failed to authenticate with Stellar');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setSecretKey('');
    setErrors({});
  };

  const renderPhoneStep = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Sign In with Stellar</Text>
      <Text style={styles.subtitle}>
        Enter your phone number to start the authentication process
      </Text>
      
      <TextInput
        label="Phone Number"
        value={phoneNumber}
        onChangeText={text => {
          setPhoneNumber(text);
          if (errors.phoneNumber) {
            setErrors(prev => ({ ...prev, phoneNumber: null }));
          }
        }}
        style={styles.input}
        keyboardType="phone-pad"
        mode="outlined"
        outlineColor="#FFFFFF50"
        activeOutlineColor="#FFFFFF"
        textColor="#FFFFFF"
        left={<TextInput.Icon icon="phone" color="#FFFFFF" />}
        theme={{ colors: { placeholder: '#FFFFFF80', text: '#FFFFFF' } }}
        error={!!errors.phoneNumber}
        disabled={loading}
      />
      {errors.phoneNumber && (
        <HelperText type="error" visible={true} style={styles.errorText}>
          {errors.phoneNumber}
        </HelperText>
      )}
      
      <Button
        mode="contained"
        onPress={handleRequestChallenge}
        style={styles.button}
        labelStyle={styles.buttonText}
        buttonColor="#FFFFFF"
        loading={loading}
        disabled={loading}
      >
        Continue
      </Button>
      
      <TouchableOpacity
        onPress={() => navigation.navigate('Login')}
        style={styles.linkContainer}
      >
        <Text style={styles.linkText}>Use PIN Authentication Instead</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSecretKeyStep = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Enter Stellar Secret Key</Text>
      <Text style={styles.subtitle}>
        Use your Stellar secret key to securely authenticate
      </Text>
      
      <TextInput
        label="Stellar Secret Key"
        value={secretKey}
        onChangeText={text => {
          setSecretKey(text);
          if (errors.secretKey) {
            setErrors(prev => ({ ...prev, secretKey: null }));
          }
        }}
        style={styles.input}
        secureTextEntry
        mode="outlined"
        outlineColor="#FFFFFF50"
        activeOutlineColor="#FFFFFF"
        textColor="#FFFFFF"
        left={<TextInput.Icon icon="key" color="#FFFFFF" />}
        right={<TextInput.Icon icon="eye-off" color="#FFFFFF" />}
        theme={{ colors: { placeholder: '#FFFFFF80', text: '#FFFFFF' } }}
        error={!!errors.secretKey}
        disabled={loading}
      />
      {errors.secretKey && (
        <HelperText type="error" visible={true} style={styles.errorText}>
          {errors.secretKey}
        </HelperText>
      )}
      
      <Button
        mode="contained"
        onPress={handleLogin}
        style={styles.button}
        labelStyle={styles.buttonText}
        buttonColor="#FFFFFF"
        loading={loading}
        disabled={loading}
      >
        Sign In
      </Button>
      
      <Button
        mode="outlined"
        onPress={handleBack}
        style={styles.backButton}
        labelStyle={styles.backButtonText}
        textColor="#FFFFFF"
        disabled={loading}
      >
        Back
      </Button>
      
      <TouchableOpacity
        onPress={() => navigation.navigate('Register')}
        style={styles.linkContainer}
      >
        <Text style={styles.linkText}>Don't have a Stellar account? Register</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={['#00A86B', '#008C5A']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>NEDApay</Text>
            <Text style={styles.tagline}>Stellar Authentication</Text>
          </View>

          {step === 1 ? renderPhoneStep() : renderSecretKeyStep()}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              1 iTZS = 1 Tanzanian Shilling
            </Text>
            <Text style={styles.footerSubText}>
              Powered by Stellar Blockchain
            </Text>
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
  scrollView: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  backButton: {
    marginTop: 10,
    marginBottom: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 5,
  },
  formContainer: {
    width: '100%',
    marginBottom: 40,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  errorText: {
    color: '#FFCCCC',
    marginBottom: 15,
  },
  button: {
    marginTop: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00A86B',
  },
  backButton: {
    marginTop: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderColor: '#FFFFFF',
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  footerSubText: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 12,
  },
});

export default StellarLoginScreen;
