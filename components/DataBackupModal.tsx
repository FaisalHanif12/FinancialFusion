import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { useAppContext } from '@/contexts/AppContext';
import { DataMigration } from '@/utils/DataMigration';
import styled from 'styled-components/native';

interface DataBackupModalProps {
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
  max-width: 400px;
  padding: 20px;
  border-radius: 12px;
  elevation: 5;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
`;

const Button = styled(TouchableOpacity)`
  padding: 12px 20px;
  border-radius: 8px;
  margin-vertical: 8px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const PrimaryButton = styled(Button)`
  background-color: #007AFF;
`;

const SecondaryButton = styled(Button)`
  background-color: #34C759;
`;

const DangerButton = styled(Button)`
  background-color: #FF3B30;
`;

const WarningButton = styled(Button)`
  background-color: #FF9500;
`;

const ButtonText = styled(ThemedText)`
  color: white;
  font-weight: 600;
  margin-left: 8px;
`;

const InfoText = styled(ThemedText)`
  margin-vertical: 8px;
  text-align: center;
  opacity: 0.8;
`;

const BackupInfo = styled(ThemedView)`
  padding: 12px;
  border-radius: 8px;
  margin-vertical: 8px;
  background-color: rgba(52, 199, 89, 0.1);
  border: 1px solid rgba(52, 199, 89, 0.3);
`;

export const DataBackupModal: React.FC<DataBackupModalProps> = ({ visible, onClose }) => {
  const { t, isUrdu } = useAppContext();
  const [backupInfo, setBackupInfo] = useState<{ exists: boolean; timestamp?: number }>({ exists: false });
  const [importData, setImportData] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadBackupInfo();
    }
  }, [visible]);

  const loadBackupInfo = async () => {
    const info = await DataMigration.getBackupInfo();
    setBackupInfo(info);
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      await DataMigration.createBackup();
      await loadBackupInfo();
      Alert.alert(
        t.success || 'Success',
        t.backupCreatedSuccess || 'Backup created successfully',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        t.error || 'Error',
        t.failedToCreateBackup || 'Failed to create backup',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    Alert.alert(
      t.warning || 'Warning',
      t.restoreBackupWarning || 'This will replace all current data with the backup. Are you sure?',
      [
        { text: t.cancel || 'Cancel', style: 'cancel' },
        {
          text: t.restore || 'Restore',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await DataMigration.restoreFromBackup();
              if (result.success) {
                Alert.alert(
                  t.success || 'Success',
                  t.backupRestoredSuccess || 'Backup restored successfully. Please restart the app.',
                  [{ text: 'OK', onPress: () => onClose() }]
                );
              } else {
                Alert.alert(
                  t.error || 'Error',
                  result.error || t.failedToRestoreBackup || 'Failed to restore backup',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              Alert.alert(
                t.error || 'Error',
                t.failedToRestoreBackup || 'Failed to restore backup',
                [{ text: 'OK' }]
              );
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const exportString = await DataMigration.exportData();
      
      // Try to share the data
      try {
        await Share.share({
          message: exportString,
          title: 'FinancialFusion Data Export'
        });
      } catch (shareError) {
        // If sharing fails, show data in alert
        Alert.alert(
          t.success || 'Success',
          'Data exported successfully. Please copy the data manually.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Show the data in a simple alert
                Alert.alert(
                  'Exported Data',
                  exportString.substring(0, 500) + (exportString.length > 500 ? '...' : ''),
                  [{ text: 'OK' }]
                );
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        t.error || 'Error',
        t.failedToExportData || 'Failed to export data',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = async () => {
    if (!importData.trim()) {
      Alert.alert(
        t.error || 'Error',
        t.pleaseEnterImportData || 'Please enter the import data',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      t.warning || 'Warning',
      t.importDataWarning || 'This will replace all current data. Are you sure?',
      [
        { text: t.cancel || 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await DataMigration.importData(importData);
              if (result.success) {
                Alert.alert(
                  t.success || 'Success',
                  t.dataImportedSuccess || 'Data imported successfully. Please restart the app.',
                  [{ text: 'OK', onPress: () => onClose() }]
                );
              } else {
                Alert.alert(
                  t.error || 'Error',
                  result.error || t.failedToImportData || 'Failed to import data',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              Alert.alert(
                t.error || 'Error',
                t.failedToImportData || 'Failed to import data',
                [{ text: 'OK' }]
              );
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleClearBackup = async () => {
    Alert.alert(
      t.warning || 'Warning',
      t.clearBackupWarning || 'This will permanently delete the backup. Are you sure?',
      [
        { text: t.cancel || 'Cancel', style: 'cancel' },
        {
          text: t.delete || 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await DataMigration.clearBackup();
              await loadBackupInfo();
              Alert.alert(
                t.success || 'Success',
                t.backupClearedSuccess || 'Backup cleared successfully',
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert(
                t.error || 'Error',
                t.failedToClearBackup || 'Failed to clear backup',
                [{ text: 'OK' }]
              );
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const formatBackupDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <ModalContainer>
        <ModalContent>
          <ThemedText style={styles.modalTitle}>
            {t.backupRestore || 'Backup & Restore'}
          </ThemedText>
          <ThemedText style={styles.modalDescription}>
            {t.autoBackupDescription || 'Backup and restore your data'}
          </ThemedText>

          {/* Backup Info */}
          {backupInfo.exists && (
            <BackupInfo>
              <ThemedText style={styles.backupInfoText}>
                Last backup: {formatBackupDate(backupInfo.timestamp!)}
              </ThemedText>
            </BackupInfo>
          )}

          {/* Create Backup */}
          <PrimaryButton onPress={handleCreateBackup} disabled={loading}>
            <FontAwesome name="cloud-upload" size={18} color="white" />
            <ButtonText>Create Backup</ButtonText>
          </PrimaryButton>

          {/* Restore Backup */}
          <SecondaryButton onPress={handleRestoreBackup} disabled={loading}>
            <FontAwesome name="cloud-download" size={18} color="white" />
            <ButtonText>Restore Backup</ButtonText>
          </SecondaryButton>

          {/* Export Data */}
          <PrimaryButton onPress={handleExportData} disabled={loading}>
            <FontAwesome name="share" size={18} color="white" />
            <ButtonText>Export Data</ButtonText>
          </PrimaryButton>

          {/* Import Data */}
          <SecondaryButton onPress={handleImportData} disabled={loading}>
            <FontAwesome name="download" size={18} color="white" />
            <ButtonText>Import Data</ButtonText>
          </SecondaryButton>

          {/* Clear Backup */}
          <DangerButton onPress={handleClearBackup} disabled={loading}>
            <FontAwesome name="trash" size={18} color="white" />
            <ButtonText>Clear Backup</ButtonText>
          </DangerButton>

          {/* Close Button */}
          <WarningButton onPress={onClose}>
            <FontAwesome name="times" size={18} color="white" />
            <ButtonText>Close</ButtonText>
          </WarningButton>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  modalDescription: {
    textAlign: 'center',
    marginBottom: 16,
  },
  backupInfoText: {
    fontWeight: '600',
    color: '#34C759',
  },
  backupDateText: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  importSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  importInput: {
    marginBottom: 8,
    minHeight: 80,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: 'transparent',
  },
  closeButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
}); 