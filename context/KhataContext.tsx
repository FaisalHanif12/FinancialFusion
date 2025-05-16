import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '@/contexts/AppContext';

// Define the Khata type
export interface Expense {
  id: string;
  date: string;
  source: string;
  amount: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'ADD_AMOUNT' | 'EXPENSE';
  description: string;
  amount: number;
  balanceAfter: number;
}

export interface Khata {
  id: string;
  name: string;
  date: string;
  totalAmount: number;
  expenses: Expense[];
  transactions: Transaction[];
}

// Define the context type
interface KhataContextType {
  khatas: Khata[];
  loading: boolean;
  addKhata: (khata: Omit<Khata, 'id' | 'expenses' | 'transactions'>) => Promise<void>;
  addExpense: (khataId: string, expense: Omit<Expense, 'id'>) => Promise<void>;
  addAmount: (khataId: string, amount: number, description?: string, date?: string) => Promise<void>;
  getKhata: (id: string) => Khata | undefined;
  deleteKhata: (id: string) => Promise<void>;
  deleteExpense: (khataId: string, expenseId: string) => Promise<void>;
  deleteTransaction: (khataId: string, transactionId: string) => Promise<void>;
}

// Create the context
export const KhataContext = createContext<KhataContextType>({
  khatas: [],
  loading: true,
  addKhata: async () => {},
  addExpense: async () => {},
  addAmount: async () => {},
  getKhata: () => undefined,
  deleteKhata: async () => {},
  deleteExpense: async () => {},
  deleteTransaction: async () => {},
});

// Create the provider component
interface KhataProviderProps {
  children: ReactNode;
}

export const KhataProvider: React.FC<KhataProviderProps> = ({ children }) => {
  const [khatas, setKhatas] = useState<Khata[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useAppContext();
  
  // Load khatas from AsyncStorage on initial render
  useEffect(() => {
    const loadKhatas = async () => {
      try {
        const storedKhatas = await AsyncStorage.getItem('khatas');
        if (storedKhatas) {
          setKhatas(JSON.parse(storedKhatas));
        }
      } catch (error) {
        console.error(`${t.error}: ${t.failedToLoadKhatas}`, error);
      } finally {
        setLoading(false);
      }
    };

    loadKhatas();
  }, [t]);

  // Save khatas to AsyncStorage whenever they change
  useEffect(() => {
    const saveKhatas = async () => {
      try {
        await AsyncStorage.setItem('khatas', JSON.stringify(khatas));
      } catch (error) {
        console.error(`${t.error}: ${t.failedToSaveKhatas}`, error);
      }
    };

    // Only save if we've loaded first (prevent overwriting with empty array)
    if (!loading) {
      saveKhatas();
    }
  }, [khatas, loading, t]);

  // Add a new khata
  const addKhata = async (khata: Omit<Khata, 'id' | 'expenses' | 'transactions'>) => {
    const newKhata: Khata = {
      ...khata,
      id: Date.now().toString(),
      expenses: [],
      transactions: [{
        id: Date.now().toString(),
        date: khata.date,
        type: 'ADD_AMOUNT',
        description: t.initialAmount,
        amount: khata.totalAmount,
        balanceAfter: khata.totalAmount
      }],
    };

    setKhatas((prevKhatas) => [...prevKhatas, newKhata]);
  };

  // Add an expense to a khata
  const addExpense = async (khataId: string, expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };

    setKhatas((prevKhatas) =>
      prevKhatas.map((khata) => {
        if (khata.id === khataId) {
          // Calculate new total amount after expense
          const newTotalAmount = khata.totalAmount - newExpense.amount;
          
          // Create transaction record
          const newTransaction: Transaction = {
            id: Date.now().toString(),
            date: expense.date,
            type: 'EXPENSE',
            description: expense.source,
            amount: expense.amount,
            balanceAfter: newTotalAmount
          };
          
          return {
            ...khata,
            totalAmount: newTotalAmount,
            expenses: Array.isArray(khata.expenses) ? [...khata.expenses, newExpense] : [newExpense],
            transactions: Array.isArray(khata.transactions) ? [...khata.transactions, newTransaction] : [newTransaction]
          };
        }
        return khata;
      })
    );
  };

  // Add amount to a khata
  const addAmount = async (khataId: string, amount: number, description: string = t.addedAmount, date: string = new Date().toISOString().split('T')[0]) => {
    setKhatas((prevKhatas) =>
      prevKhatas.map((khata) => {
        if (khata.id === khataId) {
          // Calculate new total amount after adding
          const newTotalAmount = khata.totalAmount + amount;
          
          // Create transaction record
          const newTransaction: Transaction = {
            id: Date.now().toString(),
            date: date,
            type: 'ADD_AMOUNT',
            description,
            amount,
            balanceAfter: newTotalAmount
          };
          
          return {
            ...khata,
            totalAmount: newTotalAmount,
            transactions: Array.isArray(khata.transactions) ? [...khata.transactions, newTransaction] : [newTransaction]
          };
        }
        return khata;
      })
    );
  };

  // Get a specific khata by ID
  const getKhata = (id: string) => {
    return khatas.find((khata) => khata.id === id);
  };

  // Delete a khata by ID
  const deleteKhata = async (id: string) => {
    setKhatas((prevKhatas) => prevKhatas.filter((khata) => khata.id !== id));
  };

  // Delete an expense from a khata
  const deleteExpense = async (khataId: string, expenseId: string) => {
    setKhatas((prevKhatas) =>
      prevKhatas.map((khata) => {
        if (khata.id === khataId) {
          // Find the expense to delete
          const expenseToDelete = khata.expenses.find(exp => exp.id === expenseId);
          if (!expenseToDelete) return khata;
          
          // Calculate new total amount by adding back the expense amount
          const newTotalAmount = khata.totalAmount + expenseToDelete.amount;
          
          // Remove the expense
          const updatedExpenses = khata.expenses.filter(exp => exp.id !== expenseId);
          
          // Also find and remove the corresponding transaction
          const updatedTransactions = khata.transactions.filter(trans => 
            !(trans.type === 'EXPENSE' && trans.id === expenseId)
          );
          
          return {
            ...khata,
            totalAmount: newTotalAmount,
            expenses: updatedExpenses,
            transactions: updatedTransactions
          };
        }
        return khata;
      })
    );
  };

  // Delete a transaction from a khata
  const deleteTransaction = async (khataId: string, transactionId: string) => {
    setKhatas((prevKhatas) =>
      prevKhatas.map((khata) => {
        if (khata.id === khataId) {
          // Find the transaction to delete
          const transactionToDelete = khata.transactions.find(trans => trans.id === transactionId);
          if (!transactionToDelete) return khata;
          
          let updatedExpenses = [...khata.expenses];
          let newTotalAmount = khata.totalAmount;
          
          // Adjust total amount based on transaction type
          if (transactionToDelete.type === 'ADD_AMOUNT') {
            // If adding amount, subtract it from total
            newTotalAmount = khata.totalAmount - transactionToDelete.amount;
          } else if (transactionToDelete.type === 'EXPENSE') {
            // If expense, add it back to total
            newTotalAmount = khata.totalAmount + transactionToDelete.amount;
            // Also remove the corresponding expense
            updatedExpenses = khata.expenses.filter(exp => exp.id !== transactionId);
          }
          
          // Remove the transaction
          const updatedTransactions = khata.transactions.filter(trans => trans.id !== transactionId);
          
          return {
            ...khata,
            totalAmount: newTotalAmount,
            expenses: updatedExpenses,
            transactions: updatedTransactions
          };
        }
        return khata;
      })
    );
  };

  return (
    <KhataContext.Provider value={{ 
      khatas, 
      loading, 
      addKhata, 
      addExpense, 
      addAmount, 
      getKhata, 
      deleteKhata,
      deleteExpense,
      deleteTransaction
    }}>
      {children}
    </KhataContext.Provider>
  );
};

// Custom hook to use the khata context
export const useKhata = () => {
  const context = useContext(KhataContext);
  if (context === undefined) {
    throw new Error('useKhata must be used within a KhataProvider');
  }
  return context;
}; 