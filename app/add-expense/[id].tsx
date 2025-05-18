import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, TouchableWithoutFeedback, Keyboard, Platform, View, Modal, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import styled from 'styled-components/native';
import { FontAwesome } from '@expo/vector-icons';
import { useKhata } from '../../context/KhataContext';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
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

const FormCard = styled(ThemedView)`
  background-color: ${(props: ThemeProps) => props.theme.colors.card};
  border-radius: 16px;
  padding: 24px;
  margin: 16px;
  elevation: 4;
  shadow-opacity: 0.15;
  shadow-radius: 8px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
`;

const Label = styled(ThemedText)`
  font-size: 16px;
  margin-bottom: 8px;
  font-weight: 500;
`;

const StyledInput = styled(TextInput)`
  border-width: 1px;
  border-color: ${(props: ThemeProps) => props.theme.colors.border};
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  margin-bottom: 20px;
  color: ${(props: ThemeProps) => props.theme.colors.text};
  background-color: ${(props: ThemeProps) => props.theme.colors.background};
`;

const SubmitButton = styled(TouchableOpacity)`
  background-color: ${(props: ThemeProps) => props.theme.colors.primary};
  padding: 16px;
  border-radius: 8px;
  align-items: center;
  margin-top: 16px;
`;

const SubmitButtonText = styled(ThemedText)`
  color: white;
  font-weight: 600;
  font-size: 16px;
`;

const CancelButton = styled(TouchableOpacity)`
  padding: 16px;
  border-radius: 8px;
  align-items: center;
  margin-top: 12px;
  background-color: ${(props: ThemeProps) => props.theme.colors.card};
  border-width: 1px;
  border-color: ${(props: ThemeProps) => props.theme.colors.border};
`;

const CancelButtonText = styled(ThemedText)`
  font-weight: 500;
  font-size: 16px;
`;

const DateContainer = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px;
  border-width: 1px;
  border-color: ${(props: ThemeProps) => props.theme.colors.border};
  border-radius: 8px;
  background-color: ${(props: ThemeProps) => props.theme.colors.background};
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

export default function AddExpenseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = (params.id as string) || '';
  const { getKhata, addExpense } = useKhata();
  const { t } = useAppContext();
  const [khata, setKhata] = useState(getKhata(id));
  
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  
  // Create a UTC date for today to avoid timezone issues
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  
  const [selectedDate, setSelectedDate] = useState(todayUTC);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);

  // State for custom alerts
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  
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
  
  // Format the selected date as YYYY-MM-DD
  const formattedDate = (() => {
    // Create a date object and adjust for timezone
    const date = new Date(selectedDate);
    // Use UTC methods to avoid timezone issues
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();
  
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

  useEffect(() => {
    // Verify the khata exists
    if (!khata) {
      showAlert(t.error, t.khataNotFound, 'error');
      router.back();
    }
  }, [khata, router, t]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      // Ensure we use UTC date to avoid timezone issues
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();
      setSelectedDate(new Date(Date.UTC(year, month, day)));
    }
  };

  // Show custom alert
  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleSubmit = async () => {
    if (!khata) return;
    
    // Enhanced validation
    if (source.trim() === '') {
      showAlert(t.error || 'Error', t.pleaseEnterValidSource || 'Please enter a valid expense source', 'error');
      return;
    }
    
    if (amount.trim() === '') {
      showAlert(t.error || 'Error', t.pleaseEnterAmount || 'Please enter an amount', 'error');
      return;
    }

    const expenseAmount = parseFloat(amount);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      showAlert(t.error || 'Error', t.pleaseEnterValidAmount || 'Please enter a valid positive amount', 'error');
      return;
    }
 
    try {
      await addExpense(khata.id, {
        date: formattedDate,
        source: source.trim(),
        amount: expenseAmount,
      });

      // Immediately update khata data
      const updatedKhata = getKhata(khata.id);
      if (updatedKhata) {
        setKhata(updatedKhata);
      }

      showAlert(t.success || 'Success', t.expenseAddedSuccess || 'Expense added successfully', 'success');
      
      // Short delay before navigating back to show success message
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      showAlert(t.error || 'Error', t.failedToAddExpense || 'Failed to add expense', 'error');
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <ThemedView style={styles.container}>
        <Stack.Screen 
          options={{
            title: t.addExpense || 'Add Expense',
            headerBackTitle: t.back || 'Back',
          }}
        />
        <FormCard>
          <Label>{t.sourceOfExpense || 'Source of Expense'}</Label>
          <StyledInput
            placeholder={t.expensePlaceholder || "e.g., Groceries, Rent, etc."}
            value={source}
            onChangeText={setSource}
            placeholderTextColor="#999"
          />
          
          <Label>{t.expenseAmount || 'Expense Amount'}</Label>
          <StyledInput
            placeholder={t.enterAmount || "Enter amount"}
            value={amount}
            onChangeText={(text: string) => setAmount(text.replace(/[^0-9.]/g, ''))}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
          
          <Label>{t.date || 'Date'}</Label>
          <DateContainer 
            activeOpacity={0.7} 
            onPress={() => setShowDatePickerModal(true)}
          >
            <FontAwesome name="calendar" size={18} color="#666" />
            <DateText>{formattedDate} ({t.tapToChange || 'Tap to change'})</DateText>
          </DateContainer>
          
          {khata && (
            <ThemedText style={[
              styles.balanceLabel, 
              khata.totalAmount < 0 && styles.negativeBalanceLabel
            ]}>
              {t.availableBalance || 'Available Balance'}: {khata.totalAmount < 0 ? '-' : ''}{t.currency}{Math.abs(khata.totalAmount).toFixed(0)}
            </ThemedText>
          )}
           
          <SubmitButton onPress={handleSubmit}>
            <SubmitButtonText>{t.addExpense || 'Add Expense'}</SubmitButtonText>
          </SubmitButton>
          
          <CancelButton onPress={() => router.back()}>
            <CancelButtonText>{t.cancel || 'Cancel'}</CancelButtonText>
          </CancelButton>
        </FormCard>
        
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
                <ThemedText style={styles.datePickerTitle}>{t.selectDate || 'Select Date'}</ThemedText>
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
                  <ThemedText style={styles.datePickerButtonText}>{t.cancel || 'Cancel'}</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.datePickerButton, styles.datePickerConfirmButton]}
                  onPress={() => setShowDatePickerModal(false)}
                >
                  <ThemedText style={styles.datePickerConfirmText}>{t.confirm || 'Confirm'}</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
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
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  negativeBalanceLabel: {
    color: '#e74c3c',
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
});