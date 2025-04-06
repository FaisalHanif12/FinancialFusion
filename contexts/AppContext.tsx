import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for our context
type ThemeType = 'light' | 'dark';
type LanguageType = 'en' | 'ur';

interface AppContextType {
  theme: ThemeType;
  language: LanguageType;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  isDark: boolean;
  isUrdu: boolean;
}

// Create the context with default values
const AppContext = createContext<AppContextType>({
  theme: 'dark',
  language: 'en',
  toggleTheme: () => {},
  toggleLanguage: () => {},
  isDark: true,
  isUrdu: false,
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

  // Derived values for convenience
  const isDark = theme === 'dark';
  const isUrdu = language === 'ur';

  // Context value to be provided
  const contextValue: AppContextType = {
    theme,
    language,
    toggleTheme,
    toggleLanguage,
    isDark,
    isUrdu,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}; 