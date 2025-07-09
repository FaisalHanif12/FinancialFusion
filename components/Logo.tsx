import React from 'react';
import { Image, StyleSheet, ImageStyle, StyleProp } from 'react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ImageStyle>;
}

export default function Logo({ size = 'medium', style }: LogoProps) {
  const getLogoSize = () => {
    switch (size) {
      case 'small':
        return { width: 40, height: 40 };
      case 'large':
        return { width: 100, height: 100 };
      case 'medium':
      default:
        return { width: 80, height: 80 };
    }
  };

  return (
    <Image
      source={require('@/assets/images/financial_logo.png')}
      style={[styles.logo, getLogoSize(), style]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
  },
}); 