import React from 'react';
import { TouchableOpacity, StyleSheet, View, GestureResponderEvent } from 'react-native';
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
  align-items: center;
`;

const KhataName = styled(ThemedText)`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  text-align: center;
`;

const DateText = styled(ThemedText)`
  font-size: 14px;
  color: ${(props: ThemeProps) => props.theme.colors.secondary};
  margin-bottom: 16px;
  text-align: center;
`;

const AmountText = styled(ThemedText)`
  font-size: 24px;
  font-weight: 700;
  color: ${(props: ThemeProps) => props.theme.colors.primary};
  margin-top: 8px;
  margin-bottom: 16px;
  text-align: center;
`;

const ButtonText = styled(ThemedText)`
  color: white;
  font-weight: 600;
  font-size: 14px;
`;

const ButtonsContainer = styled(View)`
  width: 100%;
  margin-top: 8px;
`;

const AddExpenseButton = styled(TouchableOpacity)`
  background-color: ${(props: ThemeProps) => props.theme.colors.primary};
  padding: 12px 16px;
  border-radius: 8px;
  align-items: center;
  margin-top: 8px;
  width: 100%;
`;

export const KhataCard: React.FC<KhataCardProps> = ({ khata }) => {
  const router = useRouter();

  const handleCardPress = () => {
    router.push({
      pathname: '/khata/[id]',
      params: { id: khata.id }
    });
  };

  const handleAddExpense = (e: GestureResponderEvent) => {
    e.stopPropagation();
    router.push({
      pathname: '/add-expense/[id]',
      params: { id: khata.id }
    });
  };

  return (
    <TouchableOpacity onPress={handleCardPress} activeOpacity={0.7}>
      <Card>
        <KhataName>{khata.name}</KhataName>
        <DateText>Created on {khata.date}</DateText>
        <ThemedText style={styles.label}>Total Amount</ThemedText>
        <AmountText>₹{khata.totalAmount.toFixed(2)}</AmountText>
        
        <ButtonsContainer>
          <AddExpenseButton onPress={handleAddExpense}>
            <ButtonText>Add Expense</ButtonText>
          </AddExpenseButton>
        </ButtonsContainer>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default KhataCard; 