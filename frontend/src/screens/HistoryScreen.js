import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Chip } from 'react-native-paper';
import { AuthContext } from '../../App';
import { transactionAPI } from '../services/api';

const HistoryScreen = ({ navigation }) => {
  const { userData } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'sent', 'received'

  // Fetch transaction history
  const fetchTransactions = async () => {
    try {
      const response = await transactionAPI.getHistory(userData.id, 50);
      if (response.success) {
        setTransactions(response.transactions);
      } else {
        console.error('Failed to fetch transactions:', response.message);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load transactions when component mounts
  useEffect(() => {
    fetchTransactions();
    
    // Add listener to refresh when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTransactions();
    });
    
    return unsubscribe;
  }, [userData, navigation]);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  // Format transaction date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
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
    return `${sign} ${amount.toLocaleString()}`;
  };

  // Filter transactions based on selected filter
  const getFilteredTransactions = () => {
    if (filter === 'all') {
      return transactions;
    }
    return transactions.filter(transaction => transaction.type === filter);
  };

  // Group transactions by date
  const groupTransactionsByDate = () => {
    const filteredTransactions = getFilteredTransactions();
    const groups = {};
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.timestamp);
      const dateKey = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(transaction);
    });
    
    return Object.entries(groups).map(([date, items]) => ({
      date,
      items,
    }));
  };

  // Handle transaction item press
  const handleTransactionPress = (transaction) => {
    navigation.navigate('TransactionDetails', { transaction });
  };

  // Render transaction item
  const renderTransactionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() => handleTransactionPress(item)}
      activeOpacity={0.7}
    >
      <View 
        style={[
          styles.transactionIconContainer,
          { backgroundColor: getTransactionColor(item.type) + '20' }
        ]}
      >
        <Ionicons
          name={getTransactionIcon(item.type)}
          size={24}
          color={getTransactionColor(item.type)}
        />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>
          {item.type === 'sent' ? 'Sent to' : 'Received from'}{' '}
          <Text style={styles.counterpartyText}>{item.counterparty}</Text>
        </Text>
        <Text style={styles.transactionTime}>
          {new Date(item.timestamp).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          })}
          {item.status !== 'completed' && (
            <Text style={[styles.statusText, { color: item.status === 'pending' ? '#FFC107' : '#FF5252' }]}>
              {' • '}{item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          )}
        </Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          {
            color: getTransactionColor(item.type),
          },
        ]}
      >
        {getTransactionAmount(item)}
      </Text>
    </TouchableOpacity>
  );

  // Render date header
  const renderDateHeader = ({ date }) => (
    <View style={styles.dateHeader}>
      <Text style={styles.dateText}>{date}</Text>
    </View>
  );

  // Render transaction group
  const renderTransactionGroup = ({ item }) => (
    <View style={styles.transactionGroup}>
      {renderDateHeader({ date: item.date })}
      {item.items.map((transaction) => (
        <View key={transaction.id}>
          {renderTransactionItem({ item: transaction })}
        </View>
      ))}
    </View>
  );

  // Render filter chips
  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      <Chip
        selected={filter === 'all'}
        onPress={() => setFilter('all')}
        style={[styles.filterChip, filter === 'all' && styles.selectedChip]}
        textStyle={[styles.filterChipText, filter === 'all' && styles.selectedChipText]}
      >
        All
      </Chip>
      <Chip
        selected={filter === 'received'}
        onPress={() => setFilter('received')}
        style={[styles.filterChip, filter === 'received' && styles.selectedChip]}
        textStyle={[styles.filterChipText, filter === 'received' && styles.selectedChipText]}
      >
        Received
      </Chip>
      <Chip
        selected={filter === 'sent'}
        onPress={() => setFilter('sent')}
        style={[styles.filterChip, filter === 'sent' && styles.selectedChip]}
        textStyle={[styles.filterChipText, filter === 'sent' && styles.selectedChipText]}
      >
        Sent
      </Chip>
    </View>
  );

  return (
    <LinearGradient colors={['#0A2463', '#1E3A8A']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transaction History</Text>
        </View>

        {renderFilterChips()}

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        ) : getFilteredTransactions().length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#FFFFFF" />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          <FlatList
            data={groupTransactionsByDate()}
            renderItem={renderTransactionGroup}
            keyExtractor={(item) => item.date}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#00A86B']}
                tintColor="#FFFFFF"
              />
            }
          />
        )}
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  filterChip: {
    marginHorizontal: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedChip: {
    backgroundColor: '#00A86B',
  },
  filterChipText: {
    color: '#FFFFFF',
  },
  selectedChipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  transactionGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    marginBottom: 10,
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  transactionItem: {
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    color: '#212121',
    marginBottom: 3,
  },
  counterpartyText: {
    fontWeight: '500',
  },
  transactionTime: {
    fontSize: 12,
    color: '#757575',
  },
  statusText: {
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HistoryScreen;
