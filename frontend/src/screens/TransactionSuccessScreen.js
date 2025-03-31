import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Divider } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';

const TransactionSuccessScreen = ({ navigation, route }) => {
  const { amount, recipient, transactionId, date } = route.params || {};
  const fee = route.params?.fee || '0.000001';
  const currentDate = date ? new Date(date) : new Date();

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
Amount: ${parseFloat(amount).toLocaleString()} iTZS
To: ${recipient.name || recipient.phoneNumber}
Date: ${formatDate(currentDate)}
Fee: ${fee} XLM
Transaction ID: ${transactionId}

Powered by iTZS mobile wallet`;
      
      await Share.share({
        message,
        title: 'iTZS Transaction Details',
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

  // Copy transaction ID to clipboard
  const copyTransactionId = async () => {
    try {
      await Clipboard.setStringAsync(transactionId);
      alert('Transaction ID copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  // View transaction on Stellar explorer
  const viewOnExplorer = () => {
    const url = `https://stellar.expert/explorer/testnet/tx/${transactionId}`;
    Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
  };

  return (
    <LinearGradient colors={['#00A86B', '#008C5A']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.successIconContainer}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={64} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.successTitle}>Transaction Successful!</Text>
          
          <View style={styles.amountContainer}>
            <Text style={styles.amountText}>
              {parseFloat(amount).toLocaleString()} iTZS
            </Text>
            <Text style={styles.recipientText}>
              sent to {recipient.name || recipient.phoneNumber}
            </Text>
          </View>

          <Card style={styles.detailsCard}>
            <Card.Content>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{formatDate(currentDate)}</Text>
              </View>

              <Divider style={styles.separator} />

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>Send</Text>
              </View>

              <Divider style={styles.separator} />

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Amount</Text>
                <Text style={styles.detailValue}>{parseFloat(amount).toLocaleString()} iTZS</Text>
              </View>

              <Divider style={styles.separator} />

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Fee</Text>
                <Text style={styles.detailValue}>{fee} XLM</Text>
              </View>

              <Divider style={styles.separator} />

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Transaction ID</Text>
                <View style={styles.transactionIdContainer}>
                  <Text style={styles.transactionIdText} numberOfLines={1} ellipsizeMode="middle">
                    {transactionId}
                  </Text>
                  <TouchableOpacity onPress={copyTransactionId} style={styles.copyButton}>
                    <Ionicons name="copy-outline" size={18} color="#00A86B" />
                  </TouchableOpacity>
                </View>
              </View>
            </Card.Content>
          </Card>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Your transaction has been processed on the Stellar blockchain with near-zero fees.
            </Text>
            <TouchableOpacity onPress={viewOnExplorer} style={styles.viewExplorerButton}>
              <Text style={styles.viewExplorerText}>View on Stellar Explorer</Text>
              <Ionicons name="open-outline" size={16} color="#00A86B" />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleShare}
              style={styles.shareButton}
              icon="share-variant"
            >
              Share Details
            </Button>

            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={handleNewTransaction}
                style={styles.secondaryButton}
                labelStyle={styles.secondaryButtonText}
              >
                New Transaction
              </Button>

              <Button
                mode="outlined"
                onPress={handleGoHome}
                style={[styles.secondaryButton, styles.homeButton]}
                labelStyle={styles.secondaryButtonText}
              >
                Go to Home
              </Button>
            </View>
          </View>
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
  },
  successIconContainer: {
    marginTop: 40,
    marginBottom: 20,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
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
    width: '100%',
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#555555',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  separator: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  transactionIdContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    maxWidth: '70%',
  },
  transactionIdText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginRight: 8,
  },
  copyButton: {
    padding: 4,
  },
  infoContainer: {
    width: '100%',
    marginBottom: 30,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  viewExplorerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  viewExplorerText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 8,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 'auto',
    paddingBottom: 20,
  },
  shareButton: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
  },
  homeButton: {
    marginLeft: 12,
  },
});

export default TransactionSuccessScreen;
