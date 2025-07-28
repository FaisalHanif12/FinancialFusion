import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { DataMigration } from '@/utils/DataMigration';

interface DataMigrationInitializerProps {
  children: React.ReactNode;
}

export const DataMigrationInitializer: React.FC<DataMigrationInitializerProps> = ({ children }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [migrationStatus, setMigrationStatus] = useState<string>('');

  useEffect(() => {
    const initializeDataMigration = async () => {
      try {
        setMigrationStatus('Checking for data migration...');
        
        // Check if migration is needed
        const migrationNeeded = await DataMigration.checkMigrationNeeded();
        
        if (migrationNeeded) {
          setMigrationStatus('Migrating data...');
          
          // Create backup before migration
          await DataMigration.createBackup();
          
          // Perform migration
          const migrationResult = await DataMigration.migrateData();
          
          if (migrationResult.success) {
            setMigrationStatus('Data migration completed successfully');
          } else {
            setMigrationStatus('Data migration failed, attempting backup restoration...');
            
            // Try to restore from backup
            const restoreResult = await DataMigration.restoreFromBackup();
            if (restoreResult.success) {
              setMigrationStatus('Data restored from backup');
            } else {
              setMigrationStatus('Data migration and backup restoration failed');
            }
          }
        } else {
          setMigrationStatus('No migration needed');
        }
      } catch (error) {
        console.error('Error during data migration initialization:', error);
        setMigrationStatus('Error during data migration');
      } finally {
        // Give a brief moment to show the status, then hide
        setTimeout(() => {
          setIsInitializing(false);
        }, 2000);
      }
    };

    initializeDataMigration();
  }, []);

  if (isInitializing) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            FinancialFusion
          </ThemedText>
          <ThemedText style={styles.status}>
            {migrationStatus}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return <React.Fragment>{children}</React.Fragment>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
}); 