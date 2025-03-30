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
import { TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../App';
import { authAPI } from '../services/api';

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!phoneNumber || !pin) {
      Alert.alert('Error', 'Please enter both phone number and PIN');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.login(phoneNumber, pin);
      
      if (response.success) {
        signIn(response.user);
      } else {
        Alert.alert('Error', response.message || 'Login failed');
      }
    } catch (error) {
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
      
      const response = await authAPI.login(demoPhone, demoPin);
      
      if (response.success) {
        signIn(response.user);
      } else {
        Alert.alert('Error', response.message || 'Demo login failed');
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
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>iTZS</Text>
              <Text style={styles.tagline}>Fast, Secure Payments in Tanzania</Text>
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
                label="PIN"
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

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
                labelStyle={styles.buttonText}
                buttonColor="#00A86B"
              >
                Login
              </Button>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerLink}>Register</Text>
                </TouchableOpacity>
              </View>

              {/* Quick login for demo purposes */}
              <TouchableOpacity
                style={styles.demoButton}
                onPress={handleQuickLogin}
                disabled={loading}
              >
                <Text style={styles.demoButtonText}>Demo Login</Text>
              </TouchableOpacity>
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
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    marginBottom: 40,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  loginButton: {
    marginTop: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#FFFFFF',
    marginRight: 5,
  },
  registerLink: {
    color: '#00A86B',
    fontWeight: 'bold',
  },
  demoButton: {
    marginTop: 40,
    alignItems: 'center',
  },
  demoButtonText: {
    color: '#FFFFFF80',
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 5,
  },
  footerSubText: {
    color: '#FFFFFF80',
    fontSize: 12,
  },
});

export default LoginScreen;
