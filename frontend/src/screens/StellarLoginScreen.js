import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { TextInput, Button, Title, Paragraph } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import stellarAuthService from '../services/stellarAuthService';
import * as SecureStore from 'expo-secure-store';

const StellarLoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter phone, 2: Enter secret key

  const handleRequestChallenge = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      const response = await stellarAuthService.requestChallenge(phoneNumber);
      
      if (response.success) {
        setStep(2);
      } else {
        Alert.alert('Error', response.message || 'Failed to request challenge');
      }
    } catch (error) {
      console.error('Challenge request error:', error);
      Alert.alert('Error', 'Failed to request authentication challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!secretKey || secretKey.length < 50) {
      Alert.alert('Invalid Secret Key', 'Please enter a valid Stellar secret key');
      return;
    }

    try {
      setLoading(true);
      const response = await stellarAuthService.authenticate(phoneNumber, secretKey);
      
      if (response.success) {
        // Store user data securely
        await SecureStore.setItemAsync('userData', JSON.stringify(response.user));
        
        // Navigate to the main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
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
  };

  const renderPhoneStep = () => (
    <View style={styles.formContainer}>
      <Title style={styles.title}>Sign In with Stellar</Title>
      <Paragraph style={styles.subtitle}>
        Enter your phone number to start the authentication process
      </Paragraph>
      
      <TextInput
        label="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        style={styles.input}
        keyboardType="phone-pad"
        autoCapitalize="none"
        disabled={loading}
      />
      
      <Button
        mode="contained"
        onPress={handleRequestChallenge}
        style={styles.button}
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
      <Title style={styles.title}>Enter Stellar Secret Key</Title>
      <Paragraph style={styles.subtitle}>
        Use your Stellar secret key to securely authenticate
      </Paragraph>
      
      <TextInput
        label="Stellar Secret Key"
        value={secretKey}
        onChangeText={setSecretKey}
        style={styles.input}
        secureTextEntry
        autoCapitalize="none"
        disabled={loading}
      />
      
      <Button
        mode="contained"
        onPress={handleLogin}
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        Sign In
      </Button>
      
      <Button
        mode="outlined"
        onPress={handleBack}
        style={styles.backButton}
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
      colors={['#1a237e', '#4a148c', '#311b92']}
      style={styles.container}
    >
      {step === 1 ? renderPhoneStep() : renderSecretKeyStep()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#1a237e',
  },
  subtitle: {
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: '#4a148c',
  },
  backButton: {
    marginTop: 10,
    paddingVertical: 8,
    borderColor: '#4a148c',
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#4a148c',
    textDecorationLine: 'underline',
  },
});

export default StellarLoginScreen;
