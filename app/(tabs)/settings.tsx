import React, { useState } from 'react';
import { StyleSheet, Switch, View, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import styled from 'styled-components/native';
import { useAppContext } from '@/contexts/AppContext';
import { DataManagementSection } from '@/components/DataManagementSection';

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

const TouchableRow = styled(TouchableOpacity)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
`;

export default function SettingsScreen() {
  const { theme, toggleTheme, language, toggleLanguage, t, isDark } = useAppContext();
  const [showDataManagement, setShowDataManagement] = useState(false);

  if (showDataManagement) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowDataManagement(false)}
          >
            <FontAwesome name="arrow-left" size={20} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>
            {t.dataManagement || 'Data Management'}
          </ThemedText>
        </ThemedView>
        <DataManagementSection />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>{t.settingsTitle}</ThemedText>
        <ThemedText style={styles.subtitle}>{t.managePreferences}</ThemedText>
      </ThemedView>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Language Settings */}
        <Card>
          <SettingTitle>{t.language || 'Language'}</SettingTitle>
          <SettingDescription>{t.languageDesc || 'Choose your preferred language'}</SettingDescription>
          
          <ToggleRow>
            <View style={styles.optionContainer}>
              <ThemedText style={language === 'en' ? styles.optionActive : styles.optionInactive}>
                {t.english || 'English'}
              </ThemedText>
              <ThemedText style={language === 'ur' ? styles.optionActive : styles.optionInactive}>
                {t.urdu || 'Urdu'}
              </ThemedText>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: "#4A80F0" }}
              thumbColor={"#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleLanguage}
              value={language === 'ur'}
            />
          </ToggleRow>
        </Card>

        {/* Theme Settings */}
        <Card>
          <SettingTitle>{t.theme || 'Theme'}</SettingTitle>
          <SettingDescription>{t.themeDesc || 'Choose your preferred theme'}</SettingDescription>
          
          <ToggleRow>
            <View style={styles.optionContainer}>
              <ThemedText style={theme === 'light' ? styles.optionActive : styles.optionInactive}>
                {t.light || 'Light'}
              </ThemedText>
              <ThemedText style={theme === 'dark' ? styles.optionActive : styles.optionInactive}>
                {t.dark || 'Dark'}
              </ThemedText>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: "#4A80F0" }}
              thumbColor={"#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleTheme}
              value={theme === 'dark'}
            />
          </ToggleRow>
        </Card>

        {/* Data Management */}
        <Card>
          <SettingTitle>{t.dataManagement || 'Data Management'}</SettingTitle>
          <SettingDescription>{t.dataManagementDesc || 'Backup and restore your data'}</SettingDescription>
          <TouchableRow onPress={() => setShowDataManagement(true)}>
            <View style={styles.optionContainer}>
              <ThemedText style={styles.optionText}>{t.backupRestore || 'Backup & Restore'}</ThemedText>
            </View>
            <FontAwesome name="chevron-right" size={16} color={isDark ? '#fff' : '#000'} />
          </TouchableRow>
        </Card>

        {/* About */}
        <Card>
          <SettingTitle>{t.about || 'About'}</SettingTitle>
          <SettingDescription>{t.versionDesc || 'App version information'}</SettingDescription>
          <ToggleRow>
            <View style={styles.optionContainer}>
              <ThemedText style={styles.optionText}>{t.version || 'Version'}</ThemedText>
              <ThemedText style={styles.versionText}>1.0.0</ThemedText>
            </View>
          </ToggleRow>
        </Card>
      </ScrollView>
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
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
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
  optionText: {
    fontSize: 16,
  },
  versionText: {
    fontSize: 14,
    opacity: 0.7,
  },
}); 