// Import our fixed gesture handler implementation
import GestureHandlerRootView from './gesture-handler-fix';

// Import the rest of dependencies
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import React from 'react';

// Must be exported or Fast Refresh won't update the context
export function App() {
  const ctx = require.context('./app');
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ExpoRoot context={ctx} />
    </GestureHandlerRootView>
  );
}

registerRootComponent(App);
