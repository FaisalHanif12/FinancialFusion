export const lightTheme = {
  colors: {
    background: '#F8F9FA',
    text: '#202124',
    primary: '#4A80F0',
    secondary: '#5F6368',
    card: '#FFFFFF',
    border: '#DADCE0',
  },
};

export const darkTheme = {
  colors: {
    background: '#121212',
    text: '#FFFFFF',
    primary: '#5D8BF4',
    secondary: '#A1A7B0',
    card: '#1E1E1E',
    border: '#2A2A2A',
  },
};

export type Theme = typeof lightTheme;

export interface ThemeProps {
  theme: Theme;
} 