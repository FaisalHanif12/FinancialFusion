import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import styled from 'styled-components/native';

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

interface DastiKhata {
  id: string;
  name: string;
  amount: number;
  date: string;
  isPaid: boolean;
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

const DastiKhataName = styled(ThemedText)`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const DastiKhataDate = styled(ThemedText)`
  font-size: 14px;
  color: ${(props: ThemeProps) => props.theme.colors.secondary};
  margin-bottom: 8px;
`;

const DastiKhataAmount = styled(ThemedText)<{ isPaid: boolean }>`
  font-size: 20px;
  font-weight: 700;
  color: ${(props: { isPaid: boolean } & ThemeProps) => props.isPaid ? '#22A45D' : props.theme.colors.primary};
`;

const Status = styled(ThemedView)<{ isPaid: boolean }>`
  background-color: ${(props: { isPaid: boolean } & ThemeProps) => props.isPaid ? 'rgba(34, 164, 93, 0.1)' : 'rgba(74, 128, 240, 0.1)'};
  padding: 4px 12px;
  border-radius: 20px;
  align-self: flex-start;
  margin-top: 8px;
`;

const StatusText = styled(ThemedText)<{ isPaid: boolean }>`
  color: ${(props: { isPaid: boolean } & ThemeProps) => props.isPaid ? '#22A45D' : props.theme.colors.primary};
  font-size: 12px;
  font-weight: 600;
`;

const SearchInput = styled(TextInput)`
  border-width: 1px;
  border-color: ${(props: ThemeProps) => props.theme.colors.border};
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  margin-bottom: 16px;
  color: ${(props: ThemeProps) => props.theme.colors.text};
  background-color: ${(props: ThemeProps) => props.theme.colors.card};
`;

// Add styled components for the modal
const ModalContainer = styled(ThemedView)`
  background-color: ${(props: ThemeProps) => props.theme.colors.card};
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
`;

const ModalTitle = styled(ThemedText)`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
  text-align: center;
`;

const ButtonsRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 8px;
`;

const ModalButton = styled(TouchableOpacity)`
  padding: 12px 24px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  flex: 1;
  margin-horizontal: 8px;
`;

// Add the missing StyledInput component
const StyledInput = styled(TextInput)`
  border-width: 1px;
  border-color: ${(props: ThemeProps) => props.theme.colors.border};
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  margin-bottom: 16px;
  color: ${(props: ThemeProps) => props.theme.colors.text};
  background-color: ${(props: ThemeProps) => props.theme.colors.background};
`;

export default function DastiKhataScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  
  // Example data
  const [dastiKhatas, setDastiKhatas] = useState<DastiKhata[]>([
    {
      id: '1',
      name: 'Ahmed',
      amount: 5000,
      date: '2023-03-15',
      isPaid: false,
    },
    {
      id: '2',
      name: 'Farhan',
      amount: 3000,
      date: '2023-03-10',
      isPaid: true,
    },
    {
      id: '3',
      name: 'Saad',
      amount: 7500,
      date: '2023-03-20',
      isPaid: false,
    },
  ]);

  const markAsPaid = (id: string) => {
    setDastiKhatas(
      dastiKhatas.map(khata => 
        khata.id === id ? { ...khata, isPaid: true } : khata
      )
    );
  };

  const handleAddDastiKhata = () => {
    if (!newName.trim() || !newAmount.trim()) {
      return;
    }
    
    const parsedAmount = parseFloat(newAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }
    
    const newDastiKhata: DastiKhata = {
      id: (dastiKhatas.length + 1).toString(),
      name: newName.trim(),
      amount: parsedAmount,
      date: new Date().toISOString().split('T')[0],
      isPaid: false,
    };
    
    setDastiKhatas([newDastiKhata, ...dastiKhatas]);
    setNewName('');
    setNewAmount('');
    setShowAddModal(false);
  };

  const renderDastiKhataItem = ({ item }: { item: DastiKhata }) => (
    <Card>
      <View style={styles.cardHeader}>
        <View>
          <DastiKhataName>{item.name}</DastiKhataName>
          <DastiKhataDate>Created on {item.date}</DastiKhataDate>
        </View>
        <Status isPaid={item.isPaid}>
          <StatusText isPaid={item.isPaid}>
            {item.isPaid ? 'PAID' : 'UNPAID'}
          </StatusText>
        </Status>
      </View>
      
      <DastiKhataAmount isPaid={item.isPaid}>₹{item.amount.toFixed(2)}</DastiKhataAmount>
      
      {!item.isPaid && (
        <TouchableOpacity 
          style={styles.payButton}
          onPress={() => markAsPaid(item.id)}
        >
          <ThemedText style={styles.payButtonText}>Mark as Paid</ThemedText>
        </TouchableOpacity>
      )}
    </Card>
  );

  const filteredKhatas = dastiKhatas.filter(khata =>
    khata.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderEmptyState = () => (
    <ThemedView style={styles.emptyContainer}>
      <FontAwesome name="book" size={64} color="#ccc" style={styles.emptyIcon} />
      <ThemedText style={styles.emptyText}>No Dasti Khata Yet</ThemedText>
      <ThemedText style={styles.emptySubtext}>
        Tap the "+" button below to add a new Dasti Khata
      </ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>Dasti Khata</ThemedText>
        <ThemedText style={styles.subtitle}>Manage your lent and borrowed money</ThemedText>
      </ThemedView>

      <SearchInput
        placeholder="Search by name..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#999"
      />

      <FlatList
        data={filteredKhatas}
        keyExtractor={item => item.id}
        renderItem={renderDastiKhataItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setShowAddModal(true)}
      >
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Add New Dasti Khata Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ModalContainer>
            <ModalTitle>Add New Dasti Khata</ModalTitle>
            <StyledInput
              placeholder="Person's Name"
              value={newName}
              onChangeText={setNewName}
              placeholderTextColor="#999"
            />
            <StyledInput
              placeholder="Amount"
              keyboardType="numeric"
              value={newAmount}
              onChangeText={(text: string) => setNewAmount(text.replace(/[^0-9.]/g, ''))}
              placeholderTextColor="#999"
            />
            <ButtonsRow>
              <ModalButton 
                style={{ backgroundColor: '#f0f0f0' }}
                onPress={() => setShowAddModal(false)}
              >
                <ThemedText>Cancel</ThemedText>
              </ModalButton>
              <ModalButton 
                style={{ backgroundColor: '#4A80F0' }}
                onPress={handleAddDastiKhata}
              >
                <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Add</ThemedText>
              </ModalButton>
            </ButtonsRow>
          </ModalContainer>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 80, // Space for FAB
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
  payButton: {
    backgroundColor: '#4A80F0',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  payButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16
  },
}); 