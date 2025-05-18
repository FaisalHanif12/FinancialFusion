import styled from 'styled-components/native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

interface ThemeProps {
  theme: {
    colors: {
      background: string;
      text: string;
      primary: string;
      secondary: string;
      card: string;
      border: string;
    };
  };
}

export const MonthSection = styled(ThemedView)`
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
`;

export const MonthHeader = styled(ThemedView)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: ${(props: ThemeProps) => props.theme.colors.card};
  border-bottom-width: 1px;
  border-bottom-color: ${(props: ThemeProps) => props.theme.colors.border};
`;

export const ExpenseItem = styled(ThemedView)`
  padding: 12px 16px;
  background-color: ${(props: ThemeProps) => props.theme.colors.card};
  border-bottom-width: 1px;
  border-bottom-color: ${(props: ThemeProps) => props.theme.colors.border};
`;

export const ExpenseHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

export const ExpenseAmount = styled(ThemedText)`
  font-weight: bold;
  font-size: 16px;
  color: #4A80F0;
`;