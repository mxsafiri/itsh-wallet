import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import SendPaymentScreen from '../screens/SendPaymentScreen';
import ReceiveScreen from '../screens/ReceiveScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';

// Import context
import { AuthContext } from '../context/AuthContext';

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home stack navigator
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#3498db',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'iTZS Wallet' }} />
    <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} options={{ title: 'Transaction Details' }} />
  </Stack.Navigator>
);

// Send stack navigator
const SendStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#3498db',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen name="Send" component={SendPaymentScreen} options={{ title: 'Send iTZS' }} />
  </Stack.Navigator>
);

// Receive stack navigator
const ReceiveStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#3498db',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen name="Receive" component={ReceiveScreen} options={{ title: 'Receive iTZS' }} />
  </Stack.Navigator>
);

// Transactions stack navigator
const TransactionsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#3498db',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen name="Transactions" component={TransactionsScreen} options={{ title: 'Transaction History' }} />
    <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} options={{ title: 'Transaction Details' }} />
  </Stack.Navigator>
);

// Profile stack navigator
const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#3498db',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
  </Stack.Navigator>
);

// Main app navigator
const AppNavigator = () => {
  const { user } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'SendTab') {
            iconName = focused ? 'arrow-up-circle' : 'arrow-up-circle-outline';
          } else if (route.name === 'ReceiveTab') {
            iconName = focused ? 'arrow-down-circle' : 'arrow-down-circle-outline';
          } else if (route.name === 'TransactionsTab') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack} 
        options={{ 
          headerShown: false,
          title: 'Home'
        }} 
      />
      <Tab.Screen 
        name="SendTab" 
        component={SendStack} 
        options={{ 
          headerShown: false,
          title: 'Send'
        }} 
      />
      <Tab.Screen 
        name="ReceiveTab" 
        component={ReceiveStack} 
        options={{ 
          headerShown: false,
          title: 'Receive'
        }} 
      />
      <Tab.Screen 
        name="TransactionsTab" 
        component={TransactionsStack} 
        options={{ 
          headerShown: false,
          title: 'History'
        }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStack} 
        options={{ 
          headerShown: false,
          title: 'Profile'
        }} 
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
