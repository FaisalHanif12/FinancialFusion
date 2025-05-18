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
      acc[month] = expenses.reduce((sum, exp) => sum + exp.amount, 0);
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
      const storedExpenses = await AsyncStorage.getItem('expenses');
      if (storedExpenses) {
        const parsedExpenses = JSON.parse(storedExpenses).map((expense: any) => ({
          ...expense,
          date: new Date(expense.date)
        }));
        setExpenses(parsedExpenses);
        calculateMonthlyData(parsedExpenses);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (newExpense: Omit<Expense, 'id'>) => {
    try {
      const expense: Expense = {
        ...newExpense,
        id: Date.now().toString(),
      };

      const updatedExpenses = [...expenses, expense];
      await AsyncStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      setExpenses(updatedExpenses);
      calculateMonthlyData(updatedExpenses);
    } catch (error) {
      console.error('Error adding expense:', error);
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
      console.error('Error deleting expense:', error);
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