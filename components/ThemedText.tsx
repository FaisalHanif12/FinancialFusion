import { Text, type TextProps, StyleSheet } from 'react-native';
import { useAppContext } from '@/contexts/AppContext';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  colorType?: 'text' | 'primary' | 'secondary';
  transliterate?: boolean;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  colorType = 'text',
  transliterate = true,
  children,
  ...rest
}: ThemedTextProps) {
  const { isUrdu, getRtlTextStyle, transliterateText } = useAppContext();
  
  const color = useThemeColor({ light: lightColor, dark: darkColor }, colorType);

  let processedChildren = children;
  
  if (transliterate && typeof children === 'string') {
    processedChildren = transliterateText(children);
  }

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        isUrdu ? getRtlTextStyle() : undefined,
        style,
      ]}
      {...rest}
    >
      {processedChildren}
    </Text>
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 26,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#4A80F0',
  },
});
