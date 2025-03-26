import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Alert, View, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useKhata, Expense, Transaction } from '@/context/KhataContext';
import styled from 'styled-components/native';

// Define theme interface for type safety
interface ThemeProps {
  theme: {
    colors: {
      background: string;
      text: string;
      primary: string;
      secondary: string;
      card: string;
      border: string;
    };
  };
}

const Card = styled(ThemedView)`
  background-color: ${(props: ThemeProps) => props.theme.colors.card};
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  elevation: 3;
  shadow-opacity: 0.1;
  shadow-radius: 6px;
  shadow-color: #000;
  shadow-offset: 0px 3px;
  align-items: center;
`;

const ExpenseItem = styled(ThemedView)`
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 10px;
  background-color: ${(props: ThemeProps) => props.theme.colors.card};
  elevation: 2;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
`;

const ExpenseHeader = styled(ThemedView)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ExpenseAmount = styled(ThemedText)`
  font-size: 18px;
  font-weight: bold;
  color: ${(props: ThemeProps) => props.theme.colors.primary};
`;

const TabsContainer = styled(ThemedView)`
  flex-direction: row;
  justify-content: space-around;
  margin-bottom: 16px;
  border-bottom-width: 1px;
  border-bottom-color: ${(props: ThemeProps) => props.theme.colors.border};
`;

const Tab = styled(TouchableOpacity)<{ active: boolean }>`
  padding: 12px 20px;
  border-bottom-width: 2px;
  border-bottom-color: ${(props: any) => props.active ? props.theme.colors.primary : 'transparent'};
`;

const TabText = styled(ThemedText)<{ active: boolean }>`
  font-size: 16px;
  font-weight: ${(props: any) => props.active ? '700' : '400'};
  color: ${(props: any) => props.active ? props.theme.colors.primary : props.theme.colors.text};
`;

const ModalContainer = styled(ThemedView)`
  background-color: ${(props: ThemeProps) => props.theme.colors.background};
  padding: 24px;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
`;

const ModalTitle = styled(ThemedText)`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  text-align: center;
`;

const StyledInput = styled(TextInput)`
  border-width: 1px;
  border-color: ${(props: ThemeProps) => props.theme.colors.border};
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  margin-bottom: 20px;
  color: ${(props: ThemeProps) => props.theme.colors.text};
  background-color: ${(props: ThemeProps) => props.theme.colors.card};
`;

const ButtonsRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const ModalButton = styled(TouchableOpacity)`
  padding: 12px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  flex: 1;
  margin: 0 5px;
`;

const HistoryItem = styled(ThemedView)`
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 10px;
  background-color: ${(props: ThemeProps) => props.theme.colors.card};
  elevation: 2;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
`;

export default function KhataScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const action = params.action as string | undefined;
  
  const router = useRouter();
  const { getKhata, addExpense, addAmount } = useKhata();
  const [khata, setKhata] = useState(getKhata(id));
  const [activeTab, setActiveTab] = useState<'expenses' | 'history'>(
    action === 'history' ? 'history' : 'expenses'
  );
  const [showAddAmountModal, setShowAddAmountModal] = useState(action === 'add-amount');
  const [amountToAdd, setAmountToAdd] = useState('');
  const [description, setDescription] = useState('Added amount');

  useEffect(() => {
    // Re-fetch the khata when the screen comes into focus
    setKhata(getKhata(id));
  }, [id, getKhata]);

  useEffect(() => {
    if (action === 'add-amount') {
      setShowAddAmountModal(true);
    } else if (action === 'history') {
      setActiveTab('history');
    }
  }, [action]);

  if (!khata) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>Khata not found</ThemedText>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const handleAddExpense = () => {
    router.push({
      pathname: '/add-expense/[id]',
      params: { id: khata.id }
    });
  };

  const handleAddAmount = () => {
    setShowAddAmountModal(true);
  };

  const handleAddAmountSubmit = async () => {
    if (!amountToAdd || parseFloat(amountToAdd) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const amount = parseFloat(amountToAdd);
    
    try {
      await addAmount(khata.id, amount, description);
      
      // Refresh khata data
      setKhata(getKhata(khata.id));
      
      // Reset form and close modal
      setAmountToAdd('');
      setDescription('Added amount');
      setShowAddAmountModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add amount');
    }
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <ExpenseItem>
      <ExpenseHeader>
        <ThemedText style={styles.expenseSource}>{item.source}</ThemedText>
        <ExpenseAmount style={styles.expenseAmount}>-₹{item.amount.toFixed(2)}</ExpenseAmount>
      </ExpenseHeader>
      <ThemedText style={styles.expenseDate}>{item.date}</ThemedText>
    </ExpenseItem>
  );

  const renderHistoryItem = ({ item }: { item: Transaction }) => (
    <HistoryItem>
      <ExpenseHeader>
        <ThemedText style={styles.expenseSource}>
          {item.description}
        </ThemedText>
        <ExpenseAmount style={item.type === 'EXPENSE' ? styles.expenseAmount : styles.addAmount}>
          {item.type === 'EXPENSE' ? '-' : '+'} ₹{item.amount.toFixed(2)}
        </ExpenseAmount>
      </ExpenseHeader>
      <ThemedText style={styles.expenseDate}>{item.date}</ThemedText>
      <ThemedText style={styles.balanceText}>Balance: ₹{item.balanceAfter.toFixed(2)}</ThemedText>
    </HistoryItem>
  );

  const renderEmptyExpenses = () => (
    <ThemedView style={styles.emptyContainer}>
      <FontAwesome name="money" size={48} color="#ccc" style={styles.emptyIcon} />
      <ThemedText style={styles.emptyText}>No Expenses Yet</ThemedText>
      <ThemedText style={styles.emptySubtext}>
        Tap the "Add Expense" button to record your first expense
      </ThemedText>
    </ThemedView>
  );

  const renderEmptyHistory = () => (
    <ThemedView style={styles.emptyContainer}>
      <FontAwesome name="history" size={48} color="#ccc" style={styles.emptyIcon} />
      <ThemedText style={styles.emptyText}>No Transaction History</ThemedText>
      <ThemedText style={styles.emptySubtext}>
        Transaction history will appear here as you add amounts and expenses
      </ThemedText>
    </ThemedView>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          title: khata.name,
          headerBackTitle: 'Back'
        }}
      />
      <ThemedView style={styles.container}>
        <Card>
          <ThemedText style={styles.cardLabel}>Total Amount</ThemedText>
          <ThemedText style={styles.totalAmount}>₹{khata.totalAmount.toFixed(2)}</ThemedText>
          <ThemedText style={styles.createdOn}>Created on {khata.date}</ThemedText>
        </Card>

        <TabsContainer>
          <Tab 
            active={activeTab === 'expenses'} 
            onPress={() => setActiveTab('expenses')}
          >
            <TabText active={activeTab === 'expenses'}>Expenses</TabText>
          </Tab>
          <Tab 
            active={activeTab === 'history'} 
            onPress={() => setActiveTab('history')}
          >
            <TabText active={activeTab === 'history'}>History</TabText>
          </Tab>
        </TabsContainer>

        {activeTab === 'expenses' ? (
          <>
            <ThemedView style={styles.expensesHeader}>
              <ThemedText style={styles.expensesTitle}>Expenses</ThemedText>
              <ThemedText style={styles.expensesCount}>
                {khata.expenses.length} {khata.expenses.length === 1 ? 'expense' : 'expenses'}
              </ThemedText>
            </ThemedView>

            <FlatList
              data={khata.expenses}
              keyExtractor={(item) => item.id}
              renderItem={renderExpenseItem}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderEmptyExpenses}
            />
          </>
        ) : (
          <FlatList
            data={khata.transactions}
            keyExtractor={(item) => item.id}
            renderItem={renderHistoryItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyHistory}
          />
        )}

        <View style={styles.fabContainer}>
          <TouchableOpacity style={[styles.fab, styles.fabLeft]} onPress={handleAddAmount}>
            <FontAwesome name="plus" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.fab} onPress={handleAddExpense}>
            <FontAwesome name="minus" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Using React Native's built-in Modal */}
        <Modal
          visible={showAddAmountModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAddAmountModal(false)}
        >
          <View style={styles.modalOverlay}>
            <ModalContainer>
              <ModalTitle>Add Amount</ModalTitle>
              <StyledInput
                placeholder="Enter amount"
                keyboardType="numeric"
                value={amountToAdd}
                onChangeText={(text: string) => setAmountToAdd(text.replace(/[^0-9.]/g, ''))}
                placeholderTextColor="#999"
              />
              <StyledInput
                placeholder="Description (optional)"
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="#999"
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowAddAmountModal(false)}
                >
                  <ThemedText style={{ fontWeight: '600', color: '#444444' }}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={handleAddAmountSubmit}
                >
                  <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Add</ThemedText>
                </TouchableOpacity>
              </View>
            </ModalContainer>
          </View>
        </Modal>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  cardLabel: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
    textAlign: 'center',
  },
  createdOn: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  expensesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  expensesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  expensesCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 80, // Space for FAB
  },
  expenseSource: {
    fontSize: 16,
    fontWeight: '600',
  },
  expenseDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    opacity: 0.7,
    maxWidth: '80%',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A80F0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabLeft: {
    backgroundColor: '#22A45D',
    marginRight: 16,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 12,
    backgroundColor: '#4A80F0',
    borderRadius: 8,
    alignSelf: 'center',
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  expenseAmount: {
    color: '#e74c3c',
  },
  addAmount: {
    color: '#22A45D',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 8,
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  addButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center', 
    justifyContent: 'center',
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#22A45D',
  },
}); 