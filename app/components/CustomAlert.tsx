import React, { useState, useEffect } from 'react';
import { StyleSheet, Modal, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Define theme interface for type safety
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

const AlertContainer = styled(ThemedView)`
  background-color: ${(props: ThemeProps) => props.theme.colors.card};
  border-radius: 16px;
  padding: 20px;
  width: 85%;
  max-width: 350px;
  elevation: 5;
  shadow-opacity: 0.2;
  shadow-radius: 10px;
  shadow-color: #000;
  shadow-offset: 0px 5px;
  align-items: center;
`;

const AlertTitle = styled(ThemedText)`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 14px;
  text-align: center;
  color: ${(props: ThemeProps) => props.theme.colors.text};
`;

const AlertMessage = styled(ThemedText)`
  font-size: 16px;
  text-align: center;
  margin-bottom: 20px;
  color: ${(props: ThemeProps) => props.theme.colors.text};
  opacity: 0.9;
  line-height: 22px;
`;

const AlertButton = styled(TouchableOpacity)`
  background-color: ${(props: any) => 
    props.type === 'success' ? '#22A45D' : 
    props.type === 'error' ? '#e74c3c' : 
    props.type === 'warning' ? '#f39c12' : '#4A80F0'};
  padding: 12px 24px;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  min-width: 120px;
`;

const AlertButtonText = styled(ThemedText)`
  color: white;
  font-weight: 600;
  font-size: 16px;
`;

const IconContainer = styled(ThemedView)`
  margin-bottom: 16px;
  height: 56px;
  width: 56px;
  border-radius: 28px;
  justify-content: center;
  align-items: center;
  background-color: ${(props: any) => 
    props.type === 'success' ? 'rgba(34, 164, 93, 0.2)' : 
    props.type === 'error' ? 'rgba(231, 76, 60, 0.2)' : 
    props.type === 'warning' ? 'rgba(243, 156, 18, 0.2)' : 'rgba(74, 128, 240, 0.2)'};
`;

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  buttonText?: string;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = 'info',
  onClose,
  buttonText = 'OK'
}) => {
  const [animation] = useState(new Animated.Value(0));
  
  useEffect(() => {
    if (visible) {
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);
  
  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'times-circle';
      case 'warning':
        return 'exclamation-triangle';
      default:
        return 'info-circle';
    }
  };
  
  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#22A45D';
      case 'error':
        return '#e74c3c';
      case 'warning':
        return '#f39c12';
      default:
        return '#4A80F0';
    }
  };

  const animatedStyle = {
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
    opacity: animation,
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.modalContainer}>
        <Animated.View style={animatedStyle}>
          <AlertContainer>
            <IconContainer type={type}>
              <FontAwesome name={getIconName()} size={30} color={getIconColor()} />
            </IconContainer>
            <AlertTitle>{title}</AlertTitle>
            <AlertMessage>{message}</AlertMessage>
            <AlertButton type={type} onPress={onClose}>
              <AlertButtonText>{buttonText}</AlertButtonText>
            </AlertButton>
          </AlertContainer>
        </Animated.View>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default CustomAlert; 