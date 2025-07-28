import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedTextInput } from '@/components/ThemedTextInput';
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
  align-self: center;
  margin-top: 20%;
`;

export default function DastiKhataScreen() {
  const { t, isDark } = useAppContext();
  const router = useRouter();
  const [dastiKhatas, setDastiKhatas] = useState<DastiKhata[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'unpaid' | 'paid'>('unpaid');
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [newKhata, setNewKhata] = useState<Omit<DastiKhata, 'id'>>({
    name: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    isPaid: false,
    description: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [expandAll, setExpandAll] = useState(false);
  const [visibleItems, setVisibleItems] = useState(20);
  const [loadingMore, setLoadingMore] = useState(false);

  // Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const today = new Date().getDate();
  const currentMonthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });

  // Filter khatas based on search and active tab
  const filteredKhatas = dastiKhatas.filter(khata => {
    const matchesSearch = khata.name.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'paid' ? khata.isPaid : !khata.isPaid;
    return matchesSearch && matchesTab;
  });

  const paginatedKhatas = filteredKhatas.slice(0, visibleItems);
  const hasMoreItems = filteredKhatas.length > visibleItems;

  const markAsPaid = (id: string) => {
    setDastiKhatas(prev => prev.map(khata => 
      khata.id === id ? { ...khata, isPaid: !khata.isPaid } : khata
    ));
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      setDastiKhatas(prev => prev.filter(khata => khata.id !== itemToDelete));
      setDeleteModalVisible(false);
      setItemToDelete(null);
    }
  };

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'error') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleAddDastiKhata = () => {
    setNewKhata({
      name: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      isPaid: false,
      description: ''
    });
    setModalVisible(true);
  };

  const renderDastiKhataItem = ({ item }: { item: DastiKhata }) => (
    <Card key={item.id}>
      <View style={styles.cardHeader}>
        <DastiKhataName>{item.name}</DastiKhataName>
        <DastiKhataAmount isPaid={item.isPaid}>
          ₹{item.amount.toFixed(0)}
        </DastiKhataAmount>
      </View>
      <DastiKhataDate>{item.date}</DastiKhataDate>
      {item.description && (
        <ThemedText style={styles.description}>{item.description}</ThemedText>
      )}
      <Status isPaid={item.isPaid}>
        <StatusText isPaid={item.isPaid}>
          {item.isPaid ? t.paid : t.unpaid}
        </StatusText>
      </Status>
      <View style={styles.actionsRow}>
        <TouchableOpacity 
          style={[styles.actionButton, item.isPaid ? styles.paidButton : styles.unpaidButton]}
          onPress={() => markAsPaid(item.id)}
        >
          <FontAwesome 
            name={item.isPaid ? 'check-circle' : 'circle-o'} 
            size={16} 
            color={item.isPaid ? '#22A45D' : '#4A80F0'} 
          />
          <ThemedText style={[styles.actionText, item.isPaid ? styles.paidText : styles.unpaidText]}>
            {item.isPaid ? t.markAsPaid : t.markAsPaid}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
                        style={styles.deleteButtonPadding}
          onPress={() => confirmDelete(item.id)}
        >
          <FontAwesome name="trash" size={16} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </Card>
  );

  const handleLoadMoreItems = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleItems(prev => prev + 10);
      setLoadingMore(false);
    }, 1000);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome name="search" size={48} color="#ccc" style={styles.emptyIcon} />
      <ThemedText style={styles.emptyText}>
        {search ? 'No results found' : t.noDastiKhataYet}
      </ThemedText>
      <ThemedText style={styles.emptySubtext}>
        {search ? 'Try a different search term' : t.tapToAddDastiKhata}
      </ThemedText>
    </View>
  );

  const selectDate = (day: number) => {
    setSelectedDay(day);
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const goPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      if (date.getMonth() === currentMonth) {
        days.push(date.getDate());
      } else {
        days.push(null);
      }
    }
    return days;
  };

  const groupByMonth = () => {
    const groups: { [key: string]: DastiKhata[] } = {};
    dastiKhatas.forEach(khata => {
      const date = new Date(khata.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(khata);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  };

  const toggleMonthExpanded = (monthKey: string) => {
    // Implementation for expanding/collapsing months
  };

  const toggleExpandAll = () => {
    setExpandAll(!expandAll);
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleItems(prev => prev + 20);
      setLoadingMore(false);
    }, 1000);
  };

  const formatMonthDisplay = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const renderMonthSection = ({ item }: { item: [string, DastiKhata[]] }) => {
    const [monthKey, khatas] = item;
    const isExpanded = expandAll;
    
    return (
      <View key={monthKey} style={styles.monthSection}>
        <TouchableOpacity 
          style={styles.monthHeader}
          onPress={() => toggleMonthExpanded(monthKey)}
        >
          <ThemedText style={styles.monthTitle}>
            {formatMonthDisplay(monthKey)} ({khatas.length})
          </ThemedText>
          <FontAwesome 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={16} 
            color="#4A80F0" 
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.monthContent}>
            {khatas.map(khata => renderDastiKhataItem({ item: khata }))}
          </View>
        )}
      </View>
    );
  };

  const hasOlderData = () => {
    const filteredByStatus = dastiKhatas.filter(khata => {
      const matchesTab = activeTab === 'paid' ? khata.isPaid : !khata.isPaid;
      return matchesTab;
    });
    
    const groups: { [key: string]: DastiKhata[] } = {};
    
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

  const handleAddKhata = () => {
    if (!newKhata.name.trim()) {
      showAlert(t.error || 'Error', 'Please enter a name', 'error');
      return;
    }
    if (newKhata.amount <= 0) {
      showAlert(t.error || 'Error', 'Please enter a valid amount', 'error');
      return;
    }

    const khata: DastiKhata = {
      ...newKhata,
      id: Date.now().toString(),
      date: selectedDate
    };

    setDastiKhatas(prev => [khata, ...prev]);
    setModalVisible(false);
    showAlert(t.success || 'Success', 'Dasti Khata added successfully!', 'success');
  };

  const monthEntries = groupByMonth();
  const visibleMonthEntries = monthEntries.slice(0, Math.ceil(visibleItems / 5));

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
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
            {t.unpaid || 'UNPAID'}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'paid' && styles.activeTabButton]}
          onPress={() => setActiveTab('paid')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'paid' && styles.activeTabText]}>
            {t.paid || 'PAID'}
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
            data={visibleMonthEntries.slice(0, visibleItems / 5)}
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
                
                {loadingMore && (
                  <View style={styles.loadingContainer}>
                    <ThemedText style={styles.loadingText}>{t.loading || 'Loading...'}</ThemedText>
                  </View>
                )}
              </>
            }
          />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <FontAwesome name="handshake-o" size={48} color="#ccc" style={styles.emptyIcon} />
          <ThemedText style={styles.emptyText}>{t.noDastiKhataYet}</ThemedText>
          <ThemedText style={styles.emptySubtext}>{t.tapToAddDastiKhata}</ThemedText>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddDastiKhata}>
        <FontAwesome name="plus" size={20} color="white" />
      </TouchableOpacity>

      {/* Add Dasti Khata Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ModalContainer>
            <ThemedText type="title" style={styles.modalTitle}>
              {t.addNewDastiKhata}
            </ThemedText>
            
            <ThemedTextInput
              placeholder={t.personName}
              value={newKhata.name}
              onChangeText={(text) => setNewKhata({...newKhata, name: text})}
              style={styles.modalInput}
            />
            
            <ThemedTextInput
              placeholder={t.amount}
              value={newKhata.amount.toString()}
              onChangeText={(text) => setNewKhata({...newKhata, amount: parseFloat(text) || 0})}
              keyboardType="numeric"
              style={styles.modalInput}
            />
            
            <ThemedTextInput
              placeholder={t.description}
              value={newKhata.description}
              onChangeText={(text) => setNewKhata({...newKhata, description: text})}
              multiline
              numberOfLines={3}
              style={styles.modalInput}
            />

            <View style={styles.datePickerActions}>
              <TouchableOpacity 
                style={[styles.datePickerButton, { backgroundColor: '#4A80F0' }]}
                onPress={() => setShowDatePicker(true)}
              >
                <ThemedText style={{ color: 'white', fontWeight: '600' }}>
                  {t.selectDate}: {newKhata.date}
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <ThemedText style={styles.cancelButtonText}>{t.cancel}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddKhata}
              >
                <ThemedText style={styles.addButtonText}>{t.add}</ThemedText>
              </TouchableOpacity>
            </View>
          </ModalContainer>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <ModalContainer>
            <ThemedText type="title" style={styles.modalTitle}>
              {t.selectDate}
            </ThemedText>
            
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity style={styles.calendarNavButton} onPress={goPrevMonth}>
                  <FontAwesome name="chevron-left" size={16} color="#4A80F0" />
                </TouchableOpacity>
                <ThemedText style={styles.calendarTitle}>
                  {currentMonthName} {currentYear}
                </ThemedText>
                <TouchableOpacity style={styles.calendarNavButton} onPress={goNextMonth}>
                  <FontAwesome name="chevron-right" size={16} color="#4A80F0" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.weekdayHeader}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <ThemedText key={day} style={styles.weekdayText}>{day}</ThemedText>
                ))}
              </View>
              
              <View style={styles.calendarDays}>
                {generateCalendarDays().map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.calendarDay,
                      day === selectedDay && styles.selectedDay,
                      day === today && styles.todayDay,
                      !day && styles.emptyDay
                    ]}
                    onPress={() => day && selectDate(day)}
                    disabled={!day}
                  >
                    <ThemedText style={[
                      styles.calendarDayText,
                      day === selectedDay && styles.selectedDayText,
                      day === today && styles.todayDayText
                    ]}>
                      {day || ''}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.datePickerActions}>
              <TouchableOpacity 
                style={[styles.datePickerButton, { backgroundColor: '#999' }]}
                onPress={() => setShowDatePicker(false)}
              >
                <ThemedText style={{ color: 'white', fontWeight: '600' }}>
                  {t.cancel}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.datePickerButton, { backgroundColor: '#4A80F0' }]}
                onPress={() => {
                  setNewKhata({...newKhata, date: selectedDate});
                  setShowDatePicker(false);
                }}
              >
                <ThemedText style={{ color: 'white', fontWeight: '600' }}>
                  {t.confirm}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ModalContainer>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ModalContainer>
            <ThemedText type="title" style={styles.modalTitle}>
              {t.confirmDelete}
            </ThemedText>
            <ThemedText style={styles.modalText}>
              {t.deleteConfirmText}
            </ThemedText>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <ThemedText style={styles.cancelButtonText}>{t.cancel}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <ThemedText style={styles.deleteButtonText}>{t.delete}</ThemedText>
              </TouchableOpacity>
            </View>
          </ModalContainer>
        </View>
      </Modal>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
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
  header: {
    marginBottom: 24,
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeTabButton: {
    backgroundColor: '#4A80F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  listContainer: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  unpaidButton: {
    backgroundColor: 'rgba(74, 128, 240, 0.1)',
  },
  paidButton: {
    backgroundColor: 'rgba(34, 164, 93, 0.1)',
  },
  actionText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  unpaidText: {
    color: '#4A80F0',
  },
  paidText: {
    color: '#22A45D',
  },
  deleteButtonPadding: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A80F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  addButton: {
    backgroundColor: '#4A80F0',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.7,
  },
  expandAllContainer: {
    marginBottom: 16,
  },
  expandAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  expandAllText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
    color: '#4A80F0',
  },
  monthSection: {
    marginBottom: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  monthContent: {
    paddingLeft: 16,
  },
  loadMoreButton: {
    backgroundColor: '#4A80F0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  loadMoreText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
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
});