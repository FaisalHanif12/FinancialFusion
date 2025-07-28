import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppContext } from '@/contexts/AppContext';
import { DataMigration } from '@/utils/DataMigration';
import styled from 'styled-components/native';

interface BackupInfo {
  timestamp: number;
  khatasCount: number;
  expensesCount: number;
  totalDataSize: number;
}

interface DataStats {
  totalKhatas: number;
  totalExpenses: number;
  totalTransactions: number;
  lastBackupDate?: number;
  autoBackupEnabled: boolean;
}

const Card = styled(ThemedView)`
  background-color: ${(props: any) => props.theme.colors.card};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3.84px;
`;

const SectionTitle = styled(ThemedText)`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
`;

const StatRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-vertical: 8px;
  border-bottom-width: 1px;
  border-bottom-color: ${(props: any) => props.theme.colors.border};
`;

const StatLabel = styled(ThemedText)`
  font-size: 14px;
  opacity: 0.8;
`;

const StatValue = styled(ThemedText)`
  font-size: 14px;
  font-weight: 600;
`;

const ActionButton = styled(TouchableOpacity)`
  background-color: #007AFF;
  padding: 12px 16px;
  border-radius: 8px;
  margin-vertical: 4px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const DangerButton = styled(TouchableOpacity)`
  background-color: #FF3B30;
  padding: 12px 16px;
  border-radius: 8px;
  margin-vertical: 4px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const SuccessButton = styled(TouchableOpacity)`
  background-color: #34C759;
  padding: 12px 16px;
  border-radius: 8px;
  margin-vertical: 4px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const ButtonText = styled(ThemedText)`
  color: white;
  font-weight: 600;
  margin-left: 8px;
`;

const BackupItem = styled(View)`
  padding: 12px;
  border-radius: 8px;
  margin-vertical: 4px;
  background-color: ${(props: any) => props.theme.colors.background};
  border: 1px solid ${(props: any) => props.theme.colors.border};
`;

const Switch = styled(TouchableOpacity)<{ enabled: boolean }>`
  width: 50px;
  height: 30px;
  border-radius: 15px;
  background-color: ${(props: any) => props.enabled ? '#34C759' : '#767577'};
  padding: 2px;
  justify-content: center;
`;

const SwitchThumb = styled(View)<{ enabled: boolean }>`
  width: 26px;
  height: 26px;
  border-radius: 13px;
  background-color: white;
  margin-left: ${(props: any) => props.enabled ? '20px' : '0px'};
`;

export const DataManagementSection: React.FC = () => {
  const { t, isDark } = useAppContext();
  const [dataStats, setDataStats] = useState<DataStats>({
    totalKhatas: 0,
    totalExpenses: 0,
    totalTransactions: 0,
    autoBackupEnabled: true
  });
  const [backupHistory, setBackupHistory] = useState<BackupInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDataStats();
    loadBackupHistory();
  }, []);

  const loadDataStats = async () => {
    try {
      const khatas = await AsyncStorage.getItem('khatas');
      const expenses = await AsyncStorage.getItem('expenses');
      const autoBackup = await AsyncStorage.getItem('auto_backup_enabled');
      const lastBackup = await AsyncStorage.getItem('last_backup_date');

      const khatasData = khatas ? JSON.parse(khatas) : [];
      const expensesData = expenses ? JSON.parse(expenses) : [];

      let totalTransactions = 0;
      khatasData.forEach((khata: any) => {
        if (Array.isArray(khata.transactions)) {
          totalTransactions += khata.transactions.length;
        }
      });

      setDataStats({
        totalKhatas: khatasData.length,
        totalExpenses: expensesData.length,
        totalTransactions,
        lastBackupDate: lastBackup ? parseInt(lastBackup) : undefined,
        autoBackupEnabled: autoBackup !== 'false'
      });
    } catch (error) {
      console.error('Error loading data stats:', error);
    }
  };

  const loadBackupHistory = async () => {
    try {
      const backupTimestamp = await AsyncStorage.getItem('backup_timestamp');
      const backupKhatas = await AsyncStorage.getItem('backup_khatas');
      const backupExpenses = await AsyncStorage.getItem('backup_expenses');

      if (backupTimestamp && backupKhatas) {
        const khatasData = JSON.parse(backupKhatas);
        const expensesData = backupExpenses ? JSON.parse(backupExpenses) : [];
        
        const backupInfo: BackupInfo = {
          timestamp: parseInt(backupTimestamp),
          khatasCount: khatasData.length,
          expensesCount: expensesData.length,
          totalDataSize: JSON.stringify({ khatas: khatasData, expenses: expensesData }).length
        };

        setBackupHistory([backupInfo]);
      }
    } catch (error) {
      console.error('Error loading backup history:', error);
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      await DataMigration.createBackup();
      await AsyncStorage.setItem('last_backup_date', Date.now().toString());
      await loadDataStats();
      await loadBackupHistory();
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
                  [{ text: 'OK' }]
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

  const handleToggleAutoBackup = async () => {
    const newValue = !dataStats.autoBackupEnabled;
    await AsyncStorage.setItem('auto_backup_enabled', newValue.toString());
    setDataStats(prev => ({ ...prev, autoBackupEnabled: newValue }));
  };

  const handleClearAllData = async () => {
    Alert.alert(
      t.warning || 'Warning',
      'This will permanently delete all your data. This action cannot be undone. Are you sure?',
      [
        { text: t.cancel || 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'khatas', 'expenses', 'theme', 'language', 'backup_khatas',
                'backup_expenses', 'backup_timestamp', 'last_backup_date'
              ]);
              Alert.alert(
                t.success || 'Success',
                'All data has been cleared. Please restart the app.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert(
                t.error || 'Error',
                'Failed to clear data',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Data Statistics */}
      <Card>
        <SectionTitle>{t.dataStatistics || 'Data Statistics'}</SectionTitle>
        
        <StatRow>
          <StatLabel>{t.totalKhatas || 'Total Khatas'}</StatLabel>
          <StatValue>{dataStats.totalKhatas}</StatValue>
        </StatRow>
        
        <StatRow>
          <StatLabel>{t.totalExpenses || 'Total Expenses'}</StatLabel>
          <StatValue>{dataStats.totalExpenses}</StatValue>
        </StatRow>
        
        <StatRow>
          <StatLabel>{t.totalTransactions || 'Total Transactions'}</StatLabel>
          <StatValue>{dataStats.totalTransactions}</StatValue>
        </StatRow>
        
        {dataStats.lastBackupDate && (
          <StatRow>
            <StatLabel>{t.lastBackup || 'Last Backup'}</StatLabel>
            <StatValue>{formatDate(dataStats.lastBackupDate)}</StatValue>
          </StatRow>
        )}
      </Card>

      {/* Auto Backup Settings */}
      <Card>
        <SectionTitle>{t.autoBackupSettings || 'Auto Backup Settings'}</SectionTitle>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <FontAwesome name="shield" size={20} color={isDark ? '#fff' : '#000'} />
            <ThemedText style={styles.settingText}>
              {t.autoBackupEnabled || 'Auto Backup Enabled'}
            </ThemedText>
          </View>
          <TouchableOpacity onPress={handleToggleAutoBackup}>
            <Switch enabled={dataStats.autoBackupEnabled}>
              <SwitchThumb enabled={dataStats.autoBackupEnabled} />
            </Switch>
          </TouchableOpacity>
        </View>
        
        <ThemedText style={styles.settingDescription}>
          {t.autoBackupDescription || 'Automatically create backups when app updates are available'}
        </ThemedText>
      </Card>

      {/* Manual Backup Actions */}
      <Card>
        <SectionTitle>{t.manualBackup || 'Manual Backup'}</SectionTitle>
        
        <ActionButton onPress={handleCreateBackup} disabled={loading}>
          <FontAwesome name="save" size={16} color="white" />
          <ButtonText>{t.createBackup || 'Create Backup'}</ButtonText>
        </ActionButton>

        {backupHistory.length > 0 && (
          <SuccessButton onPress={handleRestoreBackup} disabled={loading}>
            <FontAwesome name="download" size={16} color="white" />
            <ButtonText>{t.restoreBackup || 'Restore Backup'}</ButtonText>
          </SuccessButton>
        )}
      </Card>

      {/* Backup History */}
      {backupHistory.length > 0 && (
        <Card>
          <SectionTitle>{t.backupHistory || 'Backup History'}</SectionTitle>
          
          {backupHistory.map((backup, index) => (
            <BackupItem key={index}>
              <View style={styles.backupHeader}>
                <FontAwesome name="clock-o" size={16} color={isDark ? '#fff' : '#000'} />
                <ThemedText style={styles.backupDate}>
                  {formatDate(backup.timestamp)}
                </ThemedText>
              </View>
              
              <View style={styles.backupStats}>
                <ThemedText style={styles.backupStat}>
                  {t.khatas || 'Khatas'}: {backup.khatasCount}
                </ThemedText>
                <ThemedText style={styles.backupStat}>
                  {t.expenses || 'Expenses'}: {backup.expensesCount}
                </ThemedText>
                <ThemedText style={styles.backupStat}>
                  {t.dataSize || 'Size'}: {formatFileSize(backup.totalDataSize)}
                </ThemedText>
              </View>
            </BackupItem>
          ))}
        </Card>
      )}

      {/* Danger Zone */}
      <Card>
        <SectionTitle style={{ color: '#FF3B30' }}>
          {t.dangerZone || 'Danger Zone'}
        </SectionTitle>
        
        <DangerButton onPress={handleClearAllData}>
          <FontAwesome name="trash" size={16} color="white" />
          <ButtonText>{t.clearAllData || 'Clear All Data'}</ButtonText>
        </DangerButton>
        
        <ThemedText style={styles.dangerDescription}>
          {t.dangerZoneDescription || 'These actions cannot be undone. Use with caution.'}
        </ThemedText>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 10,
    fontSize: 16,
  },
  settingDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  backupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backupDate: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  backupStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backupStat: {
    fontSize: 12,
    opacity: 0.8,
  },
  dangerDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
  },
}); 