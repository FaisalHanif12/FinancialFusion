/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useAppContext } from '@/contexts/AppContext';

// Define a more comprehensive ColorName type that includes all theme colors
type ColorName = keyof typeof Colors.light & keyof typeof Colors.dark;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorName | 'card' | 'border' | 'primary' | 'secondary'
) {
  const { isDark } = useAppContext();
  const theme = isDark ? 'dark' : 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }
  
  // For standard Colors properties
  if (colorName in Colors[theme]) {
    return Colors[theme][colorName as ColorName];
  }
  
  // Handle special theme properties by mapping to appropriate Colors values
  switch (colorName) {
    case 'card':
      return isDark ? '#1E1E1E' : '#FFFFFF';
    case 'border':
      return isDark ? '#2A2A2A' : '#DADCE0';
    case 'primary':
      return isDark ? '#5D8BF4' : '#4A80F0';
    case 'secondary':
      return isDark ? '#A1A7B0' : '#5F6368';
    default:
      return isDark ? Colors.dark.background : Colors.light.background;
  }
}
