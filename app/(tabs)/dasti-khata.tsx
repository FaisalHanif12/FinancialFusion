import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import Logo from '@/components/Logo';
import styled from 'styled-components/native';
import { useAppContext } from '@/contexts/AppContext';
import CustomAlert from '@/app/components/CustomAlert';

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

// Replace SearchInput with ThemedTextInput
const SearchInput = styled(ThemedTextInput).attrs((props: ThemeProps & { placeholder: string }) => ({
  placeholder: props.placeholder,
  placeholderTextColor: props.theme.colors.secondary
}))`
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

// Replace StyledInput with ThemedTextInput
const StyledInput = styled(ThemedTextInput)`
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
  font-size: 18px;
  font-weight: 700;
  color: #000000;
`;

const WeekdayHeader = styled(View)`
  flexDirection: 'row';
  justifyContent: 'space-between';
  alignItems: 'center';
  marginBottom: 8px;
`;

const WeekdayText = styled(ThemedText)`
  width: 14.28%;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #000000;
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
  
  // Tab navigation state
  const [activeTab, setActiveTab] = useState('unpaid'); // 'unpaid' or 'paid'
  
  // Pagination state
  const [visibleItems, setVisibleItems] = useState(30);
  
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
  const [showAllData, setShowAllData] = useState(false);
  
  // Get translations from our app context
  const { t } = useAppContext();
  
  // Format the selected date as YYYY-MM-DD
  const formattedDate = `${selectedDate.getUTCFullYear()}-${String(selectedDate.getUTCMonth() + 1).padStart(2, '0')}-${String(selectedDate.getUTCDate()).padStart(2, '0')}`;
  
  // Update calendar view when selected date changes
  useEffect(() => {
    setCurrentMonth(selectedDate.getUTCMonth());
    setCurrentYear(selectedDate.getUTCFullYear());
  }, [selectedDate]);
  
  // Initialize with an empty array instead of static data
  const [dastiKhatas, setDastiKhatas] = useState<DastiKhata[]>([]);

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

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' as const });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'error') => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  const handleAddDastiKhata = () => {
    if (!newName.trim() && !newAmount.trim()) {
      showAlert(t.error || 'Error', t.pleaseCompleteAllFields || 'Please complete all fields');
      return;
    } else if (!newName.trim()) {
      showAlert(t.error || 'Error', t.pleaseEnterName || 'Please enter a name');
      return;
    } else if (!newAmount.trim()) {
      showAlert(t.error || 'Error', t.pleaseEnterAmount || 'Please enter an amount');
      return;
    }
    
    const parsedAmount = parseFloat(newAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showAlert(t.error || 'Error', t.pleaseEnterValidAmount || 'Please enter a valid amount');
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
    showAlert(t.success || 'Success', t.entryAddedSuccessfully || 'Entry added successfully', 'success');
  };

  const renderDastiKhataItem = ({ item }: { item: DastiKhata }) => (
    <Card>
      <View style={styles.cardHeader}>
        <View>
          <DastiKhataName>{item.name}</DastiKhataName>
          <DastiKhataDate>{t.created} {item.date}</DastiKhataDate>
          {item.description && (
            <ThemedText style={styles.description}>{item.description}</ThemedText>
          )}
        </View>
        <View>
          <Status isPaid={item.isPaid}>
            <StatusText isPaid={item.isPaid}>
              {item.isPaid ? t.paid : t.unpaid}
            </StatusText>
          </Status>
        </View>
      </View>
      
      <View style={styles.actionsRow}>
        <DastiKhataAmount isPaid={item.isPaid}>{t.currency}{item.amount.toFixed(2)}</DastiKhataAmount>
        
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
          <ThemedText style={styles.payButtonText}>{t.markAsPaid}</ThemedText>
        </TouchableOpacity>
      )}
    </Card>
  );

  // Filter khatas by search term and payment status
  const filteredKhatas = dastiKhatas.filter(khata => {
    const matchesSearch = khata.name.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'paid' ? khata.isPaid : !khata.isPaid;
    return matchesSearch && matchesTab;
  });
  
  // Apply pagination to filtered khatas
  const paginatedKhatas = filteredKhatas.slice(0, visibleItems);
  const hasMoreItems = filteredKhatas.length > visibleItems;
  
  // Load more items
  const handleLoadMoreItems = () => {
    setVisibleItems(prev => prev + 30);
  };
  
  // Reset pagination when tab changes
  useEffect(() => {
    setVisibleItems(30);
  }, [activeTab]);

  const renderEmptyState = () => (
    <ThemedView style={styles.emptyContainer}>
      <FontAwesome name="book" size={64} color="#ccc" style={styles.emptyIcon} />
      <ThemedText style={styles.emptyText}>{t.noDastiKhataYet}</ThemedText>
      <ThemedText style={styles.emptySubtext}>
        {t.tapToAddDastiKhata}
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

    // Filter by payment status first
    const filteredByStatus = dastiKhatas.filter(khata => 
      activeTab === 'paid' ? khata.isPaid : !khata.isPaid
    );
    
    // Sort by date, newest first
    const sortedKhatas = [...filteredByStatus].sort((a, b) => 
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
    
    // Convert to array of entries and sort by date (newest first)
    const sortedEntries = Object.entries(groups).sort((a, b) => {
      const [yearMonthA] = a[0].split('-');
      const [yearMonthB] = b[0].split('-');
      return yearMonthB.localeCompare(yearMonthA);
    });
    
    // Always show only the latest 6 months by default
    const latestSixMonths = sortedEntries.slice(0, 6);
    const olderMonths = sortedEntries.slice(6);
    
    // If showing all data, append older months after the latest 6
    if (showAllData) {
      return Object.fromEntries([...latestSixMonths, ...olderMonths]);
    }
    
    return Object.fromEntries(latestSixMonths);
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
          <View style={{ marginBottom: 10 }}>
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
  
  // Check if there are more than 6 months of data
  const hasOlderData = () => {
    const groups: { [key: string]: DastiKhata[] } = {};
    
    // Filter by payment status first
    const filteredByStatus = dastiKhatas.filter(khata => 
      activeTab === 'paid' ? khata.isPaid : !khata.isPaid
    );
    
    filteredByStatus.forEach(khata => {
      const date = new Date(khata.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      
      groups[monthYear].push(khata);
    });
    
    return Object.keys(groups).length > 6;
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <Logo size="medium" style={styles.logo} />
        <ThemedText type="title" style={styles.title}>{t.dastiKhataTitle}</ThemedText>
        <ThemedText style={styles.subtitle}>{t.dastiKhataSubtitle}</ThemedText>
      </ThemedView>

      <SearchInput
        placeholder={t.searchByName}
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#999"
      />
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'unpaid' && styles.activeTabButton]}
          onPress={() => setActiveTab('unpaid')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'unpaid' && styles.activeTabText]}>
            {t.unpaid || 'Unpaid'}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'paid' && styles.activeTabButton]}
          onPress={() => setActiveTab('paid')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'paid' && styles.activeTabText]}>
            {t.paid || 'Paid'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {search ? (
        <FlatList
          data={paginatedKhatas}
          keyExtractor={item => item.id}
          renderItem={renderDastiKhataItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={hasMoreItems ? (
            <TouchableOpacity 
              style={styles.loadMoreButton} 
              onPress={handleLoadMoreItems}
            >
              <ThemedText style={styles.loadMoreText}>{t.loadPrevious || 'Load Previous'}</ThemedText>
            </TouchableOpacity>
          ) : null}
        />
      ) : monthEntries.length > 0 ? (
        <View style={styles.listContainer}>
          <View style={styles.expandAllContainer}>
            <TouchableOpacity 
              style={styles.expandAllButton} 
              onPress={toggleExpandAll}
            >
              <ThemedText style={styles.expandAllText}>
                {expandAll ? t.collapseAll : t.expandAll}
              </ThemedText>
              <FontAwesome 
                name={expandAll ? 'chevron-up' : 'chevron-down'} 
                size={14} 
                color="#4A80F0" 
              />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={visibleMonthEntries.slice(0, visibleItems / 5)} // Approximate number of months to show based on item limit
            keyExtractor={([monthKey]) => monthKey}
            renderItem={renderMonthSection}
            contentContainerStyle={{ paddingBottom: 120 }}
            ListFooterComponent={
              <>  
                {hasMoreItems ? (
                  <TouchableOpacity 
                    style={styles.loadMoreButton} 
                    onPress={handleLoadMoreItems}
                  >
                    <ThemedText style={styles.loadMoreText}>{t.loadPrevious || 'Load Previous'}</ThemedText>
                  </TouchableOpacity>
                ) : null}
                
                {hasOlderData() && !showAllData ? (
                  <TouchableOpacity 
                    style={styles.loadMoreButton}
                    onPress={() => setShowAllData(true)}
                  >
                    <ThemedText style={styles.loadMoreText}>{t.loadPreviousData || 'Load Previous Data'}</ThemedText>
                  </TouchableOpacity>
                ) : null}
              </>
            }
          />
          
          {hasMoreMonths && (
            <TouchableOpacity 
              style={styles.loadMoreButton} 
              onPress={handleLoadMore}
            >
              <ThemedText style={styles.loadMoreText}>{t.loadMore}</ThemedText>
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
            <ModalTitle>{t.addNewDastiKhata}</ModalTitle>
            <StyledInput
              placeholder={t.personName}
              value={newName}
              onChangeText={setNewName}
              placeholderTextColor="#999"
            />
            <StyledInput
              placeholder={t.amount}
              keyboardType="numeric"
              value={newAmount}
              onChangeText={(text: string) => setNewAmount(text.replace(/[^0-9.]/g, ''))}
              placeholderTextColor="#999"
            />
            <StyledInput
              placeholder={t.description}
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
                <ThemedText style={{ color: '#000000', fontWeight: '600' }}>{t.cancel}</ThemedText>
              </ModalButton>
              <ModalButton 
                style={{ backgroundColor: '#4A80F0' }}
                onPress={handleAddDastiKhata}
              >
                <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>{t.add}</ThemedText>
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
              <ThemedText style={styles.datePickerTitle}>{t.selectDate}</ThemedText>
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
                <ThemedText style={{ color: '#333', fontWeight: '600' }}>{t.cancel}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.datePickerButton, { backgroundColor: '#4A80F0' }]}
                onPress={() => setShowDatePickerModal(false)}
              >
                <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>{t.confirm}</ThemedText>
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
            <ModalTitle>{t.confirmDelete}</ModalTitle>
            <ThemedText style={styles.confirmText}>
              {t.deleteConfirmText}
            </ThemedText>
            <ButtonsRow>
              <ModalButton
                style={{ backgroundColor: '#f0f0f0' }}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <ThemedText style={{ color: '#000000', fontWeight: '600' }}>{t.cancel}</ThemedText>
              </ModalButton>
              <ModalButton
                style={{ backgroundColor: '#e74c3c' }}
                onPress={handleDelete}
              >
                <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>{t.delete}</ThemedText>
              </ModalButton>
            </ButtonsRow>
          </ModalContainer>
        </View>
      </Modal>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#4A80F0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  activeTabButton: {
    backgroundColor: '#4A80F0',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A80F0',
  },
  activeTabText: {
    color: 'white',
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
    paddingBottom: 120, // Increased padding for FAB and better scrolling
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
    color: '#000000',
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
    color: '#000000',
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
  logo: {
    marginBottom: 16,
  },
});