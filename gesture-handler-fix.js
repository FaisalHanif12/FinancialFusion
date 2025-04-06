import React from 'react';
import { View } from 'react-native';

// This is a fallback implementation for when the native module isn't available
export const GestureHandlerRootView = ({ children, style, ...rest }) => {
  return (
    <View style={[{ flex: 1 }, style]} {...rest}>
      {children}
    </View>
  );
};

// Mock the gesture handler module to prevent errors
if (!global.__GESTURE_HANDLER_MOCK__) {
  global.__GESTURE_HANDLER_MOCK__ = {
    State: { UNDETERMINED: 0, BEGAN: 1, ACTIVE: 2, CANCELLED: 3, FAILED: 4, END: 5 },
    Direction: { RIGHT: 1, LEFT: 2, UP: 4, DOWN: 8 },
  };
}

export default GestureHandlerRootView; 