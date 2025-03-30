import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';

const TransactionSuccessScreen = ({ navigation, route }) => {
  const { amount, recipient, fee, transactionId } = route.params || {};
  const currentDate = new Date();

  // Format date
  const formatDate = (date) => {
    return date.toLocaleString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Handle sharing transaction details
  const handleShare = async () => {
    try {
      const message = `Transaction Successful!
Amount: ${amount.toLocaleString()} iTZS
To: ${recipient}
Date: ${formatDate(currentDate)}
Fee: ${fee || '0.000001'} XLM
Transaction ID: ${transactionId}

Powered by iTZS mobile wallet`;
      
      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Error sharing transaction details:', error);
    }
  };

  // Handle going back to home
  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  // Handle new transaction
  const handleNewTransaction = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Send' }],
    });
  };

  return (
    <LinearGradient colors={['#0A2463', '#1E3A8A']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successIconContainer}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={64} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.successTitle}>Transaction Successful!</Text>
          
          <View style={styles.amountContainer}>
            <Text style={styles.amountText}>
              {amount?.toLocaleString() || '0'} iTZS
            </Text>
            <Text style={styles.recipientText}>
              sent to {recipient}
            </Text>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(currentDate)}</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>Send</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={styles.detailValue}>{amount?.toLocaleString() || '0'} iTZS</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Fee</Text>
              <Text style={styles.detailValue}>{fee || '0.000001'} XLM</Text>
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Your transaction has been processed on the Stellar blockchain with near-zero fees.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleShare}
              style={styles.shareButton}
              labelStyle={styles.buttonText}
              buttonColor="#00A86B"
              icon="share-variant"
            >
              Share Details
            </Button>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleNewTransaction}
              >
                <Text style={styles.secondaryButtonText}>New Transaction</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, styles.homeButton]}
                onPress={handleGoHome}
              >
                <Text style={styles.secondaryButtonText}>Go to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  successIconContainer: {
    marginTop: 40,
    marginBottom: 20,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  amountText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  recipientText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#757575',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  infoContainer: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: 20,
  },
  shareButton: {
    marginBottom: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
  },
  homeButton: {
    marginLeft: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default TransactionSuccessScreen;
