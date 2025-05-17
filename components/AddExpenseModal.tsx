import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';

import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { ThemedTextInput } from './ThemedTextInput';
import { useAppContext } from '@/contexts/AppContext';
import CustomAlert from '@/app/components/CustomAlert';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (expense: { date: Date; description: string; amount: number }) => void;
}

export default function AddExpenseModal({ visible, onClose, onAdd }: AddExpenseModalProps) {
  const { t, isDark } = useAppContext();
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' as const });
  const [errors, setErrors] = useState({
    description: '',
    amount: ''
  });

  const handleDateSelect = (day: any) => {
    const selectedDate = new Date(day.timestamp);
    setDate(selectedDate);
    setShowCalendar(false);
  };

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'error') => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      description: '',
      amount: ''
    };

    // Validate description
    if (!description.trim()) {
      newErrors.description = t.pleaseEnterDescription || 'Please enter a description';
      isValid = false;
    } else if (description.trim().length < 3) {
      newErrors.description = t.descriptionTooShort || 'Description must be at least 3 characters';
      isValid = false;
    }

    // Validate amount
    if (!amount.trim()) {
      newErrors.amount = t.pleaseEnterAmount || 'Please enter an amount';
      isValid = false;
    } else {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        newErrors.amount = t.pleaseEnterValidAmount || 'Please enter a valid amount';
        isValid = false;
      } else if (amountNum > 1000000) {
        newErrors.amount = t.amountTooLarge || 'Amount cannot exceed 1,000,000';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAdd = () => {
    if (!validateForm()) {
      return;
    }

    onAdd({
      date,
      description: description.trim(),
      amount: parseFloat(amount),
    });

    // Reset form
    setDate(new Date());
    setDescription('');
    setAmount('');
    setErrors({ description: '', amount: '' });
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <ThemedView style={styles.centeredView}>
        <ThemedView style={styles.modalView}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>{t.addExpense}</ThemedText>
              <TouchableOpacity onPress={onClose}>
                <FontAwesome name="times" size={24} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.datePickerButton} 
              onPress={() => setShowCalendar(!showCalendar)}
            >
              <ThemedText>{date.toLocaleDateString()}</ThemedText>
              <FontAwesome name="calendar" size={20} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>

            {showCalendar && (
              <View style={styles.calendarContainer}>
                <Calendar
                  onDayPress={handleDateSelect}
                  markedDates={{
                    [date.toISOString().split('T')[0]]: { selected: true, selectedColor: '#4A80F0' }
                  }}
                  theme={{
                    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                    calendarBackground: isDark ? '#1E1E1E' : '#FFFFFF',
                    textSectionTitleColor: isDark ? '#FFFFFF' : '#000000',
                    selectedDayBackgroundColor: '#4A80F0',
                    selectedDayTextColor: '#FFFFFF',
                    todayTextColor: '#4A80F0',
                    dayTextColor: isDark ? '#FFFFFF' : '#000000',
                    monthTextColor: isDark ? '#FFFFFF' : '#000000',
                  }}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <ThemedTextInput
                placeholder="Enter expense description"
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                  if (errors.description) {
                    setErrors(prev => ({ ...prev, description: '' }));
                  }
                }}
                style={[styles.input, errors.description ? styles.inputError : null]}
              />
              {errors.description ? (
                <ThemedText style={styles.errorText}>{errors.description}</ThemedText>
              ) : null}

              <ThemedTextInput
                placeholder={t.amount}
                value={amount}
                onChangeText={(text) => {
                  setAmount(text);
                  if (errors.amount) {
                    setErrors(prev => ({ ...prev, amount: '' }));
                  }
                }}
                keyboardType="decimal-pad"
                style={[styles.input, errors.amount ? styles.inputError : null]}
              />
              {errors.amount ? (
                <ThemedText style={styles.errorText}>{errors.amount}</ThemedText>
              ) : null}
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <ThemedText style={styles.addButtonText}>{t.addExpense}</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </ThemedView>
      </ThemedView>
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertVisible(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  calendarContainer: {
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 1,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#4A80F0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
