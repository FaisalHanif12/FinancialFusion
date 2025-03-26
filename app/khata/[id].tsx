import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useKhata, Expense } from '@/context/KhataContext';
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

export default function KhataScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getKhata } = useKhata();
  const [khata, setKhata] = useState(getKhata(id as string));

  useEffect(() => {
    // Re-fetch the khata when the screen comes into focus
    setKhata(getKhata(id as string));
  }, [id, getKhata]);

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
    // Use a type-safe path
    router.push({
      pathname: '/add-expense/[id]',
      params: { id: khata.id }
    });
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <ExpenseItem>
      <ExpenseHeader>
        <ThemedText style={styles.expenseSource}>{item.source}</ThemedText>
        <ExpenseAmount>₹{item.amount.toFixed(2)}</ExpenseAmount>
      </ExpenseHeader>
      <ThemedText style={styles.expenseDate}>{item.date}</ThemedText>
    </ExpenseItem>
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

        <TouchableOpacity style={styles.fab} onPress={handleAddExpense}>
          <FontAwesome name="plus" size={24} color="white" />
        </TouchableOpacity>
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
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  createdOn: {
    fontSize: 14,
    opacity: 0.7,
  },
  expensesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
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
}); 