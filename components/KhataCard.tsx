import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View, GestureResponderEvent, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import styled from 'styled-components/native';
import { Khata } from '../context/KhataContext';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { FontAwesome } from '@expo/vector-icons';
import { useKhata } from '../context/KhataContext';

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
  font-size: 20px;
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

const DeleteIcon = styled(TouchableOpacity)`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
  padding: 5px;
`;

const ConfirmationModalOverlay = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 16px;
`;

const ConfirmationContainer = styled(ThemedView)`
  background-color: ${(props: ThemeProps) => props.theme.colors.background};
  padding: 20px;
  border-radius: 10px;
  width: 80%;
  align-items: center;
`;

const ConfirmationTitle = styled(ThemedText)`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 15px;
  text-align: center;
`;

const ConfirmationMessage = styled(ThemedText)`
  font-size: 14px;
  margin-bottom: 20px;
  text-align: center;
`;

const ConfirmationButtons = styled(View)`
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
`;

const ConfirmButton = styled(TouchableOpacity)`
  background-color: #e74c3c;
  padding: 10px;
  border-radius: 5px;
  margin: 0 5px;
  flex: 1;
  align-items: center;
`;

const CancelButton = styled(TouchableOpacity)`
  background-color: #e0e0e0;
  padding: 10px;
  border-radius: 5px;
  margin: 0 5px;
  border-width: 1px;
  border-color: #cccccc;
  flex: 1;
  align-items: center;
`;

export const KhataCard: React.FC<KhataCardProps> = ({ khata }) => {
  const router = useRouter();
  const { deleteKhata } = useKhata();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

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

  const handleDelete = (e: GestureResponderEvent) => {
    e.stopPropagation();
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteKhata(khata.id);
      setShowDeleteConfirmation(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete khata');
    }
  };

  return (
    <>
      <TouchableOpacity onPress={handleCardPress} activeOpacity={0.7}>
        <Card>
          <DeleteIcon onPress={handleDelete}>
            <FontAwesome name="trash" size={18} color="#e74c3c" />
          </DeleteIcon>
          <KhataName>{khata.name}</KhataName>
          <DateText>Created on {khata.date}</DateText>
          <ThemedText style={styles.label}>Total Amount</ThemedText>
          <AmountText>₹{khata.totalAmount.toFixed(0)}</AmountText>
          
          <ButtonsContainer>
            <AddExpenseButton onPress={handleAddExpense}>
              <ButtonText>Add Expense</ButtonText>
            </AddExpenseButton>
          </ButtonsContainer>
        </Card>
      </TouchableOpacity>

      <Modal
        visible={showDeleteConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirmation(false)}
      >
        <ConfirmationModalOverlay>
          <ConfirmationContainer>
            <ConfirmationTitle>Delete Khata</ConfirmationTitle>
            <ConfirmationMessage>
              Are you sure you want to delete "{khata.name}" khata? This action cannot be undone.
            </ConfirmationMessage>
            <ConfirmationButtons>
              <CancelButton onPress={() => setShowDeleteConfirmation(false)}>
                <ThemedText style={{ fontWeight: '600', color: '#444444' }}>Cancel</ThemedText>
              </CancelButton>
              <ConfirmButton onPress={confirmDelete}>
                <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Delete</ThemedText>
              </ConfirmButton>
            </ConfirmationButtons>
          </ConfirmationContainer>
        </ConfirmationModalOverlay>
      </Modal>
    </>
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