import React, { useState, useEffect } from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { useAppContext } from '@/contexts/AppContext';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  colorType?: 'text' | 'primary' | 'secondary';
};

export const ThemedTextInput: React.FC<ThemedTextInputProps> = ({
  style,
  lightColor,
  darkColor,
  colorType = 'text',
  placeholderTextColor,
  value,
  onChangeText,
  ...rest
}) => {
  const { isUrdu, getRtlTextStyle, transliterateText } = useAppContext();
  const [displayValue, setDisplayValue] = useState(value);
  
  const color = useThemeColor({ light: lightColor, dark: darkColor }, colorType);
  const backgroundColor = useThemeColor({}, 'background');

  // Update the display value when the language changes or the value prop changes
  useEffect(() => {
    if (typeof value === 'string') {
      setDisplayValue(value);
    }
  }, [value, isUrdu]);

  // This function handles text changes, storing the original input but displaying the transliterated version
  const handleChangeText = (text: string) => {
    setDisplayValue(text);
    
    if (onChangeText) {
      onChangeText(text);
    }
  };

  return (
    <TextInput
      style={[
        styles.input,
        { 
          color, 
          backgroundColor,
          borderColor: useThemeColor({}, 'border')
        },
        isUrdu ? getRtlTextStyle() : null,
        style,
      ]}
      placeholderTextColor={placeholderTextColor || useThemeColor({}, 'secondary')}
      value={isUrdu && typeof displayValue === 'string' ? transliterateText(displayValue) : displayValue}
      onChangeText={handleChangeText}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
}); 