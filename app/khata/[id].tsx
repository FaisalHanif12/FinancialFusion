import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, Modal, TextInput, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useKhata, Expense, Transaction } from '@/context/KhataContext';
import styled from 'styled-components/native';
import CustomAlert from '../components/CustomAlert';
import { useAppContext } from '@/contexts/AppContext';

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
  position: relative;
`;

const ExpenseItem = styled(ThemedView)`
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 10px;
  background-color: transparent;
  border-bottom-width: 1px;
  border-bottom-color: ${(props: ThemeProps) => props.theme.colors.border};
`;

const ExpenseHeader = styled(ThemedView)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ExpenseAmount = styled(ThemedText)`
  font-size: 15px;
  font-weight: bold;
  text-shadow: 0px 0px 1px rgba(0, 0, 0, 0.2);
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
  background-color: transparent;
  border-bottom-width: 1px;
  border-bottom-color: ${(props: ThemeProps) => props.theme.colors.border};
`;

const ActionIcon = styled(TouchableOpacity)`
  position: absolute;
  padding: 8px;
  justify-content: center;
  align-items: center;
`;

const AddAmountIcon = styled(ActionIcon)`
  top: 16px;
  right: 16px;
`;

const ViewHistoryIcon = styled(ActionIcon)`
  top: 16px;
  left: 16px;
`;

const AmountText = styled(ThemedText)`
  font-size: 20px;
  font-weight: 700;
  color: ${(props: any) => props.negative ? '#e74c3c' : props.theme.colors.primary};
  margin: 12px 0;
  padding: 4px 8px;
  text-align: center;
  background-color: transparent;
`;

const DateContainer = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  border-width: 1px;
  border-color: ${(props: ThemeProps) => props.theme.colors.border};
  border-radius: 8px;
  background-color: ${(props: ThemeProps) => props.theme.colors.card};
  elevation: 2;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
`;

const DateText = styled(ThemedText)`
  font-size: 16px;
  margin-left: 8px;
`;

// Create styled components for the monthly section
const MonthSection = styled(ThemedView)`
  margin-bottom: 16px;
`;

const MonthHeader = styled(ThemedView)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: ${(props: ThemeProps) => props.theme.colors.card};
  border-radius: 10px;
  margin-bottom: 8px;
  elevation: 2;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
`;

const MonthTitle = styled(ThemedText)`
  font-size: 16px;
  font-weight: 700;
  color: ${(props: ThemeProps) => props.theme.colors.primary};
`;

const LoadMoreButton = styled(TouchableOpacity)`
  margin: 16px auto;
  padding: 12px 24px;
  background-color: ${(props: ThemeProps) => props.theme.colors.card};
  border-radius: 25px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  elevation: 2;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
`;

const LoadMoreText = styled(ThemedText)`
  font-size: 14px;
  font-weight: 600;
  margin-left: 8px;
`;

// Define interfaces for grouped data
interface ExpenseGroup {
  id: string;
  title: string;
  data: Expense[];
}

interface TransactionGroup {
  id: string;
  title: string;
  data: Transaction[];
}

export default function KhataScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = (params.id as string) || '';
  const action = params.action as string | undefined;
  const { khatas, loading, getKhata, addAmount, deleteExpense, deleteTransaction } = useKhata();
  const { t, isUrdu } = useAppContext();
  
  const [khata, setKhata] = useState(getKhata(id));
  const [activeTab, setActiveTab] = useState<'expenses' | 'history'>(
    action === 'history' ? 'history' : 'expenses'
  );
  const [showAddAmountModal, setShowAddAmountModal] = useState(action === 'add-amount');
  const [amountToAdd, setAmountToAdd] = useState('');
  const [amountDescription, setAmountDescription] = useState('');
  
  // State for custom alerts
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  
  // Create a UTC date for today to avoid timezone issues
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  
  // State for date picker
  const [selectedDate, setSelectedDate] = useState(todayUTC);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  
  // Format the selected date
  const formattedDate = (() => {
    // Create a date object and adjust for timezone
    const date = new Date(selectedDate);
    // Use UTC methods to avoid timezone issues
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();
  
  // Added to handle month selection
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Get days in the selected month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get the day of week for the first day of the month
  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Generate month names
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);
    
    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };
  
  // Check if a day is the selected date
  const isSelectedDate = (day: number) => {
    if (!day) return false;
    
    const selectedDay = selectedDate.getDate();
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();
    
    return day === selectedDay && currentMonth === selectedMonth && currentYear === selectedYear;
  };
  
  // Check if a day is today
  const isToday = (day: number) => {
    if (!day) return false;
    
    const today = new Date();
    return day === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear();
  };
  
  // Handle previous month
  const goPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  // Handle next month
  const goNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // Select a date
  const selectDate = (day: number) => {
    if (!day) return;
    
    // Create a date that preserves the day correctly
    const newDate = new Date(Date.UTC(currentYear, currentMonth, day));
    setSelectedDate(newDate);
  };

  // When component mounts, set current month/year based on selected date
  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(selectedDate.getMonth());
      setCurrentYear(selectedDate.getFullYear());
    }
  }, []);

  // Use useFocusEffect to refresh khata data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Refresh khata data when the screen is focused
      const updatedKhata = getKhata(id);
      if (updatedKhata) {
        setKhata(updatedKhata);
      }
      return () => {
        // Clean up if needed
      };
    }, [id, getKhata])
  );

  // Remove the problematic useEffect that used router.addEventListener
  useEffect(() => {
    if (action === 'add-amount') {
      setShowAddAmountModal(true);
    } else if (action === 'history') {
      setActiveTab('history');
    }
  }, [action]);

  // Add states for delete confirmation
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'expense' | 'transaction'} | null>(null);

  // Pagination states
  const [visibleMonths, setVisibleMonths] = useState(6);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // State to track expanded month sections (empty by default - all collapsed)
  const [expandedMonths, setExpandedMonths] = useState<{[key: string]: boolean}>({});

  if (!khata) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={[styles.errorText, isUrdu && styles.rtlText]}>{t.khataNotFound}</ThemedText>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.backButtonText}>{t.back}</ThemedText>
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  // Show custom alert
  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleAddAmountSubmit = async () => {
    if (!amountToAdd || parseFloat(amountToAdd) <= 0) {
      showAlert(t.error, t.enterValidAmount, 'error');
      return;
    }

    const amount = parseFloat(amountToAdd);
    const description = amountDescription.trim() ? amountDescription.trim() : `${khata.name}`;
    
    try {
      // Use the formatted date from the date picker
      await addAmount(khata.id, amount, description, formattedDate);
      
      // Force refresh khata data immediately to ensure UI updates
      const updatedKhata = getKhata(khata.id);
      if (updatedKhata) {
        // This ensures the state update trigger a re-render
        setKhata({...updatedKhata});
      }
      
      // Reset form and close modal
      setAmountToAdd('');
      setAmountDescription('');
      setSelectedDate(new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()))); // Reset date to today with UTC
      setShowAddAmountModal(false);

      // Show success message
      showAlert(t.success, t.amountAddedSuccess, 'success');
    } catch (error) {
      showAlert(t.error, t.failedToAddAmount, 'error');
    }
  };

  // Add function to handle delete confirmation
  const handleDeleteItem = (id: string, type: 'expense' | 'transaction') => {
    setItemToDelete({ id, type });
    setShowDeleteConfirmModal(true);
  };

  // Add function to confirm deletion
  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'expense') {
        await deleteExpense(khata.id, itemToDelete.id);
      } else {
        await deleteTransaction(khata.id, itemToDelete.id);
      }

      // Refresh khata data with spread operator to force UI update
      const updatedKhata = getKhata(khata.id);
      if (updatedKhata) {
        setKhata({...updatedKhata});
      }
      
      // Show success message
      showAlert(t.success, t.itemDeletedSuccess, 'success');
    } catch (error) {
      showAlert(t.error, t.failedToDeleteItem, 'error');
    }

    // Reset and close confirmation modal
    setItemToDelete(null);
    setShowDeleteConfirmModal(false);
  };

  // Update the renderExpenseItem function to include a delete icon
  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <ExpenseItem>
      <ExpenseHeader>
        <ThemedText style={[styles.expenseSource, isUrdu && styles.rtlText]} colorType="text">{item.source}</ThemedText>
        <ExpenseAmount style={styles.expenseAmount}>-₹{item.amount.toFixed(0)}</ExpenseAmount>
      </ExpenseHeader>
      <ThemedText style={[styles.expenseDate, isUrdu && styles.rtlText]}>{item.date}</ThemedText>
      
      {/* Delete icon */}
      <TouchableOpacity 
        style={styles.deleteIcon}
        onPress={() => handleDeleteItem(item.id, 'expense')}
      >
        <FontAwesome name="trash" size={18} color="#e74c3c" />
      </TouchableOpacity>
    </ExpenseItem>
  );

  // Update the renderHistoryItem function to include a delete icon
  const renderHistoryItem = ({ item }: { item: Transaction }) => (
    <HistoryItem>
      <ExpenseHeader>
        <ThemedText style={[styles.expenseSource, isUrdu && styles.rtlText]} colorType="text">
          {item.description}
        </ThemedText>
        <ExpenseAmount style={item.type === 'EXPENSE' ? styles.expenseAmount : styles.addAmount}>
          {item.type === 'EXPENSE' ? '-' : '+'} ₹{item.amount.toFixed(0)}
        </ExpenseAmount>
      </ExpenseHeader>
      <ThemedText style={[styles.expenseDate, isUrdu && styles.rtlText]}>{item.date}</ThemedText>
      <ThemedText style={[styles.balanceText, isUrdu && styles.rtlText]}>{t.availableBalance}: ₹{item.balanceAfter.toFixed(0)}</ThemedText>
       
      {/* Delete icon */}
      <TouchableOpacity 
        style={styles.deleteIcon}
        onPress={() => handleDeleteItem(item.id, 'transaction')}
      >
        <FontAwesome name="trash" size={18} color="#e74c3c" />
      </TouchableOpacity>
    </HistoryItem>
  );

  const renderEmptyExpenses = () => (
    <ThemedView style={styles.emptyContainer}>
      <FontAwesome name="money" size={48} color="#ccc" style={styles.emptyIcon} />
      <ThemedText style={[styles.emptyText, isUrdu && styles.rtlText]}>{t.noExpensesYet}</ThemedText>
      <ThemedText style={[styles.emptySubtext, isUrdu && styles.rtlText]}>
        {t.tapToAddExpense}
      </ThemedText>
    </ThemedView>
  );

  const renderEmptyHistory = () => (
    <ThemedView style={styles.emptyContainer}>
      <FontAwesome name="history" size={48} color="#ccc" style={styles.emptyIcon} />
      <ThemedText style={[styles.emptyText, isUrdu && styles.rtlText]}>{t.noTransactionHistory || "No Transaction History"}</ThemedText>
      <ThemedText style={[styles.emptySubtext, isUrdu && styles.rtlText]}>
        {t.transactionHistoryText || "Transaction history will appear here as you add amounts and expenses"}
      </ThemedText>
    </ThemedView>
  );

  // Group items by month with proper typing
  const groupExpensesByMonth = (expenses: Expense[]): ExpenseGroup[] => {
    const groups: { [key: string]: Expense[] } = {};
    
    // Sort items by date in descending order (newest first)
    const sortedItems = [...expenses].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    sortedItems.forEach(item => {
      // Extract year and month from date string (format: YYYY-MM-DD)
      const [year, month] = item.date.split('-');
      const monthKey = `${year}-${month}`;
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      
      groups[monthKey].push(item);
    });
    
    // Convert to array of month groups
    const monthGroups = Object.keys(groups).map(key => {
      const [year, month] = key.split('-');
      const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' });
      
      return {
        id: key,
        title: `${monthName} ${year}`,
        data: groups[key]
      };
    });
    
    // Sort by date (newest first)
    monthGroups.sort((a, b) => {
      const [yearA, monthA] = a.id.split('-');
      const [yearB, monthB] = b.id.split('-');
      
      if (yearA !== yearB) {
        return parseInt(yearB) - parseInt(yearA);
      }
      
      return parseInt(monthB) - parseInt(monthA);
    });
    
    return monthGroups;
  };

  const groupTransactionsByMonth = (transactions: Transaction[]): TransactionGroup[] => {
    const groups: { [key: string]: Transaction[] } = {};
    
    // Sort items by date in descending order (newest first)
    const sortedItems = [...transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    sortedItems.forEach(item => {
      // Extract year and month from date string (format: YYYY-MM-DD)
      const [year, month] = item.date.split('-');
      const monthKey = `${year}-${month}`;
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      
      groups[monthKey].push(item);
    });
    
    // Convert to array of month groups
    const monthGroups = Object.keys(groups).map(key => {
      const [year, month] = key.split('-');
      const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' });
      
      return {
        id: key,
        title: `${monthName} ${year}`,
        data: groups[key]
      };
    });
    
    // Sort by date (newest first)
    monthGroups.sort((a, b) => {
      const [yearA, monthA] = a.id.split('-');
      const [yearB, monthB] = b.id.split('-');
      
      if (yearA !== yearB) {
        return parseInt(yearB) - parseInt(yearA);
      }
      
      return parseInt(monthB) - parseInt(monthA);
    });
    
    return monthGroups;
  };
  
  // Get expenses grouped by month with pagination
  const getGroupedExpenses = () => {
    if (!khata || !khata.expenses || khata.expenses.length === 0) {
      return [];
    }
    
    const monthGroups = groupExpensesByMonth(khata.expenses);
    
    // Return only the number of months based on pagination
    return monthGroups.slice(0, visibleMonths);
  };
  
  // Get history grouped by month with pagination
  const getGroupedHistory = () => {
    if (!khata || !khata.transactions || khata.transactions.length === 0) {
      return [];
    }
    
    const monthGroups = groupTransactionsByMonth(khata.transactions);
    
    // Return only the number of months based on pagination
    return monthGroups.slice(0, visibleMonths);
  };
  
  // Check if there are more months to load
  const hasMoreMonths = () => {
    if (!khata) return false;
    
    const totalMonths = activeTab === 'expenses' 
      ? groupExpensesByMonth(khata.expenses).length 
      : groupTransactionsByMonth(khata.transactions).length;
      
    return totalMonths > visibleMonths;
  };
  
  // Load more months
  const handleLoadMore = () => {
    setLoadingMore(true);
    
    // Add a small delay to show loading state
    setTimeout(() => {
      setVisibleMonths(prev => prev + 6);
      setLoadingMore(false);
    }, 500);
  };

  // Render a monthly section of expenses
  const renderMonthlyExpenseSection = ({ item }: { item: ExpenseGroup }) => {
    const isExpanded = expandedMonths[item.id] || false;
    
    return (
      <MonthSection>
        <TouchableOpacity onPress={() => toggleMonthExpansion(item.id)}>
          <MonthHeader>
            <View style={styles.monthHeaderLeft}>
              <FontAwesome 
                name={isExpanded ? "chevron-down" : "chevron-right"} 
                size={14} 
                color="#666" 
                style={styles.expandIcon}
              />
              <MonthTitle style={isUrdu && styles.rtlText}>{item.title}</MonthTitle>
            </View>
            <ThemedText style={[styles.monthTotal, isUrdu && styles.rtlText]}>
              {t.amount}: ₹{item.data.reduce((total, expense) => total + expense.amount, 0).toFixed(0)}
            </ThemedText>
          </MonthHeader>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.expandedContent}>
            {item.data.map(expense => (
              <ExpenseItem key={expense.id}>
                <ExpenseHeader>
                  <ThemedText style={[styles.expenseSource, isUrdu && styles.rtlText]} colorType="text">{expense.source}</ThemedText>
                  <ExpenseAmount style={styles.expenseAmount}>-₹{expense.amount.toFixed(0)}</ExpenseAmount>
                </ExpenseHeader>
                <ThemedText style={[styles.expenseDate, isUrdu && styles.rtlText]}>{expense.date}</ThemedText>
                
                {/* Delete icon */}
                <TouchableOpacity 
                  style={styles.deleteIcon}
                  onPress={() => handleDeleteItem(expense.id, 'expense')}
                >
                  <FontAwesome name="trash" size={18} color="#e74c3c" />
                </TouchableOpacity>
              </ExpenseItem>
            ))}
          </View>
        )}
      </MonthSection>
    );
  };
  
  // Render a monthly section of transactions
  const renderMonthlyTransactionSection = ({ item }: { item: TransactionGroup }) => {
    const isExpanded = expandedMonths[item.id] || false;
    
    return (
      <MonthSection>
        <TouchableOpacity onPress={() => toggleMonthExpansion(item.id)}>
          <MonthHeader>
            <View style={styles.monthHeaderLeft}>
              <FontAwesome 
                name={isExpanded ? "chevron-down" : "chevron-right"} 
                size={14} 
                color="#666" 
                style={styles.expandIcon}
              />
              <MonthTitle style={isUrdu && styles.rtlText}>{item.title}</MonthTitle>
            </View>
            <ThemedText style={[styles.monthTotal, isUrdu && styles.rtlText]}>
              {/* Show net change for the month */}
              {t.net || "Net"}: {getMonthlyNetChange(item.data)}
            </ThemedText>
          </MonthHeader>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.expandedContent}>
            {item.data.map(transaction => (
              <HistoryItem key={transaction.id}>
                <ExpenseHeader>
                  <ThemedText style={[styles.expenseSource, isUrdu && styles.rtlText]} colorType="text">
                    {transaction.description}
                  </ThemedText>
                  <ExpenseAmount style={transaction.type === 'EXPENSE' ? styles.expenseAmount : styles.addAmount}>
                    {transaction.type === 'EXPENSE' ? '-' : '+'} ₹{transaction.amount.toFixed(0)}
                  </ExpenseAmount>
                </ExpenseHeader>
                <ThemedText style={[styles.expenseDate, isUrdu && styles.rtlText]}>{transaction.date}</ThemedText>
                <ThemedText style={[styles.balanceText, isUrdu && styles.rtlText]}>{t.availableBalance}: ₹{transaction.balanceAfter.toFixed(0)}</ThemedText>
                
                {/* Delete icon */}
                <TouchableOpacity 
                  style={styles.deleteIcon}
                  onPress={() => handleDeleteItem(transaction.id, 'transaction')}
                >
                  <FontAwesome name="trash" size={18} color="#e74c3c" />
                </TouchableOpacity>
              </HistoryItem>
            ))}
          </View>
        )}
      </MonthSection>
    );
  };
  
  // Calculate net change for a month
  const getMonthlyNetChange = (transactions: Transaction[]) => {
    const netChange = transactions.reduce((total, transaction) => {
      if (transaction.type === 'ADD_AMOUNT') {
        return total + transaction.amount;
      } else {
        return total - transaction.amount;
      }
    }, 0);
    
    const prefix = netChange >= 0 ? '+' : '';
    return `${prefix}₹${netChange.toFixed(0)}`;
  };
  
  // Render the load more button
  const renderLoadMoreButton = () => {
    if (!hasMoreMonths() || loadingMore) {
      return null;
    }
    
    return (
      <LoadMoreButton onPress={handleLoadMore}>
        <FontAwesome name="arrow-down" size={14} color="#4A80F0" />
        <LoadMoreText style={isUrdu && styles.rtlText}>{t.loadMore}</LoadMoreText>
      </LoadMoreButton>
    );
  };
  
  // Render loading indicator
  const renderLoadingIndicator = () => {
    if (!loadingMore) {
      return null;
    }
    
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText style={[styles.loadingText, isUrdu && styles.rtlText]}>{t.loading}</ThemedText>
      </ThemedView>
    );
  };

  // Toggle expansion of a month section
  const toggleMonthExpansion = (monthId: string) => {
    setExpandedMonths(prev => ({
      ...prev,
      [monthId]: !prev[monthId]
    }));
  };

  // Function to toggle "expand all" months
  const toggleExpandAll = () => {
    if (Object.keys(expandedMonths).length > 0) {
      // If any are expanded, collapse all
      setExpandedMonths({});
    } else {
      // Expand all visible months
      const months = activeTab === 'expenses' 
        ? getGroupedExpenses()
        : getGroupedHistory();
      
      const allExpanded = months.reduce((acc, month) => {
        acc[month.id] = true;
        return acc;
      }, {} as {[key: string]: boolean});
      
      setExpandedMonths(allExpanded);
    }
  };
  
  // Check if any months are expanded
  const hasExpandedMonths = () => {
    return Object.keys(expandedMonths).length > 0;
  };

  // Render the expand/collapse all button
  const renderExpandCollapseButton = () => {
    const anyExpanded = hasExpandedMonths();
    
    return (
      <TouchableOpacity 
        style={styles.expandAllButton}
        onPress={toggleExpandAll}
      >
        <FontAwesome 
          name={anyExpanded ? "compress" : "expand"} 
          size={14} 
          color="#4A80F0" 
        />
        <ThemedText style={styles.expandAllText}>
          {anyExpanded ? t.collapseAll : t.expandAll}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  // Add these styles to properly format text in Urdu mode
  const getTextStyle = (baseStyle?: any) => {
    return [
      baseStyle,
      isUrdu && styles.rtlText
    ];
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: khata.name,
          headerBackTitle: t.back
        }}
      />
      <ThemedView style={[styles.container, isUrdu && styles.rtlContainer]}>
        <Card>
          <AddAmountIcon onPress={handleAddAmount}>
             <FontAwesome name="plus-circle" size={20} color="#22A45D" />
          </AddAmountIcon>
          <ThemedText style={styles.cardLabel}>{t.amount}</ThemedText>
          <AmountText negative={khata.totalAmount < 0}>
            {khata.totalAmount < 0 ? '-' : ''}₹{Math.abs(khata.totalAmount).toFixed(0)}
          </AmountText>
          <ThemedText style={styles.createdOn}>{t.created} {khata.date}</ThemedText>
        </Card>

        <TabsContainer>
          <Tab 
            active={activeTab === 'expenses'} 
            onPress={() => setActiveTab('expenses')}
          >
            <TabText active={activeTab === 'expenses'}>{t.expenses}</TabText>
          </Tab>
          <Tab 
            active={activeTab === 'history'} 
            onPress={() => setActiveTab('history')}
          >
            <TabText active={activeTab === 'history'}>{t.history}</TabText>
          </Tab>
        </TabsContainer>

        {activeTab === 'expenses' ? (
          <>
            {khata.expenses.length > 0 ? (
              <FlatList
                data={getGroupedExpenses()}
                keyExtractor={(item) => item.id}
                renderItem={renderMonthlyExpenseSection}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderExpandCollapseButton}
                ListFooterComponent={
                  <>
                    {renderLoadMoreButton()}
                    {renderLoadingIndicator()}
                  </>
                }
              />
            ) : (
              renderEmptyExpenses()
            )}
          </>
        ) : (
          <>
            {khata.transactions.length > 0 ? (
              <FlatList
                data={getGroupedHistory()}
                keyExtractor={(item) => item.id}
                renderItem={renderMonthlyTransactionSection}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderExpandCollapseButton}
                ListFooterComponent={
                  <>
                    {renderLoadMoreButton()}
                    {renderLoadingIndicator()}
                  </>
                }
              />
            ) : (
              renderEmptyHistory()
            )}
          </>
        )}

        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab} onPress={handleAddExpense}>
            <FontAwesome name="minus" size={20} color="white" />
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
              <ModalTitle style={getTextStyle()}>{t.addedAmount}</ModalTitle>
              <StyledInput
                placeholder={t.enterAmount}
                keyboardType="numeric"
                value={amountToAdd}
                onChangeText={(text: string) => setAmountToAdd(text.replace(/[^0-9.]/g, ''))}
                placeholderTextColor="#999"
                style={isUrdu && styles.rtlText}
              />
              
              {/* Description Input Field */}
              <StyledInput
                placeholder={t.description}
                value={amountDescription}
                onChangeText={setAmountDescription}
                placeholderTextColor="#999"
                style={isUrdu && styles.rtlText}
              />
              
              {/* Date Picker UI */}
              <DateContainer 
                activeOpacity={0.7} 
                onPress={() => setShowDatePickerModal(true)}
              >
                <FontAwesome name="calendar" size={18} color="#666" />
                <DateText style={isUrdu && styles.rtlText}>{t.date}: {formattedDate} ({t.tapToChange})</DateText>
              </DateContainer>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowAddAmountModal(false)}
                >
                  <ThemedText style={[{ fontWeight: '600', color: '#444444' }, isUrdu && styles.rtlText]}>{t.cancel}</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={handleAddAmountSubmit}
                >
                  <ThemedText style={[{ color: 'white', fontWeight: 'bold' }, isUrdu && styles.rtlText]}>{t.add}</ThemedText>
                </TouchableOpacity>
              </View>
            </ModalContainer>
          </View>
        </Modal>
        
        {/* Custom Date Picker Modal */}
        <Modal
          visible={showDatePickerModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDatePickerModal(false)}
        >
          <View style={styles.datePickerModalOverlay}>
            <View style={styles.datePickerModalContent}>
              <View style={styles.datePickerHeader}>
                <ThemedText style={getTextStyle(styles.datePickerTitle)}>{t.selectDate}</ThemedText>
                <TouchableOpacity onPress={() => setShowDatePickerModal(false)}>
                  <FontAwesome name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              {/* Custom Calendar */}
              <View style={styles.calendarContainer}>
                {/* Month and Year Navigation */}
                <View style={styles.calendarHeader}>
                  <TouchableOpacity onPress={goPrevMonth} style={styles.calendarNavButton}>
                    <FontAwesome name="chevron-left" size={20} color="#444" />
                  </TouchableOpacity>
                  <ThemedText style={styles.calendarTitle}>
                    {monthNames[currentMonth]} {currentYear}
                  </ThemedText>
                  <TouchableOpacity 
                    onPress={goNextMonth} 
                    style={styles.calendarNavButton}
                    disabled={new Date(currentYear, currentMonth) > new Date()}
                  >
                    <FontAwesome 
                      name="chevron-right" 
                      size={20} 
                      color={new Date(currentYear, currentMonth) > new Date() ? "#ccc" : "#444"} 
                    />
                  </TouchableOpacity>
                </View>
                
                {/* Weekdays */}
                <View style={styles.weekdayLabels}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <ThemedText key={index} style={styles.weekdayLabel}>{day}</ThemedText>
                  ))}
                </View>
                
                {/* Calendar Days */}
                <View style={styles.calendarDays}>
                  {generateCalendarDays().map((day, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={[
                        styles.calendarDay,
                        isSelectedDate(day as number) && styles.selectedDay,
                        isToday(day as number) && styles.todayDay,
                        !day && styles.emptyDay,
                        new Date(currentYear, currentMonth, day as number) > new Date() && styles.disabledDay
                      ]}
                      onPress={() => day && new Date(currentYear, currentMonth, day) <= new Date() && selectDate(day as number)}
                      disabled={!day || new Date(currentYear, currentMonth, day) > new Date()}
                    >
                      {day && (
                        <ThemedText 
                          style={[
                            styles.calendarDayText,
                            isSelectedDate(day) && styles.selectedDayText,
                            isToday(day) && styles.todayDayText,
                            new Date(currentYear, currentMonth, day) > new Date() && styles.disabledDayText
                          ]}
                        >
                          {day}
                        </ThemedText>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.datePickerButtons}>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePickerModal(false)}
                >
                  <ThemedText style={getTextStyle(styles.datePickerButtonText)}>{t.cancel}</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.datePickerButton, styles.datePickerConfirmButton]}
                  onPress={() => setShowDatePickerModal(false)}
                >
                  <ThemedText style={getTextStyle(styles.datePickerConfirmText)}>{t.confirm}</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={showDeleteConfirmModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDeleteConfirmModal(false)}
        >
          <View style={styles.modalOverlay}>
            <ModalContainer>
              <ModalTitle style={getTextStyle()}>{t.confirmDelete}</ModalTitle>
              <ThemedText style={getTextStyle(styles.deleteConfirmText)}>
                {t.deleteConfirmText}
              </ThemedText>
              
              <ButtonsRow>
                <ModalButton 
                  style={styles.cancelButton}
                  onPress={() => setShowDeleteConfirmModal(false)}
                >
                  <ThemedText style={[{ fontWeight: '600', color: '#444444' }, isUrdu && styles.rtlText]}>{t.cancel}</ThemedText>
                </ModalButton>
                <ModalButton 
                  style={styles.deleteButton}
                  onPress={confirmDelete}
                >
                  <ThemedText style={[{ color: 'white', fontWeight: 'bold' }, isUrdu && styles.rtlText]}>{t.delete}</ThemedText>
                </ModalButton>
              </ButtonsRow>
            </ModalContainer>
          </View>
        </Modal>

        {/* Custom Alert */}
        <CustomAlert
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          type={alertType}
          onClose={() => setAlertVisible(false)}
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  rtlContainer: {
    direction: 'rtl',
  },
  rtlText: {
    textAlign: 'right',
    ...(Platform.OS === 'ios' ? { fontFamily: 'Arial' } : { fontFamily: 'sans-serif' }),
    lineHeight: 24,
  },
  cardLabel: {
    fontSize: 14,
    opacity: 0.7,
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
    fontSize: 17,
    fontWeight: '400',
  },
  expenseDate: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '400',
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e74c3c',
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
    fontWeight: 'bold',
  },
  addAmount: {
    color: '#22A45D',
    fontWeight: 'bold',
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
  // Date Picker Modal Styles
  datePickerModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16
  },
  datePickerModalContent: {
    backgroundColor: 'white',
    width: '95%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  datePickerButton: {
    padding: 10,
    marginLeft: 10,
    borderRadius: 6,
  },
  datePickerButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  datePickerConfirmButton: {
    backgroundColor: '#22A45D',
  },
  datePickerConfirmText: {
    color: 'white',
    fontWeight: '600',
  },
  calendar: {
    borderRadius: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 20,
  },
  // Custom Calendar Styles
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  calendarNavButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  weekdayLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    width: 40,
    color: '#555',
  },
  calendarDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    marginBottom: 8,
    borderRadius: 20,
  },
  calendarDayText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  selectedDay: {
    backgroundColor: '#22A45D',
    borderWidth: 0,
  },
  selectedDayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  todayDay: {
    borderWidth: 1,
    borderColor: '#22A45D',
  },
  todayDayText: {
    color: '#22A45D',
    fontWeight: '600',
  },
  emptyDay: {
    width: 40,
    height: 40,
  },
  disabledDay: {
    opacity: 0.3,
  },
  disabledDayText: {
    color: '#999',
  },
  deleteIcon: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    padding: 4,
  },
  deleteConfirmText: {
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 8,
  },
  monthTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  monthHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandIcon: {
    marginRight: 8,
  },
  expandedContent: {
    paddingLeft: 8,
    paddingRight: 8,
    marginTop: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#e0e0e0',
  },
  expandAllButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  expandAllText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 