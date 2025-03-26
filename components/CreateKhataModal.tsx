import React, { useState } from 'react';
import { Modal, TouchableOpacity, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import styled from 'styled-components/native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
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

interface CreateKhataModalProps {
  visible: boolean;
  onClose: () => void;
}

const ModalContainer = styled(ThemedView)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled(ThemedView)`
  width: 90%;
  padding: 24px;
  border-radius: 16px;
  background-color: ${(props: ThemeProps) => props.theme.colors.background};
  shadow-opacity: 0.2;
  shadow-radius: 8px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  elevation: 10;
`;

const Title = styled(ThemedText)`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  text-align: center;
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
  margin-bottom: 16px;
  color: ${(props: ThemeProps) => props.theme.colors.text};
  background-color: ${(props: ThemeProps) => props.theme.colors.card};
`;

const ButtonsContainer = styled(ThemedView)`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 16px;
`;

const CancelButton = styled(TouchableOpacity)`
  padding: 12px 24px;
  border-radius: 8px;
  background-color: ${(props: ThemeProps) => props.theme.colors.card};
  border-width: 1px;
  border-color: ${(props: ThemeProps) => props.theme.colors.border};
  justify-content: center;
  align-items: center;
  flex: 1;
  margin-right: 8px;
`;

const CreateButton = styled(TouchableOpacity)`
  padding: 12px 24px;
  border-radius: 8px;
  background-color: ${(props: ThemeProps) => props.theme.colors.primary};
  justify-content: center;
  align-items: center;
  flex: 1;
  margin-left: 8px;
`;

const CreateButtonText = styled(ThemedText)`
  color: white;
  font-weight: 600;
  font-size: 16px;
`;

const CancelButtonText = styled(ThemedText)`
  font-weight: 600;
  font-size: 16px;
`;

export const CreateKhataModal: React.FC<CreateKhataModalProps> = ({ visible, onClose }) => {
  const [name, setName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const { addKhata } = useKhata();

  // Format today's date as YYYY-MM-DD
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];

  const handleCreateKhata = async () => {
    if (name.trim() === '' || totalAmount.trim() === '') {
      // Validate form
      alert('Please fill in all fields');
      return;
    }

    // Create new khata
    await addKhata({
      name: name.trim(),
      date: formattedDate,
      totalAmount: parseFloat(totalAmount),
    });

    // Reset form and close modal
    setName('');
    setTotalAmount('');
    onClose();
  };

  const handleCancel = () => {
    // Reset form and close modal
    setName('');
    setTotalAmount('');
    onClose();
  };

  // Dismiss keyboard when clicking outside inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ModalContainer>
          <ModalContent>
            <Title>Create New Khata</Title>
            
            <Label>Name</Label>
            <StyledInput
              placeholder="Enter name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#999"
            />
            
            <Label>Total Amount</Label>
            <StyledInput
              placeholder="Enter amount"
              value={totalAmount}
              onChangeText={(text: string) => setTotalAmount(text.replace(/[^0-9.]/g, ''))}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            
            <ButtonsContainer>
              <CancelButton onPress={handleCancel}>
                <CancelButtonText>Cancel</CancelButtonText>
              </CancelButton>
              <CreateButton onPress={handleCreateKhata}>
                <CreateButtonText>Create</CreateButtonText>
              </CreateButton>
            </ButtonsContainer>
          </ModalContent>
        </ModalContainer>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CreateKhataModal; 