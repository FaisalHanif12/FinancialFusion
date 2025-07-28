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
  const [alertConfig, setAlertConfig] = useState<{ title: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({ title: '', message: '', type: 'error' });

  const handleDateSelect = (day: any) => {
    const selectedDate = new Date(day.timestamp);
    setDate(selectedDate);
    setShowCalendar(false);
  };

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'error') => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  const handleAdd = () => {
    // Validate all fields
    if (!description && !amount) {
      showAlert(t.error || 'Error', 'Please complete all fields');
      return;
    } else if (!description) {
      showAlert(t.error || 'Error', 'Please enter a description');
      return;
    } else if (!amount) {
      showAlert(t.error || 'Error', 'Please enter an amount');
      return;
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      showAlert(t.error || 'Error', 'Please enter a valid amount');
      return;
    }

    const parsedAmount = parseFloat(amount);
    onAdd({
      date,
      description,
      amount: isNaN(parsedAmount) ? 0 : parsedAmount,
    });

    // Reset form
    setDate(new Date());
    setDescription('');
    setAmount('');
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

          <ThemedTextInput
            placeholder="Enter expense description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
          />

          <ThemedTextInput
            placeholder={t.amount}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={styles.input}
          />

          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <ThemedText style={styles.addButtonText}>{t.addExpense}</ThemedText>
          </TouchableOpacity>
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
  input: {
    marginBottom: 15,
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
    fontWeight: 'bold',
    fontSize: 16,
  },
});