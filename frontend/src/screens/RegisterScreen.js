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
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../App';
import { authAPI } from '../services/api';

const RegisterScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const { signUp } = useContext(AuthContext);

  const handleRegister = async () => {
    // Validate inputs
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    if (!pin || pin.length < 4) {
      Alert.alert('Error', 'Please enter a 4-digit PIN');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.register(phoneNumber, pin);
      
      if (response.success) {
        Alert.alert(
          'Registration Successful',
          'Your iTZS wallet has been created!',
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
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0A2463', '#1E3A8A']}
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
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerContainer}>
              <Text style={styles.headerText}>Create Account</Text>
              <Text style={styles.subHeaderText}>
                Register to start using iTZS for fast, low-cost payments
              </Text>
            </View>

            <View style={styles.formContainer}>
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
              />

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
              />

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
              />

              <Button
                mode="contained"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                style={styles.registerButton}
                labelStyle={styles.buttonText}
                buttonColor="#00A86B"
              >
                Create Wallet
              </Button>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>
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
    marginBottom: 40,
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
  },
  formContainer: {
    width: '100%',
    marginBottom: 40,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  registerButton: {
    marginTop: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#FFFFFF',
    marginRight: 5,
  },
  loginLink: {
    color: '#00A86B',
    fontWeight: 'bold',
  },
  termsContainer: {
    marginTop: 'auto',
    marginBottom: 20,
    alignItems: 'center',
  },
  termsText: {
    color: '#FFFFFF80',
    textAlign: 'center',
    fontSize: 12,
  },
});

export default RegisterScreen;
