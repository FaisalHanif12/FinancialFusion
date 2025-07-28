import AsyncStorage from '@react-native-async-storage/async-storage';

// Define data structure versions
export interface DataVersion {
  version: string;
  timestamp: number;
}

export interface MigrationResult {
  success: boolean;
  migratedData?: any;
  error?: string;
}

// Current app version - update this when making breaking changes
const CURRENT_DATA_VERSION = '1.0.0';

// Storage keys
const STORAGE_KEYS = {
  KHATAS: 'khatas',
  EXPENSES: 'expenses',
  THEME: 'theme',
  LANGUAGE: 'language',
  DATA_VERSION: 'data_version',
  BACKUP_KHATAS: 'backup_khatas',
  BACKUP_EXPENSES: 'backup_expenses',
  BACKUP_TIMESTAMP: 'backup_timestamp'
};

export class DataMigration {
  // Check if data migration is needed
  static async checkMigrationNeeded(): Promise<boolean> {
    try {
      const storedVersion = await AsyncStorage.getItem(STORAGE_KEYS.DATA_VERSION);
      return storedVersion !== CURRENT_DATA_VERSION;
    } catch (error) {
      // Error checking migration status
      return false;
    }
  }

  // Create backup of current data
  static async createBackup(): Promise<void> {
    try {
      const khatas = await AsyncStorage.getItem(STORAGE_KEYS.KHATAS);
      const expenses = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);
      const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      const language = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);

      const backupData = {
        khatas: khatas ? JSON.parse(khatas) : [],
        expenses: expenses ? JSON.parse(expenses) : [],
        theme: theme || 'dark',
        language: language || 'en',
        timestamp: Date.now()
      };

      await AsyncStorage.setItem(STORAGE_KEYS.BACKUP_KHATAS, JSON.stringify(backupData.khatas));
      await AsyncStorage.setItem(STORAGE_KEYS.BACKUP_EXPENSES, JSON.stringify(backupData.expenses));
      await AsyncStorage.setItem(STORAGE_KEYS.BACKUP_TIMESTAMP, backupData.timestamp.toString());

      // Backup created successfully
    } catch (error) {
      // Error creating backup
    }
  }

  // Restore data from backup
  static async restoreFromBackup(): Promise<MigrationResult> {
    try {
      const backupKhatas = await AsyncStorage.getItem(STORAGE_KEYS.BACKUP_KHATAS);
      const backupExpenses = await AsyncStorage.getItem(STORAGE_KEYS.BACKUP_EXPENSES);
      const backupTimestamp = await AsyncStorage.getItem(STORAGE_KEYS.BACKUP_TIMESTAMP);

      if (!backupKhatas && !backupExpenses) {
        return { success: false, error: 'No backup data found' };
      }

      const restoredData = {
        khatas: backupKhatas ? JSON.parse(backupKhatas) : [],
        expenses: backupExpenses ? JSON.parse(backupExpenses) : [],
        timestamp: backupTimestamp ? parseInt(backupTimestamp) : Date.now()
      };

      // Restore the data
      await AsyncStorage.setItem(STORAGE_KEYS.KHATAS, JSON.stringify(restoredData.khatas));
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(restoredData.expenses));

      return { success: true, migratedData: restoredData };
    } catch (error) {
      // Error restoring from backup
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Migrate data to current version
  static async migrateData(): Promise<MigrationResult> {
    try {
      // Create backup before migration
      await this.createBackup();

      // Load current data
      const khatas = await AsyncStorage.getItem(STORAGE_KEYS.KHATAS);
      const expenses = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);

      let migratedKhatas = [];
      let migratedExpenses = [];

      // Migrate khatas data
      if (khatas) {
        const parsedKhatas = JSON.parse(khatas);
        migratedKhatas = this.migrateKhatasData(parsedKhatas);
      }

      // Migrate expenses data
      if (expenses) {
        const parsedExpenses = JSON.parse(expenses);
        migratedExpenses = this.migrateExpensesData(parsedExpenses);
      }

      // Save migrated data
      await AsyncStorage.setItem(STORAGE_KEYS.KHATAS, JSON.stringify(migratedKhatas));
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(migratedExpenses));
      await AsyncStorage.setItem(STORAGE_KEYS.DATA_VERSION, CURRENT_DATA_VERSION);

      return {
        success: true,
        migratedData: {
          khatas: migratedKhatas,
          expenses: migratedExpenses
        }
      };
    } catch (error) {
      // Error during data migration
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Migrate khatas data structure
  private static migrateKhatasData(khatas: any[]): any[] {
    return khatas.map(khata => {
      // Ensure all required fields exist
      const migratedKhata = {
        id: khata.id || Date.now().toString(),
        name: khata.name || '',
        date: khata.date || new Date().toISOString().split('T')[0],
        totalAmount: typeof khata.totalAmount === 'number' ? khata.totalAmount : parseFloat(khata.totalAmount) || 0,
        expenses: Array.isArray(khata.expenses) ? khata.expenses.map((expense: any) => ({
          id: expense.id || Date.now().toString(),
          date: expense.date || new Date().toISOString().split('T')[0],
          source: expense.source || '',
          amount: typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount) || 0
        })) : [],
        transactions: Array.isArray(khata.transactions) ? khata.transactions.map((transaction: any) => ({
          id: transaction.id || Date.now().toString(),
          date: transaction.date || new Date().toISOString().split('T')[0],
          type: transaction.type || 'ADD_AMOUNT',
          description: transaction.description || '',
          amount: typeof transaction.amount === 'number' ? transaction.amount : parseFloat(transaction.amount) || 0,
          balanceAfter: typeof transaction.balanceAfter === 'number' ? transaction.balanceAfter : parseFloat(transaction.balanceAfter) || 0
        })) : []
      };

      return migratedKhata;
    });
  }

  // Migrate expenses data structure
  private static migrateExpensesData(expenses: any[]): any[] {
    return expenses.map(expense => {
      return {
        id: expense.id || Date.now().toString(),
        date: expense.date ? new Date(expense.date) : new Date(),
        description: expense.description || '',
        amount: typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount) || 0
      };
    });
  }

  // Get backup info
  static async getBackupInfo(): Promise<{ exists: boolean; timestamp?: number }> {
    try {
      const backupTimestamp = await AsyncStorage.getItem(STORAGE_KEYS.BACKUP_TIMESTAMP);
      return {
        exists: !!backupTimestamp,
        timestamp: backupTimestamp ? parseInt(backupTimestamp) : undefined
      };
    } catch (error) {
      // Error getting backup info
      return { exists: false };
    }
  }

  // Clear backup data
  static async clearBackup(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.BACKUP_KHATAS,
        STORAGE_KEYS.BACKUP_EXPENSES,
        STORAGE_KEYS.BACKUP_TIMESTAMP
      ]);
    } catch (error) {
      // Error clearing backup
    }
  }

  // Export data for backup
  static async exportData(): Promise<string> {
    try {
      const khatas = await AsyncStorage.getItem(STORAGE_KEYS.KHATAS);
      const expenses = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);
      const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      const language = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);

      const exportData = {
        version: CURRENT_DATA_VERSION,
        timestamp: Date.now(),
        data: {
          khatas: khatas ? JSON.parse(khatas) : [],
          expenses: expenses ? JSON.parse(expenses) : [],
          theme: theme || 'dark',
          language: language || 'en'
        }
      };

      return JSON.stringify(exportData);
    } catch (error) {
      // Error exporting data
      throw error;
    }
  }

  // Import data from backup
  static async importData(importString: string): Promise<MigrationResult> {
    try {
      const importData = JSON.parse(importString);
      
      if (!importData.data || !importData.version) {
        return { success: false, error: 'Invalid import data format' };
      }

      // Create backup before import
      await this.createBackup();

      // Import the data
      await AsyncStorage.setItem(STORAGE_KEYS.KHATAS, JSON.stringify(importData.data.khatas || []));
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(importData.data.expenses || []));
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, importData.data.theme || 'dark');
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, importData.data.language || 'en');
      await AsyncStorage.setItem(STORAGE_KEYS.DATA_VERSION, CURRENT_DATA_VERSION);

      return { success: true, migratedData: importData.data };
    } catch (error) {
      // Error importing data
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
} 