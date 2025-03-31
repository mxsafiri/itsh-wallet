import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <LinearGradient
      colors={['#00A86B', '#008C5A']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>NEDApay</Text>
            <Text style={styles.tagline}>Tanzania's Digital Payment Solution</Text>
          </View>

          <View style={styles.illustrationContainer}>
            <Image
              source={require('../../assets/wallet-illustration.png')}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="flash" size={24} color="#FFFFFF" />
              <Text style={styles.featureText}>Fast & Secure Payments</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="wallet" size={24} color="#FFFFFF" />
              <Text style={styles.featureText}>Digital Tanzanian Shilling</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="globe" size={24} color="#FFFFFF" />
              <Text style={styles.featureText}>Powered by Stellar Blockchain</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.registerButton}
              labelStyle={styles.buttonText}
              icon="account-plus"
            >
              Create a Wallet
            </Button>
            
            <Button
              mode="outlined"
              onPress={handleLogin}
              style={styles.loginButton}
              labelStyle={styles.loginButtonText}
              icon="login"
            >
              I Already Have a Wallet
            </Button>
          </View>

          <TouchableOpacity 
            style={styles.stellarLoginLink}
            onPress={() => navigation.navigate('StellarLogin')}
          >
            <Text style={styles.stellarLoginText}>Sign in with Stellar</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.versionText}>Version 1.0.0</Text>
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
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.05,
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
  illustrationContainer: {
    width: width * 0.8,
    height: height * 0.3,
    marginVertical: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  registerButton: {
    backgroundColor: '#FFFFFF',
    marginBottom: 15,
    borderRadius: 8,
    paddingVertical: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00A86B',
  },
  loginButton: {
    borderColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 5,
  },
  loginButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  stellarLoginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
  },
  stellarLoginText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: 5,
    textDecorationLine: 'underline',
  },
  versionText: {
    color: '#FFFFFF',
    opacity: 0.6,
    fontSize: 12,
    marginTop: 20,
  },
});

export default WelcomeScreen;
