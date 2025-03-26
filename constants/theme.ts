export const lightTheme = {
  colors: {
    background: '#FFFFFF',
    text: '#000000',
    primary: '#4A80F0',
    secondary: '#6E7A8A',
    card: '#F5F7FA',
    border: '#E1E4E8',
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