import { useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useNavigationContainerRef } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, useColorScheme, View } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { KhataProvider } from '@/context/KhataContext';
import { ThemeProvider as StyledThemeProvider } from '@/context/ThemeProvider';
import { AppProvider, useAppContext } from '@/contexts/AppContext';
import { ExpenseProvider } from '@/contexts/ExpenseContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return <ActivityIndicator />;
  }

  return (
    <AppProvider>
      <RootLayoutWithTheme />
    </AppProvider>
  );
}

function RootLayoutWithTheme() {
  const { isDark } = useAppContext();
  const navigationRef = useNavigationContainerRef();

  // Use the theme from AppContext
  const appTheme = isDark 
    ? { 
        ...DarkTheme, 
        colors: {
          ...DarkTheme.colors,
          background: '#121212',
          card: '#1E1E1E',
          text: '#FFFFFF',
          border: '#2A2A2A',
          primary: '#5D8BF4',
        } 
      } 
    : { 
        ...DefaultTheme, 
        colors: {
          ...DefaultTheme.colors,
          background: '#F8F9FA',
          card: '#FFFFFF',
          text: '#202124',
          border: '#DADCE0',
          primary: '#4A80F0',
        } 
      };

  return (
    <View style={{ flex: 1 }}>
      <ThemeProvider value={appTheme}>
        <StyledThemeProvider>
          <KhataProvider>
            <ExpenseProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </ExpenseProvider>
          </KhataProvider>
        </StyledThemeProvider>
      </ThemeProvider>
    </View>
  );
}
