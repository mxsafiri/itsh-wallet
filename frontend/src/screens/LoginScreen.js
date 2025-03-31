import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../App';
import { authAPI } from '../services/api';

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [errors, setErrors] = useState({});
  const { signIn } = useContext(AuthContext);

  const validatePhoneNumber = () => {
    // Basic validation for Tanzanian phone numbers
    const phoneRegex = /^(\+?255|0)[67]\d{8}$/;
    return phoneRegex.test(phoneNumber);
  };

  const handleLogin = async () => {
    // Reset errors
    setErrors({});
    
    // Validate inputs
    if (!phoneNumber) {
      setErrors(prev => ({ ...prev, phoneNumber: 'Phone number is required' }));
      return;
    }

    if (!validatePhoneNumber()) {
      setErrors(prev => ({ ...prev, phoneNumber: 'Please enter a valid Tanzanian phone number' }));
      return;
    }

    if (!pin) {
      setErrors(prev => ({ ...prev, pin: 'PIN is required' }));
      return;
    }

    if (pin.length !== 4) {
      setErrors(prev => ({ ...prev, pin: 'PIN must be 4 digits' }));
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting login with:', { phoneNumber, pin });
      
      const response = await authAPI.login(phoneNumber, pin);
      console.log('Login response:', response);
      
      if (response.success) {
        console.log('Login successful, signing in user:', response.user);
        await signIn(response.user);
        console.log('User signed in successfully');
      } else {
        Alert.alert('Login Failed', response.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // For demo purposes, we'll provide a quick login option
  const handleQuickLogin = async () => {
    try {
      setLoading(true);
      const demoPhone = '+255123456789';
      const demoPin = '1234';
      
      console.log('Attempting quick login with demo credentials');
      const response = await authAPI.login(demoPhone, demoPin);
      console.log('Quick login response:', response);
      
      if (response.success) {
        console.log('Quick login successful, signing in user:', response.user);
        await signIn(response.user);
        console.log('User signed in successfully');
      } else {
        Alert.alert('Demo Login Failed', response.message || 'Could not login with demo account');
      }
    } catch (error) {
      console.error('Quick login error:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

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
          <ScrollView 
            contentContainerStyle={styles.scrollView}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Welcome')}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>NEDApay</Text>
              <Text style={styles.tagline}>Fast, Secure Payments in Tanzania</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.headerText}>Welcome Back</Text>
              <Text style={styles.subHeaderText}>Login to access your NEDApay wallet</Text>
              
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
              />
              {errors.phoneNumber && (
                <HelperText type="error" visible={true} style={styles.errorText}>
                  {errors.phoneNumber}
                </HelperText>
              )}

              <TextInput
                label="PIN"
                value={pin}
                onChangeText={text => {
                  setPin(text);
                  if (errors.pin) {
                    setErrors(prev => ({ ...prev, pin: null }));
                  }
                }}
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
              {errors.pin && (
                <HelperText type="error" visible={true} style={styles.errorText}>
                  {errors.pin}
                </HelperText>
              )}

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
                labelStyle={styles.buttonText}
                buttonColor="#FFFFFF"
              >
                Login
              </Button>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerLink}>Register</Text>
                </TouchableOpacity>
              </View>

              {/* Stellar Authentication Option */}
              <TouchableOpacity 
                style={styles.stellarAuthContainer}
                onPress={() => navigation.navigate('StellarLogin')}
                disabled={loading}
              >
                <Ionicons name="star" size={16} color="#FFFFFF" style={styles.stellarIcon} />
                <Text style={styles.stellarAuthText}>Sign in with Stellar Authentication</Text>
              </TouchableOpacity>

              {/* Quick login for demo purposes */}
              {__DEV__ && (
                <TouchableOpacity
                  style={styles.demoButton}
                  onPress={handleQuickLogin}
                  disabled={loading}
                >
                  <Text style={styles.demoButtonText}>Demo Login</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                1 iTZS = 1 Tanzanian Shilling
              </Text>
              <Text style={styles.footerSubText}>
                Powered by Stellar Blockchain
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
    marginBottom: 30,
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  errorText: {
    color: '#FFCCCC',
    marginBottom: 8,
  },
  loginButton: {
    marginTop: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00A86B',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#FFFFFF',
    opacity: 0.8,
    marginRight: 5,
  },
  registerLink: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  stellarAuthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF50',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  stellarIcon: {
    marginRight: 8,
  },
  stellarAuthText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  demoButton: {
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
  },
  demoButtonText: {
    color: '#FFFFFF',
    opacity: 0.8,
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

export default LoginScreen;
