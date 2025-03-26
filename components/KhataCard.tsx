import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { Khata } from '../context/KhataContext';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

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

interface KhataCardProps {
  khata: Khata;
}

const Card = styled(ThemedView)`
  background-color: ${(props: ThemeProps) => props.theme.colors.card};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  shadow-opacity: 0.1;
  shadow-radius: 10px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  elevation: 5;
`;

const KhataName = styled(ThemedText)`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const DateText = styled(ThemedText)`
  font-size: 14px;
  color: ${(props: ThemeProps) => props.theme.colors.secondary};
  margin-bottom: 16px;
`;

const AmountText = styled(ThemedText)`
  font-size: 24px;
  font-weight: 700;
  color: ${(props: ThemeProps) => props.theme.colors.primary};
  margin-top: 8px;
`;

const ButtonText = styled(ThemedText)`
  color: white;
  font-weight: 600;
  font-size: 14px;
`;

const AddExpenseButton = styled(TouchableOpacity)`
  background-color: ${(props: ThemeProps) => props.theme.colors.primary};
  padding: 8px 16px;
  border-radius: 8px;
  align-items: center;
  margin-top: 16px;
`;

export const KhataCard: React.FC<KhataCardProps> = ({ khata }) => {
  const router = useRouter();

  const handleCardPress = () => {
    router.push(`/khata/${khata.id}`);
  };

  const handleAddExpense = () => {
    router.push(`/add-expense/${khata.id}`);
  };

  return (
    <TouchableOpacity onPress={handleCardPress} activeOpacity={0.7}>
      <Card>
        <KhataName>{khata.name}</KhataName>
        <DateText>Created on {khata.date}</DateText>
        <ThemedText>Total Amount</ThemedText>
        <AmountText>₹{khata.totalAmount.toFixed(2)}</AmountText>
        <AddExpenseButton onPress={handleAddExpense}>
          <ButtonText>Add Expense</ButtonText>
        </AddExpenseButton>
      </Card>
    </TouchableOpacity>
  );
};

export default KhataCard; 