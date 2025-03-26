import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  addAmount: (khataId: string, amount: number, description?: string) => Promise<void>;
  getKhata: (id: string) => Khata | undefined;
}

// Create the context
export const KhataContext = createContext<KhataContextType>({
  khatas: [],
  loading: true,
  addKhata: async () => {},
  addExpense: async () => {},
  addAmount: async () => {},
  getKhata: () => undefined,
});

// Create the provider component
interface KhataProviderProps {
  children: ReactNode;
}

export const KhataProvider: React.FC<KhataProviderProps> = ({ children }) => {
  const [khatas, setKhatas] = useState<Khata[]>([]);
  const [loading, setLoading] = useState(true);

  // Load khatas from AsyncStorage on initial render
  useEffect(() => {
    const loadKhatas = async () => {
      try {
        const storedKhatas = await AsyncStorage.getItem('khatas');
        if (storedKhatas) {
          setKhatas(JSON.parse(storedKhatas));
        }
      } catch (error) {
        console.error('Failed to load khatas from storage', error);
      } finally {
        setLoading(false);
      }
    };

    loadKhatas();
  }, []);

  // Save khatas to AsyncStorage whenever they change
  useEffect(() => {
    const saveKhatas = async () => {
      try {
        await AsyncStorage.setItem('khatas', JSON.stringify(khatas));
      } catch (error) {
        console.error('Failed to save khatas to storage', error);
      }
    };

    // Only save if we've loaded first (prevent overwriting with empty array)
    if (!loading) {
      saveKhatas();
    }
  }, [khatas, loading]);

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
        description: 'Initial amount',
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
  const addAmount = async (khataId: string, amount: number, description: string = 'Added amount') => {
    setKhatas((prevKhatas) =>
      prevKhatas.map((khata) => {
        if (khata.id === khataId) {
          // Calculate new total amount after adding
          const newTotalAmount = khata.totalAmount + amount;
          
          // Create transaction record
          const newTransaction: Transaction = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
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

  return (
    <KhataContext.Provider value={{ khatas, loading, addKhata, addExpense, addAmount, getKhata }}>
      {children}
    </KhataContext.Provider>
  );
};

// Custom hook to use the khata context
export const useKhata = () => {
  const context = React.useContext(KhataContext);
  if (context === undefined) {
    throw new Error('useKhata must be used within a KhataProvider');
  }
  return context;
}; 