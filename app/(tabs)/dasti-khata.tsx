import React, { useState, useEffect } from 'react';
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
  description: string;
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

// Add Date Container component
const DateContainer = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  border-width: 1px;
  border-color: ${(props: ThemeProps) => props.theme.colors.border};
  border-radius: 8px;
  background-color: ${(props: ThemeProps) => props.theme.colors.card};
`;

const DateText = styled(ThemedText)`
  font-size: 16px;
  margin-left: 8px;
  color: ${(props: ThemeProps) => props.theme.colors.text};
`;

// Add components for the monthly section
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
  font-weight: 600;
`;

const DatePickerModalOverlay = styled(View)`
  flex: 1;
  justifyContent: 'center';
  alignItems: 'center';
  backgroundColor: 'rgba(0, 0, 0, 0.5)';
  padding: 16;
`;

const DatePickerModalContent = styled(View)`
  backgroundColor: ${(props: ThemeProps) => props.theme.colors.card};
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  maxWidth: 400px;
`;

const DatePickerHeader = styled(View)`
  flexDirection: 'row';
  justifyContent: 'space-between';
  alignItems: 'center';
`;

const DatePickerTitle = styled(ThemedText)`
  fontSize: 20px;
  fontWeight: 700;
`;

const CalendarContainer = styled(View)`
  margin-top: 16px;
`;

const CalendarHeader = styled(View)`
  flexDirection: 'row';
  justifyContent: 'space-between';
  alignItems: 'center';
`;

const CalendarNavButton = styled(TouchableOpacity)`
  padding: 8px;
`;

const CalendarTitle = styled(ThemedText)`
  fontSize: 18px;
  fontWeight: 700;
`;

const WeekdayHeader = styled(View)`
  flexDirection: 'row';
  justifyContent: 'space-between';
  alignItems: 'center';
  marginBottom: 8px;
`;

const WeekdayText = styled(ThemedText)`
  width: 14.28%;
`;

const CalendarDays = styled(View)`
  flexDirection: 'row';
  flexWrap: 'wrap';
`;

const CalendarDay = styled(TouchableOpacity)`
  width: 14.28%;
  padding: 8px;
`;

const SelectedDay = styled(View)`
  backgroundColor: ${(props: ThemeProps) => props.theme.colors.primary};
  borderRadius: 8px;
`;

const SelectedDayText = styled(ThemedText)`
  color: white;
  fontWeight: 700;
`;

const TodayDay = styled(View)`
  backgroundColor: ${(props: ThemeProps) => props.theme.colors.primary};
  borderRadius: 8px;
`;

const TodayDayText = styled(ThemedText)`
  color: white;
  fontWeight: 700;
`;

const DisabledDay = styled(View)`
  backgroundColor: ${(props: ThemeProps) => props.theme.colors.secondary};
  borderRadius: 8px;
`;

const DisabledDayText = styled(ThemedText)`
  color: ${(props: ThemeProps) => props.theme.colors.text};
`;

const DatePickerActions = styled(View)`
  flexDirection: 'row';
  justifyContent: 'space-between';
  marginTop: 16px;
`;

const DatePickerButton = styled(TouchableOpacity)`
  padding: 12px 24px;
  borderRadius: 8px;
  alignItems: 'center';
  justifyContent: 'center';
`;

export default function DastiKhataScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDescription, setNewDescription] = useState('');
  
  // Date picker state variables
  const todayUTC = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
  const [selectedDate, setSelectedDate] = useState(todayUTC);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(todayUTC.getMonth());
  const [currentYear, setCurrentYear] = useState(todayUTC.getFullYear());
  
  // State for collapsible months
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);
  const [expandAll, setExpandAll] = useState(false);
  const [visibleMonths, setVisibleMonths] = useState(6);
  
  // Format the selected date as YYYY-MM-DD
  const formattedDate = `${selectedDate.getUTCFullYear()}-${String(selectedDate.getUTCMonth() + 1).padStart(2, '0')}-${String(selectedDate.getUTCDate()).padStart(2, '0')}`;
  
  // Update calendar view when selected date changes
  useEffect(() => {
    setCurrentMonth(selectedDate.getUTCMonth());
    setCurrentYear(selectedDate.getUTCFullYear());
  }, [selectedDate]);
  
  // Example data
  const [dastiKhatas, setDastiKhatas] = useState<DastiKhata[]>([
    {
      id: '1',
      name: 'Ahmed',
      amount: 5000,
      date: '2023-03-15',
      isPaid: false,
      description: 'Borrowed for business',
    },
    {
      id: '2',
      name: 'Farhan',
      amount: 3000,
      date: '2023-03-10',
      isPaid: true,
      description: 'Lent for emergency',
    },
    {
      id: '3',
      name: 'Saad',
      amount: 7500,
      date: '2023-03-20',
      isPaid: false,
      description: 'Home renovation',
    },
  ]);

  const markAsPaid = (id: string) => {
    setDastiKhatas(
      dastiKhatas.map(khata => 
        khata.id === id ? { ...khata, isPaid: true } : khata
      )
    );
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      setDastiKhatas(dastiKhatas.filter(khata => khata.id !== itemToDelete));
      setItemToDelete(null);
    }
    setShowDeleteConfirm(false);
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
      date: formattedDate,
      isPaid: false,
      description: newDescription.trim(),
    };
    
    setDastiKhatas([newDastiKhata, ...dastiKhatas]);
    setNewName('');
    setNewAmount('');
    setNewDescription('');
    setShowAddModal(false);
  };

  const renderDastiKhataItem = ({ item }: { item: DastiKhata }) => (
    <Card>
      <View style={styles.cardHeader}>
        <View>
          <DastiKhataName>{item.name}</DastiKhataName>
          <DastiKhataDate>Created on {item.date}</DastiKhataDate>
          {item.description && (
            <ThemedText style={styles.description}>{item.description}</ThemedText>
          )}
        </View>
        <View>
          <Status isPaid={item.isPaid}>
            <StatusText isPaid={item.isPaid}>
              {item.isPaid ? 'PAID' : 'UNPAID'}
            </StatusText>
          </Status>
        </View>
      </View>
      
      <View style={styles.actionsRow}>
        <DastiKhataAmount isPaid={item.isPaid}>₹{item.amount.toFixed(2)}</DastiKhataAmount>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => confirmDelete(item.id)}
        >
          <FontAwesome name="trash" size={16} color="#e74c3c" />
        </TouchableOpacity>
      </View>
      
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

  // Update selected date
  const selectDate = (day: number) => {
    const newDate = new Date(Date.UTC(currentYear, currentMonth, day));
    setSelectedDate(newDate);
    setShowDatePickerModal(false);
  };

  // Calendar navigation functions
  const goPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Add empty spaces for days before the 1st of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  // Group khatas by month
  const groupByMonth = () => {
    const groups: { [key: string]: DastiKhata[] } = {};

    // Sort by date, newest first
    const sortedKhatas = [...dastiKhatas].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    sortedKhatas.forEach(khata => {
      const date = new Date(khata.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      
      groups[monthYear].push(khata);
    });

    return groups;
  };

  // Toggle expanded state for a month
  const toggleMonthExpanded = (monthKey: string) => {
    setExpandedMonths(prev => {
      if (prev.includes(monthKey)) {
        return prev.filter(m => m !== monthKey);
      } else {
        return [...prev, monthKey];
      }
    });
  };

  // Toggle expand all
  const toggleExpandAll = () => {
    const newExpandAll = !expandAll;
    setExpandAll(newExpandAll);
    
    const monthsData = groupByMonth();
    const allMonths = Object.keys(monthsData);
    
    if (newExpandAll) {
      setExpandedMonths(allMonths);
    } else {
      setExpandedMonths([]);
    }
  };

  // Load more months
  const handleLoadMore = () => {
    setVisibleMonths(prev => prev + 6);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Format month key for display
  const formatMonthDisplay = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // Render a month section with collapsible content
  const renderMonthSection = ({ item }: { item: [string, DastiKhata[]] }) => {
    const [monthKey, khatas] = item;
    const isExpanded = expandedMonths.includes(monthKey);
    
    return (
      <MonthSection>
        <TouchableOpacity onPress={() => toggleMonthExpanded(monthKey)}>
          <MonthHeader>
            <MonthTitle>{formatMonthDisplay(monthKey)}</MonthTitle>
            <FontAwesome 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#666" 
            />
          </MonthHeader>
        </TouchableOpacity>
        
        {isExpanded && (
          <View>
            {khatas.map(khata => (
              <React.Fragment key={khata.id}>
                {renderDastiKhataItem({ item: khata })}
              </React.Fragment>
            ))}
          </View>
        )}
      </MonthSection>
    );
  };

  const monthData = groupByMonth();
  const monthEntries = Object.entries(monthData);
  const visibleMonthEntries = monthEntries.slice(0, visibleMonths);
  const hasMoreMonths = monthEntries.length > visibleMonths;

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

      {search ? (
        <FlatList
          data={filteredKhatas}
          keyExtractor={item => item.id}
          renderItem={renderDastiKhataItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
        />
      ) : monthEntries.length > 0 ? (
        <View style={styles.listContainer}>
          <View style={styles.expandAllContainer}>
            <TouchableOpacity 
              style={styles.expandAllButton} 
              onPress={toggleExpandAll}
            >
              <ThemedText style={styles.expandAllText}>
                {expandAll ? 'Collapse All' : 'Expand All'}
              </ThemedText>
              <FontAwesome 
                name={expandAll ? 'chevron-up' : 'chevron-down'} 
                size={14} 
                color="#4A80F0" 
              />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={visibleMonthEntries}
            keyExtractor={([monthKey]) => monthKey}
            renderItem={renderMonthSection}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
          
          {hasMoreMonths && (
            <TouchableOpacity 
              style={styles.loadMoreButton} 
              onPress={handleLoadMore}
            >
              <ThemedText style={styles.loadMoreText}>Load More</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        renderEmptyState()
      )}

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
            <StyledInput
              placeholder="Description (optional)"
              value={newDescription}
              onChangeText={setNewDescription}
              placeholderTextColor="#999"
            />
            
            {/* Date Selector */}
            <DateContainer onPress={() => setShowDatePickerModal(true)}>
              <FontAwesome name="calendar" size={18} color="#666" />
              <DateText>{formattedDate}</DateText>
            </DateContainer>
            
            <ButtonsRow>
              <ModalButton 
                style={{ backgroundColor: '#f0f0f0' }}
                onPress={() => setShowAddModal(false)}
              >
                <ThemedText style={{ color: '#000000', fontWeight: '600' }}>Cancel</ThemedText>
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

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePickerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePickerModal(false)}
      >
        <View style={styles.datePickerModalOverlay}>
          <View style={styles.datePickerModalContent}>
            <View style={styles.datePickerHeader}>
              <ThemedText style={styles.datePickerTitle}>Select Date</ThemedText>
              <TouchableOpacity onPress={() => setShowDatePickerModal(false)}>
                <FontAwesome name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Custom Calendar */}
            <View style={styles.calendarContainer}>
              {/* Calendar Header */}
              <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={goPrevMonth} style={styles.calendarNavButton}>
                  <FontAwesome name="chevron-left" size={18} color="#4A80F0" />
                </TouchableOpacity>
                <ThemedText style={styles.calendarTitle}>
                  {monthNames[currentMonth]} {currentYear}
                </ThemedText>
                <TouchableOpacity
                  onPress={goNextMonth}
                  style={styles.calendarNavButton}
                  disabled={
                    new Date(currentYear, currentMonth + 1, 1) > new Date()
                  }
                >
                  <FontAwesome
                    name="chevron-right"
                    size={18}
                    color={
                      new Date(currentYear, currentMonth + 1, 1) > new Date()
                        ? "#ccc"
                        : "#4A80F0"
                    }
                  />
                </TouchableOpacity>
              </View>

              {/* Weekday Headers */}
              <View style={styles.weekdayHeader}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <ThemedText key={index} style={styles.weekdayText}>
                    {day}
                  </ThemedText>
                ))}
              </View>

              {/* Calendar Days */}
              <View style={styles.calendarDays}>
                {generateCalendarDays().map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.calendarDay,
                      day === selectedDate.getUTCDate() &&
                      currentMonth === selectedDate.getUTCMonth() &&
                      currentYear === selectedDate.getUTCFullYear()
                        ? styles.selectedDay
                        : {},
                      day === new Date().getDate() &&
                      currentMonth === new Date().getMonth() &&
                      currentYear === new Date().getFullYear()
                        ? styles.todayDay
                        : {},
                      !day ? styles.emptyDay : {},
                      day && new Date(currentYear, currentMonth, day as number) > new Date()
                        ? styles.disabledDay
                        : {},
                    ]}
                    onPress={() => day && new Date(currentYear, currentMonth, day as number) <= new Date() && selectDate(day as number)}
                    disabled={!day || new Date(currentYear, currentMonth, day as number) > new Date()}
                  >
                    {day ? (
                      <ThemedText
                        style={[
                          styles.calendarDayText,
                          day === selectedDate.getUTCDate() &&
                          currentMonth === selectedDate.getUTCMonth() &&
                          currentYear === selectedDate.getUTCFullYear()
                            ? styles.selectedDayText
                            : {},
                          day === new Date().getDate() &&
                          currentMonth === new Date().getMonth() &&
                          currentYear === new Date().getFullYear()
                            ? styles.todayDayText
                            : {},
                          new Date(currentYear, currentMonth, day) > new Date()
                            ? styles.disabledDayText
                            : {},
                        ]}
                      >
                        {day}
                      </ThemedText>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.datePickerActions}>
              <TouchableOpacity
                style={[styles.datePickerButton, { backgroundColor: '#f0f0f0' }]}
                onPress={() => setShowDatePickerModal(false)}
              >
                <ThemedText style={{ color: '#333', fontWeight: '600' }}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.datePickerButton, { backgroundColor: '#4A80F0' }]}
                onPress={() => setShowDatePickerModal(false)}
              >
                <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Confirm</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <ModalContainer style={{ padding: 20 }}>
            <ModalTitle>Confirm Delete</ModalTitle>
            <ThemedText style={styles.confirmText}>
              Are you sure you want to delete this Dasti Khata?
            </ThemedText>
            <ButtonsRow>
              <ModalButton
                style={{ backgroundColor: '#f0f0f0' }}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <ThemedText style={{ color: '#000000', fontWeight: '600' }}>Cancel</ThemedText>
              </ModalButton>
              <ModalButton
                style={{ backgroundColor: '#e74c3c' }}
                onPress={handleDelete}
              >
                <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Delete</ThemedText>
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
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
  description: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 6,
    marginBottom: 4,
  },
  payButton: {
    backgroundColor: '#4A80F0',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 13,
    justifyContent: 'center',
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
  confirmText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  expandAllContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  expandAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
  },
  expandAllText: {
    marginRight: 6,
    fontSize: 14,
    color: '#4A80F0',
    fontWeight: '600',
  },
  loadMoreButton: {
    backgroundColor: '#4A80F0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  loadMoreText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Date Picker Modal Styles
  datePickerModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  datePickerModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  datePickerButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  // Custom Calendar Styles
  calendarContainer: {
    marginVertical: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  calendarNavButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(74, 128, 240, 0.1)',
  },
  weekdayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  weekdayText: {
    width: '14%',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  calendarDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarDay: {
    width: '14%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 20,
  },
  calendarDayText: {
    fontSize: 16,
    color: '#000000',
  },
  selectedDay: {
    backgroundColor: '#4A80F0',
  },
  selectedDayText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  todayDay: {
    borderWidth: 1,
    borderColor: '#4A80F0',
  },
  todayDayText: {
    color: '#4A80F0',
    fontWeight: 'bold',
  },
  emptyDay: {
    backgroundColor: 'transparent',
  },
  disabledDay: {
    opacity: 0.3,
  },
  disabledDayText: {
    color: '#999',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
}); 