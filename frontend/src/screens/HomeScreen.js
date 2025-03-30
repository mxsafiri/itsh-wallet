import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Card } from 'react-native-paper';
import { AuthContext } from '../../App';
import { walletAPI, transactionAPI } from '../services/api';

const HomeScreen = ({ navigation }) => {
  const { userData } = useContext(AuthContext);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch user balance
  const fetchBalance = async () => {
    try {
      const response = await walletAPI.getBalance(userData.id);
      if (response.success) {
        setBalance(response.balance);
      } else {
        console.error('Failed to fetch balance:', response.message);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  // Function to fetch recent transactions
  const fetchTransactions = async () => {
    try {
      const response = await transactionAPI.getHistory(userData.id, 5);
      if (response.success) {
        setTransactions(response.transactions);
      } else {
        console.error('Failed to fetch transactions:', response.message);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // Function to handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchBalance(), fetchTransactions()]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle mock deposit
  const handleDeposit = async () => {
    Alert.prompt(
      'Deposit iTZS',
      'Enter amount to deposit (TZS):',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Deposit',
          onPress: async (amount) => {
            if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
              Alert.alert('Error', 'Please enter a valid amount');
              return;
            }

            try {
              setLoading(true);
              const response = await walletAPI.deposit(userData.id, parseFloat(amount));
              
              if (response.success) {
                Alert.alert('Success', `${amount} iTZS has been added to your wallet`);
                // Refresh balance
                await fetchBalance();
              } else {
                Alert.alert('Error', response.message || 'Deposit failed');
              }
            } catch (error) {
              Alert.alert('Error', error.message || 'Something went wrong');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchBalance(), fetchTransactions()]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userData]);

  // Format currency
  const formatCurrency = (amount) => {
    return amount?.toLocaleString() || '0';
  };

  // Format transaction date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get transaction icon based on type
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'sent':
        return 'arrow-up-circle-outline';
      case 'received':
        return 'arrow-down-circle-outline';
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

  // Get transaction amount with sign
  const getTransactionAmount = (transaction) => {
    const amount = transaction.amount;
    const sign = transaction.type === 'sent' ? '-' : '+';
    return `${sign} ${formatCurrency(amount)}`;
  };

  return (
    <LinearGradient
      colors={['#0A2463', '#1E3A8A']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.phoneText}>{userData?.phoneNumber}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle-outline" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Account Balance</Text>
            {loading && balance === null ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <View style={styles.balanceRow}>
                <Text style={styles.balanceAmount}>
                  {formatCurrency(balance)}
                </Text>
                <Text style={styles.currencyText}>iTZS</Text>
              </View>
            )}
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Send')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="arrow-up" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>Send</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Receive')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#2196F3' }]}>
                <Ionicons name="arrow-down" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>Receive</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDeposit}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FF9800' }]}>
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>Deposit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsContainer}>
            <View style={styles.transactionsHeader}>
              <Text style={styles.transactionsTitle}>Transactions</Text>
              <TouchableOpacity onPress={() => navigation.navigate('History')}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {loading && transactions.length === 0 ? (
              <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
            ) : transactions.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Card.Content>
                  <Text style={styles.emptyText}>No transactions yet</Text>
                </Card.Content>
              </Card>
            ) : (
              transactions.map((transaction) => (
                <TouchableOpacity
                  key={transaction.id}
                  style={styles.transactionCard}
                  onPress={() => navigation.navigate('TransactionDetails', { transaction })}
                >
                  <View style={styles.transactionIconContainer}>
                    <Ionicons
                      name={getTransactionIcon(transaction.type)}
                      size={24}
                      color={getTransactionColor(transaction.type)}
                    />
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionTitle}>
                      {transaction.type === 'sent' ? 'Sent to' : 'Received from'}{' '}
                      {transaction.counterparty}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.timestamp)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color: getTransactionColor(transaction.type),
                      },
                    ]}
                  >
                    {getTransactionAmount(transaction)}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={styles.reserveContainer}>
            <Text style={styles.reserveText}>
              1 iTZS = 1 TZS, backed by 2,500,000 TZS in reserve
            </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  phoneText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  balanceContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  currencyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
    marginBottom: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  transactionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  seeAllText: {
    fontSize: 14,
    color: '#00A86B',
  },
  loader: {
    marginTop: 20,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#757575',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reserveContainer: {
    padding: 20,
    alignItems: 'center',
  },
  reserveText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default HomeScreen;
