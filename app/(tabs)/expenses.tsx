import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppContext } from '@/contexts/AppContext';
import { useExpense } from '@/contexts/ExpenseContext';
import AddExpenseModal from '@/components/AddExpenseModal';
import CustomAlert from '@/app/components/CustomAlert';
import {
  MonthSection,
  MonthHeader,
  ExpenseItem,
  ExpenseHeader,
  ExpenseAmount
} from '@/components/ExpenseListComponents';

export default function ExpensesScreen() {
  const { t, isDark } = useAppContext();
  const { expenses, loading, addExpense, deleteExpense, totalExpense, monthlyTotals } = useExpense();
  const [modalVisible, setModalVisible] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'info' as const });
  const [showAllData, setShowAllData] = useState(false);

  const toggleMonth = (monthYear: string) => {
    setExpandedMonths(prev =>
      prev.includes(monthYear)
        ? prev.filter(m => m !== monthYear)
        : [...prev, monthYear]
    );
  };

  const groupExpensesByMonth = () => {
    const grouped = expenses.reduce((acc, expense) => {
      const date = new Date(expense.date);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(expense);
      return acc;
    }, {} as Record<string, typeof expenses>);

    // Sort by date (newest first)
    const sortedEntries = Object.entries(grouped).sort((a, b) => {
      const dateA = new Date(a[1][0].date);
      const dateB = new Date(b[1][0].date);
      return dateB.getTime() - dateA.getTime();
    });

    // Always show only the latest 6 months by default
    const latestSixMonths = sortedEntries.slice(0, 6);
    const olderMonths = sortedEntries.slice(6);

    // If showing all data, append older months after the latest 6
    if (showAllData) {
      return [...latestSixMonths, ...olderMonths];
    }

    return latestSixMonths;
  };

  // Check if there are more than 6 months of data
  const hasOlderData = () => {
    const grouped = expenses.reduce((acc, expense) => {
      const date = new Date(expense.date);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(expense);
      return acc;
    }, {} as Record<string, typeof expenses>);

    return Object.keys(grouped).length > 6;
  };

  const renderExpenseItem = (expense: (typeof expenses)[0]) => (
    <ExpenseItem key={expense.id}>
      <ExpenseHeader>
        <ThemedText>{expense.description}</ThemedText>
        <ExpenseAmount>${expense.amount.toFixed(2)}</ExpenseAmount>
      </ExpenseHeader>
      <View style={styles.expenseFooter}>
        <ThemedText style={{ opacity: 0.7 }}>
          {new Date(expense.date).toLocaleDateString()}
        </ThemedText>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteExpense(expense.id)}
        >
          <FontAwesome name="trash" size={18} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </ExpenseItem>
  );

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense(expenseId);
      showAlert(t.success, t.itemDeletedSuccess, 'success');
    } catch (error) {
      showAlert(t.error, t.failedToDeleteItem, 'error');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>{t.expensesTitle}</ThemedText>
        <ThemedText style={styles.subtitle}>{t.expensesSubtitle}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.totalExpenseContainer}>
        <ThemedText style={styles.totalExpenseLabel}>Total Expenses</ThemedText>
        <ThemedText style={styles.totalExpenseAmount}>${totalExpense.toFixed(2)}</ThemedText>
      </ThemedView>

      {loading ? (
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>{t.loading}</ThemedText>
        </ThemedView>
      ) : expenses.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <FontAwesome name="money" size={64} color={isDark ? "#444" : "#ccc"} style={styles.emptyIcon} />
          <ThemedText style={styles.emptyText}>{t.noExpensesYet}</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            {t.tapToAddExpense}
          </ThemedText>
        </ThemedView>
      ) : (
        <>
          <FlatList
            data={groupExpensesByMonth()}
            keyExtractor={([monthYear]) => monthYear}
            renderItem={({ item: [monthYear, monthExpenses] }) => (
              <MonthSection>
                <TouchableOpacity onPress={() => toggleMonth(monthYear)}>
                  <MonthHeader>
                    <View style={styles.monthHeaderLeft}>
                      <FontAwesome 
                        name={expandedMonths.includes(monthYear) ? 'chevron-down' : 'chevron-right'} 
                        size={16} 
                        color={isDark ? '#fff' : '#000'} 
                        style={styles.chevron}
                      />
                      <ThemedText style={styles.monthTitle}>{monthYear}</ThemedText>
                    </View>
                    <ThemedText style={styles.monthTotal}>
                      ${monthlyTotals[monthYear].toFixed(2)}
                    </ThemedText>
                  </MonthHeader>
                </TouchableOpacity>
                {expandedMonths.includes(monthYear) && monthExpenses.map(renderExpenseItem)}
              </MonthSection>
            )}
            contentContainerStyle={styles.listContainer}
            ListFooterComponent={
              hasOlderData() && !showAllData ? (
                <TouchableOpacity 
                  style={styles.loadMoreButton}
                  onPress={() => setShowAllData(true)}
                >
                  <ThemedText style={styles.loadMoreText}>{t.loadPreviousData || 'Load Previous Data'}</ThemedText>
                </TouchableOpacity>
              ) : null
            }
          />
        </>
      )}

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setModalVisible(true)}
      >
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity>

      <AddExpenseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={addExpense}
      />
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  totalExpenseContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#4A80F0',
  },
  totalExpenseLabel: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  totalExpenseAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
  },
  monthHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  monthTotal: {
    fontSize: 16,
    opacity: 0.8,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    opacity: 0.7,
    textAlign: 'center',
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
    fontSize: 20,
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
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: 20,
  },
  loadMoreButton: {
    backgroundColor: '#4A80F0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
    marginHorizontal: 24,
  },
  loadMoreText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});