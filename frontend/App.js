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
        if (userDataString) {
          userData = JSON.parse(userDataString);
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
        // In a real app, we would validate credentials with the backend
        // For the MVP, we'll just store the data locally
        try {
          await SecureStore.setItemAsync('userToken', data.id);
          await SecureStore.setItemAsync('userData', JSON.stringify(data));
          setUserToken(data.id);
          setUserData(data);
        } catch (e) {
          console.log('Error signing in:', e);
        }
      },
      signOut: async () => {
        try {
          await SecureStore.deleteItemAsync('userToken');
          await SecureStore.deleteItemAsync('userData');
          setUserToken(null);
          setUserData(null);
        } catch (e) {
          console.log('Error signing out:', e);
        }
      },
      signUp: async (data) => {
        // In a real app, we would register with the backend
        // For the MVP, we'll just store the data locally
        try {
          await SecureStore.setItemAsync('userToken', data.id);
          await SecureStore.setItemAsync('userData', JSON.stringify(data));
          setUserToken(data.id);
          setUserData(data);
        } catch (e) {
          console.log('Error signing up:', e);
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
