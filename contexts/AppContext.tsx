import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useColorScheme, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for our context
type ThemeType = 'light' | 'dark';
type LanguageType = 'en' | 'ur';

// Global translations
export const translations = {
  en: {
    // Common
    currency: '₹',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    
    // Tabs
    home: 'Home',
    dastiKhata: 'Dasti Khata',
    expenses: 'Expenses',
    settings: 'Settings',
    
    // Home Screen
    financialFusion: 'FinancialFusion',
    manageKhata: 'Manage your Khata effortlessly',
    noKhataYet: 'No Khata Yet',
    tapToCreateKhata: 'Tap the "Create Khata" button below to get started',
    createKhata: 'Create Khata',
    khataName: 'Khata Name',
    khataDescription: 'Description (optional)',
    create: 'Create',
    
    // Dasti Khata
    dastiKhataTitle: 'Dasti Khata',
    dastiKhataSubtitle: 'Manage your lent and borrowed money',
    searchByName: 'Search by name...',
    created: 'Created on',
    paid: 'PAID',
    unpaid: 'UNPAID',
    markAsPaid: 'Mark as Paid',
    borrowedFor: 'Borrowed for',
    lentFor: 'Lent for',
    expandAll: 'Expand All',
    collapseAll: 'Collapse All',
    loadMore: 'Load More',
    addNewDastiKhata: 'Add New Dasti Khata',
    personName: 'Person\'s Name',
    amount: 'Amount',
    description: 'Description (optional)',
    selectDate: 'Select Date',
    cancel: 'Cancel',
    add: 'Add',
    confirmDelete: 'Confirm Delete',
    deleteConfirmText: 'Are you sure you want to delete this Dasti Khata?',
    delete: 'Delete',
    noDastiKhataYet: 'No Dasti Khata Yet',
    tapToAddDastiKhata: 'Tap the "+" button below to add a new Dasti Khata',
    confirm: 'Confirm',
    
    // Expenses
    expensesTitle: 'Expenses',
    expensesSubtitle: 'Track your expenses',
    noExpensesYet: 'No Expenses Yet',
    tapToAddExpense: 'Tap the "+" button below to add a new expense',
    addExpense: 'Add Expense',
    back: 'Back',
    sourceOfExpense: 'Source of Expense',
    expensePlaceholder: 'e.g., Groceries, Rent, etc.',
    expenseAmount: 'Expense Amount',
    enterAmount: 'Enter amount',
    date: 'Date',
    tapToChange: 'Tap to change',
    availableBalance: 'Available Balance',
    history: 'History',
    noTransactionHistory: 'No Transaction History',
    transactionHistoryText: 'Transaction history will appear here as you add amounts and expenses',
    net: 'Net',
    
    // Settings
    settingsTitle: 'Settings',
    managePreferences: 'Manage your app preferences',
    language: 'Language',
    languageDesc: 'Switch between English and Urdu',
    english: 'English',
    urdu: 'Urdu',
    theme: 'Theme',
    themeDesc: 'Toggle between light and dark mode',
    dark: 'Dark',
    light: 'Light',
    
    // Khata related
    initialAmount: 'Initial amount',
    addedAmount: 'Added amount',
    failedToLoadKhatas: 'Failed to load khatas from storage',
    failedToSaveKhatas: 'Failed to save khatas to storage',
    failedToDeleteKhata: 'Failed to delete khata',
    useKhataError: 'useKhata must be used within a KhataProvider',
    
    // Alert messages
    enterValidAmount: 'Please enter a valid amount',
    amountAddedSuccess: 'Amount added successfully!',
    failedToAddAmount: 'Failed to add amount',
    itemDeletedSuccess: 'Item deleted successfully',
    failedToDeleteItem: 'Failed to delete item',
    khataNotFound: 'Khata not found',
    fillAllFields: 'Please fill in all fields',
    expenseAddedSuccess: 'Expense added successfully!',
    failedToAddExpense: 'Failed to add expense'
  },
  ur: {
    // Common
    currency: '₹',
    loading: 'لوڈ ہو رہا ہے...',
    error: 'خرابی',
    success: 'کامیابی',
    warning: 'انتباہ',
    info: 'معلومات',
    
    // Tabs
    home: 'ہوم',
    dastiKhata: 'دستی کھاتہ',
    expenses: 'اخراجات',
    settings: 'ترتیبات',
    
    // Home Screen
    financialFusion: 'فنانشل فیوژن',
    manageKhata: 'اپنا کھاتہ آسانی سے منظم کریں',
    noKhataYet: 'ابھی تک کوئی کھاتہ نہیں',
    tapToCreateKhata: 'شروع کرنے کے لیے نیچے "کھاتہ بنائیں" بٹن پر تھپتھپائیں',
    createKhata: 'کھاتہ بنائیں',
    khataName: 'کھاتہ کا نام',
    khataDescription: 'تفصیل (اختیاری)',
    create: 'بنائیں',
    
    // Dasti Khata
    dastiKhataTitle: 'دستی کھاتہ',
    dastiKhataSubtitle: 'اپنے قرض اور ادھار کا انتظام کریں',
    searchByName: 'نام سے تلاش کریں...',
    created: 'تاریخ',
    paid: 'ادا کیا گیا',
    unpaid: 'غیر ادا شدہ',
    markAsPaid: 'ادا شدہ کے طور پر نشان زد کریں',
    borrowedFor: 'کے لیے ادھار لیا',
    lentFor: 'کے لیے ادھار دیا',
    expandAll: 'سب کو پھیلائیں',
    collapseAll: 'سب کو سکیڑیں',
    loadMore: 'مزید لوڈ کریں',
    addNewDastiKhata: 'نیا دستی کھاتہ شامل کریں',
    personName: 'شخص کا نام',
    amount: 'رقم',
    description: 'تفصیل (اختیاری)',
    selectDate: 'تاریخ منتخب کریں',
    cancel: 'منسوخ کریں',
    add: 'شامل کریں',
    confirmDelete: 'حذف کی تصدیق کریں',
    deleteConfirmText: 'کیا آپ واقعی اس دستی کھاتہ کو حذف کرنا چاہتے ہیں؟',
    delete: 'حذف کریں',
    noDastiKhataYet: 'ابھی تک کوئی دستی کھاتہ نہیں',
    tapToAddDastiKhata: 'نیا دستی کھاتہ شامل کرنے کے لیے نیچے "+" بٹن پر ٹیپ کریں',
    confirm: 'تصدیق کریں',
    
    // Expenses
    expensesTitle: 'اخراجات',
    expensesSubtitle: 'اپنے اخراجات کا حساب رکھیں',
    noExpensesYet: 'ابھی تک کوئی اخراجات نہیں',
    tapToAddExpense: 'نیا خرچہ شامل کرنے کے لیے نیچے "+" بٹن پر ٹیپ کریں',
    addExpense: 'خرچہ شامل کریں',
    back: 'واپس',
    sourceOfExpense: 'خرچے کا ذریعہ',
    expensePlaceholder: 'مثال، راشن، کرایہ، وغیرہ',
    expenseAmount: 'خرچے کی رقم',
    enterAmount: 'رقم درج کریں',
    date: 'تاریخ',
    tapToChange: 'تبدیل کرنے کے لیے تھپتھپائیں',
    availableBalance: 'دستیاب بیلنس',
    history: 'تاریخچہ',
    noTransactionHistory: 'کوئی لین دین کی تاریخ نہیں',
    transactionHistoryText: 'جیسے ہی آپ رقم اور اخراجات شامل کرتے ہیں، لین دین کی تاریخ یہاں دکھائی دے گی',
    net: 'نیٹ',
    
    // Settings
    settingsTitle: 'ترتیبات',
    managePreferences: 'اپنی ایپ کی ترجیحات کا نظم کریں',
    language: 'زبان',
    languageDesc: 'انگریزی اور اردو کے درمیان سوئچ کریں',
    english: 'انگریزی',
    urdu: 'اردو',
    theme: 'تھیم',
    themeDesc: 'لائٹ اور ڈارک موڈ کے درمیان ٹوگل کریں',
    dark: 'ڈارک',
    light: 'لائٹ',
    
    // Khata related
    initialAmount: 'ابتدائی رقم',
    addedAmount: 'شامل کردہ رقم',
    failedToLoadKhatas: 'اسٹوریج سے کھاتہ لوڈ کرنے میں ناکام',
    failedToSaveKhatas: 'اسٹوریج میں کھاتہ محفوظ کرنے میں ناکام',
    failedToDeleteKhata: 'کھاتہ حذف کرنے میں ناکام',
    useKhataError: 'useKhata کو KhataProvider کے اندر استعمال کیا جانا چاہیے',
    
    // Alert messages
    enterValidAmount: 'برائے مہربانی ایک درست رقم درج کریں',
    amountAddedSuccess: 'رقم کامیابی سے شامل کر دی گئی!',
    failedToAddAmount: 'رقم شامل کرنے میں ناکام',
    itemDeletedSuccess: 'آئٹم کامیابی سے حذف کر دیا گیا',
    failedToDeleteItem: 'آئٹم حذف کرنے میں ناکام',
    khataNotFound: 'کھاتہ نہیں ملا',
    fillAllFields: 'برائے مہربانی تمام فیلڈز کو پُر کریں',
    expenseAddedSuccess: 'خرچہ کامیابی سے شامل کر دیا گیا!',
    failedToAddExpense: 'خرچہ شامل کرنے میں ناکام'
  }
};

// This mapping helps transliterate between English and Urdu characters
const englishToUrduMapping: { [key: string]: string } = {
  'a': 'ا',
  'b': 'ب',
  'c': 'س',
  'd': 'د',
  'e': 'ے',
  'f': 'ف',
  'g': 'گ',
  'h': 'ہ',
  'i': 'ی',
  'j': 'ج',
  'k': 'ک',
  'l': 'ل',
  'm': 'م',
  'n': 'ن',
  'o': 'و',
  'p': 'پ',
  'q': 'ق',
  'r': 'ر',
  's': 'س',
  't': 'ت',
  'u': 'و',
  'v': 'و',
  'w': 'و',
  'x': 'کس',
  'y': 'ی',
  'z': 'ز',
  '0': '۰',
  '1': '۱',
  '2': '۲',
  '3': '۳',
  '4': '۴',
  '5': '۵',
  '6': '۶',
  '7': '۷',
  '8': '۸',
  '9': '۹',
  ' ': ' ',
  '.': '۔',
  ',': '،',
  '?': '؟',
  '!': '!',
  '@': '@',
  '#': '#',
  '$': '$',
  '%': '%',
  '^': '^',
  '&': '&',
  '*': '*',
  '(': '(',
  ')': ')',
  '-': '-',
  '_': '_',
  '+': '+',
  '=': '=',
  '{': '{',
  '}': '}',
  '[': '[',
  ']': ']',
  '|': '|',
  '\\': '\\',
  ':': ':',
  ';': ';',
  '"': '"',
  "'": "'",
  '<': '<',
  '>': '>',
  '/': '/',
};

// Create a reverse mapping for Urdu to English
const urduToEnglishMapping: { [key: string]: string } = {};
Object.keys(englishToUrduMapping).forEach(key => {
  urduToEnglishMapping[englishToUrduMapping[key]] = key;
});

interface AppContextType {
  theme: ThemeType;
  language: LanguageType;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  isDark: boolean;
  isUrdu: boolean;
  t: typeof translations.en; // Translation helper
  getRtlTextStyle: (additionalStyles?: any) => any; // Helper for RTL text styling
  transliterateText: (text: string) => string; // Function to transliterate text between languages
}

// Create the context with default values
const AppContext = createContext<AppContextType>({
  theme: 'dark',
  language: 'en',
  toggleTheme: () => {},
  toggleLanguage: () => {},
  isDark: true,
  isUrdu: false,
  t: translations.en,
  getRtlTextStyle: () => {},
  transliterateText: (text: string) => text,
});

// Custom hook for using the app context
export const useAppContext = () => useContext(AppContext);

// Provider component that wraps the app
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>('dark');
  const [language, setLanguage] = useState<LanguageType>('en');

  // Load saved preferences from AsyncStorage on app start
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        const savedLanguage = await AsyncStorage.getItem('language');
        
        if (savedTheme) {
          setTheme(savedTheme as ThemeType);
        } else {
          // Default to device theme if no saved preference
          setTheme(deviceTheme === 'dark' ? 'dark' : 'light');
        }
        
        if (savedLanguage) {
          setLanguage(savedLanguage as LanguageType);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    
    loadPreferences();
  }, [deviceTheme]);

  // Toggle between dark and light themes
  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Toggle between English and Urdu languages
  const toggleLanguage = async () => {
    const newLanguage = language === 'en' ? 'ur' : 'en';
    setLanguage(newLanguage);
    try {
      await AsyncStorage.setItem('language', newLanguage);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  // Transliterate text between English and Urdu based on current language
  const transliterateText = (text: string): string => {
    if (!text) return '';
    
    if (language === 'ur') {
      // Transliterate from English to Urdu for display
      const result = text.toLowerCase().split('').map(char => 
        englishToUrduMapping[char] || char
      ).join('');
      console.log(`Transliterating to Urdu: "${text}" -> "${result}"`);
      return result;
    } else {
      // If we're in English mode and the text might be in Urdu, convert it back
      // This is a simplified approach - in practice you'd need more sophisticated detection
      const hasUrduChars = text.split('').some(char => urduToEnglishMapping[char]);
      if (hasUrduChars) {
        const result = text.split('').map(char => 
          urduToEnglishMapping[char] || char
        ).join('');
        console.log(`Transliterating from Urdu: "${text}" -> "${result}"`);
        return result;
      }
      return text;
    }
  };

  // Derived values for convenience
  const isDark = theme === 'dark';
  const isUrdu = language === 'ur';
  const t = translations[language];
  
  // Helper function for RTL text styling
  const getRtlTextStyle = (additionalStyles?: any) => {
    if (!isUrdu) return additionalStyles || {};
    
    return {
      textAlign: 'right',
      writingDirection: 'rtl',
      ...(Platform.OS === 'ios' ? { fontFamily: 'Arial' } : { fontFamily: 'sans-serif' }),
      lineHeight: 24,
      ...additionalStyles,
    };
  };

  // Context value to be provided
  const contextValue: AppContextType = {
    theme,
    language,
    toggleTheme,
    toggleLanguage,
    isDark,
    isUrdu,
    t,
    getRtlTextStyle,
    transliterateText,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}; 