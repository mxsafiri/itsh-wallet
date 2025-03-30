import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';

const TransactionDetailsScreen = ({ navigation, route }) => {
  const { transaction } = route.params || {};

  if (!transaction) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Transaction details not available</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format amount
  const formatAmount = (amount) => {
    return amount.toLocaleString();
  };

  // Get transaction status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'pending':
        return '#FFC107';
      case 'failed':
        return '#FF5252';
      default:
        return '#757575';
    }
  };

  // Get transaction type icon
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'sent':
        return 'arrow-up-circle';
      case 'received':
        return 'arrow-down-circle';
      default:
        return 'swap-horizontal';
    }
  };

  // Get transaction color based on type
  const getTransactionColor = (type) => {
    switch (type) {
      case 'sent':
        return '#FF5252';
      case 'received':
        return '#4CAF50';
      default:
        return '#2196F3';
    }
  };

  // Handle sharing transaction details
  const handleShare = async () => {
    try {
      const message = `Transaction Details:
Type: ${transaction.type === 'sent' ? 'Sent' : 'Received'}
Amount: ${formatAmount(transaction.amount)} iTZS
${transaction.type === 'sent' ? 'To' : 'From'}: ${transaction.counterparty}
Date: ${formatDate(transaction.timestamp)}
Fee: ${transaction.fee} XLM
Status: ${transaction.status}
Transaction ID: ${transaction.id}

Powered by iTZS mobile wallet`;
      
      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Error sharing transaction details:', error);
    }
  };

  return (
    <LinearGradient colors={['#0A2463', '#1E3A8A']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Details</Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: getTransactionColor(transaction.type) },
              ]}
            >
              <Ionicons
                name={getTransactionIcon(transaction.type)}
                size={40}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.typeText}>
              {transaction.type === 'sent' ? 'Sent' : 'Received'}
            </Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.amountText}>
              {transaction.type === 'sent' ? '-' : '+'} {formatAmount(transaction.amount)}
            </Text>
            <Text style={styles.currencyText}>iTZS</Text>
          </View>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(transaction.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {transaction.status.charAt(0).toUpperCase() +
                  transaction.status.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>
                {transaction.type === 'sent' ? 'Recipient' : 'Sender'}
              </Text>
              <Text style={styles.detailValue}>{transaction.counterparty}</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>
                {formatDate(transaction.timestamp)}
              </Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Transaction Fee</Text>
              <Text style={styles.detailValue}>{transaction.fee} XLM</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="middle">
                {transaction.id}
              </Text>
            </View>

            {transaction.stellarTxId && (
              <>
                <View style={styles.separator} />
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Stellar Transaction ID</Text>
                  <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="middle">
                    {transaction.stellarTxId}
                  </Text>
                </View>
              </>
            )}
          </View>

          {transaction.type === 'received' && (
            <Button
              mode="contained"
              onPress={() => {
                navigation.navigate('Send', {
                  initialRecipient: transaction.counterparty,
                });
              }}
              style={styles.actionButton}
              labelStyle={styles.buttonText}
              buttonColor="#00A86B"
              icon="arrow-up"
            >
              Send Back
            </Button>
          )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0A2463',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  amountText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  currencyText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
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
    maxWidth: '60%',
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  actionButton: {
    marginBottom: 30,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TransactionDetailsScreen;
