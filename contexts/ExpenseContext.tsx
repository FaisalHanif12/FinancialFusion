import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Expense {
  id: string;
  date: Date;
  description: string;
  amount: number;
}

interface MonthlyExpenses {
  [key: string]: Expense[];
}

interface ExpenseContextType {
  expenses: Expense[];
  monthlyExpenses: MonthlyExpenses;
  loading: boolean;
  totalExpense: number;
  monthlyTotals: { [key: string]: number };
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpenses>({});
  const [monthlyTotals, setMonthlyTotals] = useState<{ [key: string]: number }>({});
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);

  const calculateMonthlyData = (expenseList: Expense[]) => {
    const grouped = expenseList.reduce((acc, expense) => {
      const date = new Date(expense.date);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(expense);
      return acc;
    }, {} as MonthlyExpenses);

    const totals = Object.entries(grouped).reduce((acc, [month, expenses]) => {
      acc[month] = expenses.reduce((sum, exp) => {
        const amount = typeof exp.amount === 'number' ? exp.amount : parseFloat(exp.amount) || 0;
        return sum + amount;
      }, 0);
      return acc;
    }, {} as { [key: string]: number });

    const total = Object.values(totals).reduce((sum, amount) => sum + amount, 0);

    setMonthlyExpenses(grouped);
    setMonthlyTotals(totals);
    setTotalExpense(total);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      // Check if migration is needed
      // const migrationNeeded = await DataMigration.checkMigrationNeeded();
      
      // if (migrationNeeded) {
      //   console.log('Expense data migration needed, starting migration...');
      //   const migrationResult = await DataMigration.migrateData();
        
      //   if (migrationResult.success) {
      //     console.log('Expense data migration completed successfully');
      //     const migratedExpenses = migrationResult.migratedData?.expenses || [];
      //     const parsedExpenses = migratedExpenses.map((expense: any) => ({
      //       ...expense,
      //       date: new Date(expense.date),
      //       amount: typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount) || 0
      //     }));
      //     setExpenses(parsedExpenses);
      //     calculateMonthlyData(parsedExpenses);
      //   } else {
      //     console.error('Expense data migration failed:', migrationResult.error);
      //     // Try to restore from backup
      //     const restoreResult = await DataMigration.restoreFromBackup();
      //     if (restoreResult.success) {
      //       console.log('Expense data restored from backup');
      //       const restoredExpenses = restoreResult.migratedData?.expenses || [];
      //       const parsedExpenses = restoredExpenses.map((expense: any) => ({
      //         ...expense,
      //         date: new Date(expense.date),
      //         amount: typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount) || 0
      //       }));
      //       setExpenses(parsedExpenses);
      //       calculateMonthlyData(parsedExpenses);
      //     } else {
      //       console.error('Expense backup restoration failed:', restoreResult.error);
      //       // Load original data as fallback
      //       const storedExpenses = await AsyncStorage.getItem('expenses');
      //       if (storedExpenses) {
      //         const parsedExpenses = JSON.parse(storedExpenses).map((expense: any) => ({
      //           ...expense,
      //           date: new Date(expense.date),
      //           amount: typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount) || 0
      //         }));
      //         setExpenses(parsedExpenses);
      //         calculateMonthlyData(parsedExpenses);
      //       }
      //     }
      //   }
      // } else {
        // No migration needed, load data normally
        const storedExpenses = await AsyncStorage.getItem('expenses');
        if (storedExpenses) {
          const parsedExpenses = JSON.parse(storedExpenses).map((expense: any) => ({
            ...expense,
            date: new Date(expense.date),
            amount: typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount) || 0
          }));
          setExpenses(parsedExpenses);
          calculateMonthlyData(parsedExpenses);
        }
      // }
    } catch (error) {
      // Error loading expenses
      // Try to restore from backup on error
      try {
        // const restoreResult = await DataMigration.restoreFromBackup();
        // if (restoreResult.success) {
        //   console.log('Expense data restored from backup after error');
        //   const restoredExpenses = restoreResult.migratedData?.expenses || [];
        //   const parsedExpenses = restoredExpenses.map((expense: any) => ({
        //     ...expense,
        //     date: new Date(expense.date),
        //     amount: typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount) || 0
        //   }));
        //   setExpenses(parsedExpenses);
        //   calculateMonthlyData(parsedExpenses);
        // }
              } catch (backupError) {
          // Expense backup restoration also failed
        }
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (newExpense: Omit<Expense, 'id'>) => {
    try {
      const expense: Expense = {
        ...newExpense,
        id: Date.now().toString(),
        amount: typeof newExpense.amount === 'number' ? newExpense.amount : parseFloat(newExpense.amount) || 0
      };

      const updatedExpenses = [...expenses, expense];
      await AsyncStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      setExpenses(updatedExpenses);
      calculateMonthlyData(updatedExpenses);
      
      // Create backup periodically
      const saveCount = await AsyncStorage.getItem('expense_save_count') || '0';
      const newCount = parseInt(saveCount) + 1;
      await AsyncStorage.setItem('expense_save_count', newCount.toString());
      
      // if (newCount % 10 === 0) {
      //   await DataMigration.createBackup();
      // }
    } catch (error) {
      // Error adding expense
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const updatedExpenses = expenses.filter(expense => expense.id !== id);
      await AsyncStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      setExpenses(updatedExpenses);
      calculateMonthlyData(updatedExpenses);
    } catch (error) {
      // Error deleting expense
      throw error;
    }
  };

  return (
    <ExpenseContext.Provider value={{ 
      expenses, 
      monthlyExpenses, 
      loading, 
      totalExpense, 
      monthlyTotals,
      addExpense, 
      deleteExpense 
    }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpense() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
}