import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * A component that provides fallback UI when an asset is missing
 * Used to prevent build errors with missing images
 */
const EmptyAssetFallback = ({ iconName = 'wallet-outline', size = 80, color = '#FFFFFF', text = 'NEDApay' }) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={iconName} size={size} color={color} />
      {text ? <Text style={{ color, marginTop: 8, fontWeight: 'bold' }}>{text}</Text> : null}
    </View>
  );
};

export default EmptyAssetFallback;
