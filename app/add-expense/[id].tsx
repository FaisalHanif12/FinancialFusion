import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import styled from 'styled-components/native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useKhata } from '@/context/KhataContext';

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

export default function AddExpenseScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getKhata, addExpense } = useKhata();
  const [khata, setKhata] = useState(getKhata(id as string));
  
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');

  // Format today's date as YYYY-MM-DD
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];

  useEffect(() => {
    // Verify the khata exists
    if (!khata) {
      Alert.alert('Error', 'Khata not found');
      router.back();
    }
  }, [khata, router]);

  const handleAddExpense = async () => {
    if (!khata) return;
    
    if (source.trim() === '' || amount.trim() === '') {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const expenseAmount = parseFloat(amount);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (expenseAmount > khata.totalAmount) {
      Alert.alert('Error', 'Expense amount cannot exceed total amount');
      return;
    }

    try {
      await addExpense(khata.id, {
        date: formattedDate,
        source: source.trim(),
        amount: expenseAmount,
      });

      // Navigate back to the khata screen
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add expense');
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
            title: 'Add Expense',
            headerBackTitle: 'Back',
          }}
        />
        <FormCard>
          <Label>Source of Expense</Label>
          <StyledInput
            placeholder="e.g., Groceries, Rent, etc."
            value={source}
            onChangeText={setSource}
            placeholderTextColor="#999"
          />
          
          <Label>Expense Amount</Label>
          <StyledInput
            placeholder="Enter amount"
            value={amount}
            onChangeText={(text: string) => setAmount(text.replace(/[^0-9.]/g, ''))}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
          
          <ThemedText style={styles.dateLabel}>
            Date: {formattedDate}
          </ThemedText>
          
          {khata && (
            <ThemedText style={styles.balanceLabel}>
              Available Balance: ₹{khata.totalAmount.toFixed(2)}
            </ThemedText>
          )}
          
          <SubmitButton onPress={handleAddExpense}>
            <SubmitButtonText>Add Expense</SubmitButtonText>
          </SubmitButton>
          
          <CancelButton onPress={() => router.back()}>
            <CancelButtonText>Cancel</CancelButtonText>
          </CancelButton>
        </FormCard>
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
}); 