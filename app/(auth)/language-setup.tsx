import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage, AVAILABLE_LANGUAGES } from '@/contexts/LanguageContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LanguageDropdown } from '@/components/ui/LanguageDropdown';
import { Spacing, Typography } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { DesktopLayout } from '@/components/layout/DesktopLayout';
import { DesktopContainer } from '@/components/layout/DesktopContainer';

export default function LanguageSetupScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isDesktop } = useResponsive();
  const { preferences, setLanguages } = useLanguage();

  const [targetLanguage, setTargetLanguage] = useState(preferences.targetLanguage || '');
  const [nativeLanguage, setNativeLanguage] = useState(preferences.nativeLanguage || 'en');

  const handleComplete = async () => {
    if (!targetLanguage || !nativeLanguage) return;

    try {
      await setLanguages(targetLanguage, nativeLanguage);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving language preferences:', error);
    }
  };

  const nativeLanguageOptions = AVAILABLE_LANGUAGES.filter(
    lang => lang.code !== targetLanguage
  );

  if (isDesktop) {
    return (
      <DesktopLayout>
        <View style={[styles.desktopContainer, { backgroundColor: colors.background }]}>
          <ScrollView
            style={styles.desktopContent}
            contentContainerStyle={styles.desktopScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <DesktopContainer>
              <View style={styles.desktopCenteredContent}>
                <View style={styles.desktopIconContainer}>
                  <Ionicons
                    name="language"
                    size={80}
                    color={colors.primary}
                  />
                </View>

                <Text style={[styles.desktopTitle, { color: colors.text }]}>
                  Choose Your Languages
                </Text>

                <Text style={[styles.desktopSubtitle, { color: colors.textSecondary }]}>
                  Select the language you want to learn and your native language
                </Text>

                <Card style={styles.desktopLanguageCard}>
                  <View style={styles.desktopDropdownContainer}>
                    <LanguageDropdown
                      languages={AVAILABLE_LANGUAGES}
                      selectedLanguage={targetLanguage}
                      onSelect={setTargetLanguage}
                      placeholder="Select language to learn"
                      label="Language to Learn"
                    />
                  </View>

                  <View style={styles.desktopDropdownContainer}>
                    <LanguageDropdown
                      languages={nativeLanguageOptions}
                      selectedLanguage={nativeLanguage}
                      onSelect={setNativeLanguage}
                      placeholder="Select your native language"
                      label="Your Native Language"
                    />
                  </View>

                  {targetLanguage && nativeLanguage && (
                    <View style={styles.desktopInfoContainer}>
                      <Ionicons name="information-circle" size={20} color={colors.primary} />
                      <Text style={[styles.desktopInfoText, { color: colors.textSecondary }]}>
                        You can change these settings later in your profile
                      </Text>
                    </View>
                  )}
                </Card>

                {targetLanguage && nativeLanguage && (
                  <Button
                    title="Get Started"
                    onPress={handleComplete}
                    style={styles.desktopButton}
                  />
                )}
              </View>
            </DesktopContainer>
          </ScrollView>
        </View>
      </DesktopLayout>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Language Setup
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name="language"
            size={64}
            color={colors.primary}
          />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          Choose Your Languages
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Select the language you want to learn and your native language
        </Text>

        <Card style={styles.languageSection}>
          <View style={styles.dropdownContainer}>
            <LanguageDropdown
              languages={AVAILABLE_LANGUAGES}
              selectedLanguage={targetLanguage}
              onSelect={setTargetLanguage}
              placeholder="Select language to learn"
              label="Language to Learn"
            />
          </View>

          <View style={styles.dropdownContainer}>
            <LanguageDropdown
              languages={nativeLanguageOptions}
              selectedLanguage={nativeLanguage}
              onSelect={setNativeLanguage}
              placeholder="Select your native language"
              label="Your Native Language"
            />
          </View>

          {targetLanguage && nativeLanguage && (
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                You can change these settings later in your profile
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>

      {targetLanguage && nativeLanguage && (
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <Button
            title="Get Started"
            onPress={handleComplete}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  languageSection: {
    padding: Spacing.lg,
  },
  dropdownContainer: {
    marginBottom: Spacing.lg,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  infoText: {
    ...Typography.caption,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  // Desktop styles
  desktopContainer: {
    flex: 1,
  },
  desktopContent: {
    flex: 1,
  },
  desktopScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
    minHeight: '100%',
  },
  desktopCenteredContent: {
    maxWidth: 560,
    marginHorizontal: 'auto' as any,
    width: '100%',
  },
  desktopIconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  desktopTitle: {
    ...Typography.h1,
    fontSize: 36,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  desktopSubtitle: {
    ...Typography.body,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  desktopLanguageCard: {
    padding: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  desktopDropdownContainer: {
    marginBottom: Spacing.lg,
  },
  desktopInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  desktopInfoText: {
    ...Typography.caption,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  desktopButton: {
    minWidth: 200,
    alignSelf: 'center',
  },
});
