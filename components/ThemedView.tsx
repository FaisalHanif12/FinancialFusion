import { View, type ViewProps } from 'react-native';
import { useAppContext } from '@/contexts/AppContext';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  cardStyle?: boolean;
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  cardStyle = false, 
  ...otherProps 
}: ThemedViewProps) {
  const { isDark } = useAppContext();
  
  const colorKey = cardStyle ? 'card' : 'background';
  
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, colorKey);

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
