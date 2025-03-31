import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';

// Import navigation
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';

// Create a context for authentication
export const AuthContext = React.createContext();

// Define the theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#00A86B', // Green color for primary elements
    accent: '#FFC107', // Amber color for accent elements
    background: '#F5F5F5', // Light gray background
    text: '#212121', // Dark text
    placeholder: '#757575', // Gray placeholder text
  },
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const bootstrapAsync = async () => {
      let userToken;
      let userData;

      try {
        // Fetch the token and user data from storage
        userToken = await SecureStore.getItemAsync('userToken');
        const userDataString = await SecureStore.getItemAsync('userData');
        
        console.log('Bootstrap - userToken:', userToken);
        console.log('Bootstrap - userDataString:', userDataString);
        
        if (userDataString) {
          userData = JSON.parse(userDataString);
          console.log('Bootstrap - parsed userData:', userData);
        }
      } catch (e) {
        // Restoring token failed
        console.log('Failed to restore authentication state:', e);
      }

      // After restoring token, update state
      setUserToken(userToken);
      setUserData(userData);
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  // Authentication context
  const authContext = React.useMemo(
    () => ({
      signIn: async (data) => {
        console.log('signIn called with data:', data);
        // In a real app, we would validate credentials with the backend
        try {
          // Store auth token if available
          if (data.token) {
            await SecureStore.setItemAsync('authToken', data.token);
          }
          
          // Always store the user ID as the userToken for session management
          await SecureStore.setItemAsync('userToken', data.id || String(Date.now()));
          await SecureStore.setItemAsync('userData', JSON.stringify(data));
          
          console.log('Data stored in SecureStore');
          
          // Update state to trigger navigation change
          setUserToken(data.id || String(Date.now()));
          setUserData(data);
          
          console.log('State updated, userToken:', data.id || String(Date.now()));
          return true;
        } catch (e) {
          console.error('Error signing in:', e);
          return false;
        }
      },
      signOut: async () => {
        try {
          await SecureStore.deleteItemAsync('userToken');
          await SecureStore.deleteItemAsync('userData');
          await SecureStore.deleteItemAsync('authToken');
          setUserToken(null);
          setUserData(null);
        } catch (e) {
          console.log('Error signing out:', e);
        }
      },
      signUp: async (data) => {
        // In a real app, we would register with the backend
        try {
          // Store auth token if available
          if (data.token) {
            await SecureStore.setItemAsync('authToken', data.token);
          }
          
          await SecureStore.setItemAsync('userToken', data.id || String(Date.now()));
          await SecureStore.setItemAsync('userData', JSON.stringify(data));
          
          // Update state to trigger navigation change
          setUserToken(data.id || String(Date.now()));
          setUserData(data);
          return true;
        } catch (e) {
          console.error('Error signing up:', e);
          return false;
        }
      },
      userData,
    }),
    [userData]
  );

  if (isLoading) {
    // We could show a loading screen here
    return null;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <AuthContext.Provider value={authContext}>
            <StatusBar style="auto" />
            {userToken ? <MainNavigator /> : <AuthNavigator />}
          </AuthContext.Provider>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
