import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import styled from 'styled-components/native';
import { useAppContext } from '@/contexts/AppContext';

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

const Card = styled(ThemedView)`
  background-color: ${(props: ThemeProps) => props.theme.colors.card};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  shadow-opacity: 0.1;
  shadow-radius: 10px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  elevation: 5;
`;

const SettingTitle = styled(ThemedText)`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const SettingDescription = styled(ThemedText)`
  font-size: 14px;
  color: ${(props: ThemeProps) => props.theme.colors.secondary};
  margin-bottom: 8px;
`;

const ToggleRow = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
`;

export default function SettingsScreen() {
  // Use our app context for state management
  const { isDark, isUrdu, toggleTheme, toggleLanguage, t } = useAppContext();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>{t.settingsTitle}</ThemedText>
        <ThemedText style={styles.subtitle}>{t.managePreferences}</ThemedText>
      </ThemedView>

      {/* Language Settings */}
      <Card>
        <SettingTitle>{t.language}</SettingTitle>
        <SettingDescription>{t.languageDesc}</SettingDescription>
        
        <ToggleRow>
          <View style={styles.optionContainer}>
            <ThemedText style={isUrdu ? styles.optionInactive : styles.optionActive}>
              {t.english}
            </ThemedText>
            <ThemedText style={isUrdu ? styles.optionActive : styles.optionInactive}>
              {t.urdu}
            </ThemedText>
          </View>
          <Switch
            trackColor={{ false: "#767577", true: "#4A80F0" }}
            thumbColor={"#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleLanguage}
            value={isUrdu}
          />
        </ToggleRow>
      </Card>

      {/* Theme Settings */}
      <Card>
        <SettingTitle>{t.theme}</SettingTitle>
        <SettingDescription>{t.themeDesc}</SettingDescription>
        
        <ToggleRow>
          <View style={styles.optionContainer}>
            <ThemedText style={!isDark ? styles.optionInactive : styles.optionActive}>
              {t.dark}
            </ThemedText>
            <ThemedText style={!isDark ? styles.optionActive : styles.optionInactive}>
              {t.light}
            </ThemedText>
          </View>
          <Switch
            trackColor={{ false: "#767577", true: "#4A80F0" }}
            thumbColor={"#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleTheme}
            value={!isDark}
          />
        </ToggleRow>
      </Card>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    opacity: 0.7,
    textAlign: 'center',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionActive: {
    fontWeight: 'bold',
    marginRight: 10,
    fontSize: 16,
  },
  optionInactive: {
    marginRight: 10,
    opacity: 0.6,
    fontSize: 16,
  },
}); 