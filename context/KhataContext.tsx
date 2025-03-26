import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the Khata type
export interface Expense {
  id: string;
  date: string;
  source: string;
  amount: number;
}

export interface Khata {
  id: string;
  name: string;
  date: string;
  totalAmount: number;
  expenses: Expense[];
}

// Define the context type
interface KhataContextType {
  khatas: Khata[];
  loading: boolean;
  addKhata: (khata: Omit<Khata, 'id' | 'expenses'>) => Promise<void>;
  addExpense: (khataId: string, expense: Omit<Expense, 'id'>) => Promise<void>;
  getKhata: (id: string) => Khata | undefined;
}

// Create the context
export const KhataContext = createContext<KhataContextType>({
  khatas: [],
  loading: true,
  addKhata: async () => {},
  addExpense: async () => {},
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
  const addKhata = async (khata: Omit<Khata, 'id' | 'expenses'>) => {
    const newKhata: Khata = {
      ...khata,
      id: Date.now().toString(),
      expenses: [],
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
          
          return {
            ...khata,
            totalAmount: newTotalAmount,
            expenses: [...khata.expenses, newExpense],
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
    <KhataContext.Provider value={{ khatas, loading, addKhata, addExpense, getKhata }}>
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