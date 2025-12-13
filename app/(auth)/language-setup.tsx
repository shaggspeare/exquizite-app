import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Localization from 'expo-localization';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage, AVAILABLE_LANGUAGES } from '@/contexts/LanguageContext';
import { useI18n } from '@/contexts/I18nContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LanguageDropdown } from '@/components/ui/LanguageDropdown';
import { LanguageBadge } from '@/components/ui/LanguageBadge';
import { Spacing, Typography } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { DesktopLayout } from '@/components/layout/DesktopLayout';
import { DesktopContainer } from '@/components/layout/DesktopContainer';
import { FULLY_TRANSLATED_LANGUAGES } from '@/lib/i18n/languages';

// Helper to detect device language
const getDeviceLanguage = (): string => {
  const locales = Localization.getLocales();
  if (locales && locales.length > 0) {
    const primaryLocale = locales[0];
    const languageCode = primaryLocale.languageCode || 'en';

    // Check if we support this language and it's fully translated
    const isSupported = FULLY_TRANSLATED_LANGUAGES.includes(languageCode as any);
    if (isSupported) {
      return languageCode;
    }
  }
  return 'en'; // Default to English
};

export default function LanguageSetupScreen() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const { colors } = useTheme();
  const { isDesktop } = useResponsive();
  const { preferences, setLanguages } = useLanguage();
  const { changeLanguage } = useI18n();

  const [targetLanguage, setTargetLanguage] = useState(
    preferences.targetLanguage || ''
  );
  const [nativeLanguage, setNativeLanguage] = useState(
    preferences.nativeLanguage || getDeviceLanguage()
  );

  // Auto-detect device language on mount if not already set
  useEffect(() => {
    if (!preferences.nativeLanguage) {
      const deviceLang = getDeviceLanguage();
      setNativeLanguage(deviceLang);
      // Also update UI language immediately
      changeLanguage(deviceLang);
    }
  }, []);

  const handleComplete = async () => {
    if (!targetLanguage || !nativeLanguage) return;

    try {
      // Change UI language to the native language (translate-to language)
      await changeLanguage(nativeLanguage);
      // Save language preferences
      await setLanguages(targetLanguage, nativeLanguage);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving language preferences:', error);
    }
  };

  // Filter native language options to only show fully translated languages
  const nativeLanguageOptions = AVAILABLE_LANGUAGES.filter(
    lang => lang.code !== targetLanguage &&
            FULLY_TRANSLATED_LANGUAGES.includes(lang.code as any)
  );

  if (isDesktop) {
    return (
      <DesktopLayout hideSidebar={true}>
        <View
          style={[
            styles.desktopContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <ScrollView
            style={styles.desktopContent}
            contentContainerStyle={styles.desktopScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <DesktopContainer>
              <View style={styles.desktopCenteredContent}>
                <View style={styles.desktopIconContainer}>
                  <Ionicons name="language" size={80} color={colors.primary} />
                </View>

                <Text style={[styles.desktopTitle, { color: colors.text }]}>
                  {t('languageSetup.heading')}
                </Text>

                <Text
                  style={[
                    styles.desktopSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  {t('languageSetup.description')}
                </Text>

                <Card style={styles.desktopLanguageCard}>
                  <View style={styles.desktopDropdownContainer}>
                    <LanguageDropdown
                      languages={AVAILABLE_LANGUAGES}
                      selectedLanguage={targetLanguage}
                      onSelect={setTargetLanguage}
                      placeholder={t('languageSetup.targetPlaceholder')}
                      label={t('languageSetup.targetLanguage')}
                    />
                  </View>

                  <View style={styles.desktopDropdownContainer}>
                    <LanguageDropdown
                      languages={nativeLanguageOptions}
                      selectedLanguage={nativeLanguage}
                      onSelect={setNativeLanguage}
                      placeholder={t('languageSetup.nativePlaceholder')}
                      label={t('languageSetup.nativeLanguage')}
                    />
                  </View>

                  {targetLanguage && nativeLanguage && (
                    <View style={styles.desktopInfoContainer}>
                      <Ionicons
                        name="information-circle"
                        size={20}
                        color={colors.primary}
                      />
                      <Text
                        style={[
                          styles.desktopInfoText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {t('languageSetup.info')}
                      </Text>
                    </View>
                  )}
                </Card>

                {targetLanguage && nativeLanguage && (
                  <Button
                    title={t('languageSetup.getStarted')}
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('languageSetup.title')}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="language" size={64} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {t('languageSetup.heading')}
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('languageSetup.description')}
        </Text>

        <Card style={styles.languageSection}>
          <View style={styles.dropdownContainer}>
            <LanguageDropdown
              languages={AVAILABLE_LANGUAGES}
              selectedLanguage={targetLanguage}
              onSelect={setTargetLanguage}
              placeholder={t('languageSetup.targetPlaceholder')}
              label={t('languageSetup.targetLanguage')}
            />
          </View>

          <View style={styles.dropdownContainer}>
            <LanguageDropdown
              languages={nativeLanguageOptions}
              selectedLanguage={nativeLanguage}
              onSelect={setNativeLanguage}
              placeholder={t('languageSetup.nativePlaceholder')}
              label={t('languageSetup.nativeLanguage')}
            />
          </View>

          {targetLanguage && nativeLanguage && (
            <>
              <View style={styles.previewContainer}>
                <View style={styles.previewBadge}>
                  <LanguageBadge
                    targetLanguage={targetLanguage}
                    nativeLanguage={nativeLanguage}
                    size="medium"
                  />
                </View>
              </View>
              <View style={styles.infoContainer}>
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {t('languageSetup.info')}
                </Text>
              </View>
            </>
          )}
        </Card>
      </ScrollView>

      {targetLanguage && nativeLanguage && (
        <View
          style={[
            styles.footer,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          <Button title={t('languageSetup.getStarted')} onPress={handleComplete} />
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
  previewContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  previewBadge: {
    transform: [{ scale: 1.1 }],
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
