import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
