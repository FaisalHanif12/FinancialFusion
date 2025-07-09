import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Logo from '@/components/Logo';
import KhataCard from '@/components/KhataCard';
import CreateKhataModal from '@/components/CreateKhataModal';
import { useKhata } from '@/context/KhataContext';
import { FontAwesome } from '@expo/vector-icons';
import { useAppContext } from '@/contexts/AppContext';

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const { khatas, loading } = useKhata();
  const router = useRouter();
  const { t, isDark } = useAppContext();

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const renderEmptyState = () => (
    <ThemedView style={styles.emptyContainer}>
      <FontAwesome name="book" size={64} color={isDark ? "#444" : "#ccc"} style={styles.emptyIcon} />
      <ThemedText style={styles.emptyText}>{t.noKhataYet}</ThemedText>
      <ThemedText style={styles.emptySubtext}>
        {t.tapToCreateKhata}
      </ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <Logo size="large" style={styles.logo} />
        <ThemedText type="title" style={styles.title}>{t.financialFusion}</ThemedText>
        <ThemedText colorType="secondary" style={styles.subtitle}>{t.manageKhata}</ThemedText>
      </ThemedView>

      {loading ? (
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>{t.loading}</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={khatas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <KhataCard khata={item} />}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={openModal}>
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Create Khata Modal */}
      <CreateKhataModal visible={modalVisible} onClose={closeModal} />
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
  logo: {
    marginBottom: 12,
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
  listContainer: {
    flexGrow: 1,
    paddingBottom: 80, // Space for FAB
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});
