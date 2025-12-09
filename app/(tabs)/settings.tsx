import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage, AVAILABLE_LANGUAGES } from '@/contexts/LanguageContext';
import { useI18n } from '@/contexts/I18nContext';
import { useSets } from '@/contexts/SetsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LanguageDropdown } from '@/components/ui/LanguageDropdown';
import { SetCard } from '@/components/set/SetCard';
import { DesktopSetCard } from '@/components/set/DesktopSetCard';
import { Spacing, Typography, BorderRadius } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { DesktopLayout } from '@/components/layout/DesktopLayout';
import { DesktopContainer } from '@/components/layout/DesktopContainer';
import { SUPPORTED_UI_LANGUAGES, FULLY_TRANSLATED_LANGUAGES } from '@/lib/i18n/languages';

type ThemeOption = 'light' | 'dark' | 'auto';

export default function SettingsScreen() {
  const { t } = useTranslation('settings');
  const router = useRouter();
  const { colors, theme, setTheme } = useTheme();
  const { preferences, setLanguages } = useLanguage();
  const { currentLanguage, changeLanguage } = useI18n();
  const { sets } = useSets();
  const { user } = useAuth();
  const { isDesktop } = useResponsive();

  const themeOptions: {
    value: ThemeOption;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { value: 'light', label: t('appearance.light'), icon: 'sunny' },
    { value: 'dark', label: t('appearance.dark'), icon: 'moon' },
    { value: 'auto', label: t('appearance.auto'), icon: 'phone-portrait' },
  ];

  const handleThemeChange = async (newTheme: ThemeOption) => {
    await setTheme(newTheme);
  };

  const handleTargetLanguageChange = async (code: string) => {
    await setLanguages(code, preferences.nativeLanguage);
  };

  const handleNativeLanguageChange = async (code: string) => {
    // Change UI language when native language changes
    await changeLanguage(code);
    await setLanguages(preferences.targetLanguage, code);
  };

  // Filter native language options to only show fully translated languages
  const nativeLanguageOptions = AVAILABLE_LANGUAGES.filter(
    lang => lang.code !== preferences.targetLanguage &&
            FULLY_TRANSLATED_LANGUAGES.includes(lang.code as any)
  );

  if (isDesktop) {
    return (
      <DesktopLayout>
        <View
          style={[
            styles.desktopContainer,
            { backgroundColor: colors.background },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.desktopHeader,
              {
                backgroundColor: colors.card,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <DesktopContainer>
              <View style={styles.desktopHeaderContent}>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/profile')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="arrow-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  {t('title')}
                </Text>
                <View style={{ width: 28 }} />
              </View>
            </DesktopContainer>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.desktopContent}
            contentContainerStyle={styles.desktopScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <DesktopContainer>
              <View style={styles.desktopLayout}>
                {/* Left Column - Settings */}
                <View style={styles.desktopLeftColumn}>
                  {/* Guest Upgrade Banner */}
                  {user?.isGuest && (
                    <Card
                      style={[
                        styles.upgradeNotice,
                        {
                          backgroundColor: `${colors.warning}15`,
                          borderColor: colors.warning,
                        },
                      ]}
                    >
                      <View style={styles.upgradeNoticeContent}>
                        <Ionicons
                          name="information-circle"
                          size={24}
                          color={colors.warning}
                        />
                        <View style={styles.upgradeNoticeText}>
                          <Text
                            style={[
                              styles.upgradeNoticeTitle,
                              { color: colors.text },
                            ]}
                          >
                            {t('auth:guest.youAreGuest')}
                          </Text>
                          <Text
                            style={[
                              styles.upgradeNoticeDescription,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {t('auth:guest.savePermanently')}
                          </Text>
                        </View>
                      </View>
                      <Button
                        title={t('auth:guest.upgradeNow')}
                        onPress={() => router.push('/(auth)/login')}
                        variant="outline"
                        style={styles.upgradeNoticeButton}
                      />
                    </Card>
                  )}

                  {/* Learning Languages */}
                  <Card style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      {t('languages.title')}
                    </Text>
                    <Text
                      style={[
                        styles.sectionDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {t('languages.description')}
                    </Text>

                    <View style={styles.desktopLanguageRow}>
                      <View style={styles.desktopLanguageColumn}>
                        <LanguageDropdown
                          languages={AVAILABLE_LANGUAGES}
                          selectedLanguage={preferences.targetLanguage}
                          onSelect={handleTargetLanguageChange}
                          placeholder={t('languages.targetPlaceholder')}
                          label={t('languages.targetLanguage')}
                        />
                      </View>

                      <View style={styles.desktopLanguageColumn}>
                        <LanguageDropdown
                          languages={nativeLanguageOptions}
                          selectedLanguage={preferences.nativeLanguage}
                          onSelect={handleNativeLanguageChange}
                          placeholder={t('languages.nativePlaceholder')}
                          label={t('languages.nativeLanguage')}
                        />
                      </View>
                    </View>
                  </Card>

                  {/* Theme */}
                  <Card style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      {t('appearance.title')}
                    </Text>
                    <Text
                      style={[
                        styles.sectionDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {t('appearance.description')}
                    </Text>

                    <View style={styles.desktopThemeRow}>
                      {themeOptions.map(option => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.desktopThemeOption,
                            {
                              borderColor:
                                theme === option.value
                                  ? colors.primary
                                  : colors.border,
                              backgroundColor:
                                theme === option.value
                                  ? `${colors.primary}10`
                                  : 'transparent',
                            },
                          ]}
                          onPress={() => handleThemeChange(option.value)}
                        >
                          <Ionicons
                            name={option.icon}
                            size={28}
                            color={
                              theme === option.value
                                ? colors.primary
                                : colors.textSecondary
                            }
                          />
                          <Text
                            style={[
                              styles.themeOptionLabel,
                              {
                                color:
                                  theme === option.value
                                    ? colors.primary
                                    : colors.text,
                                fontWeight:
                                  theme === option.value ? '600' : '400',
                              },
                            ]}
                          >
                            {option.label}
                          </Text>
                          {theme === option.value && (
                            <Ionicons
                              name="checkmark-circle"
                              size={18}
                              color={colors.primary}
                              style={styles.desktopCheckmark}
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </Card>

                  <Card style={styles.section}>
                    <View style={styles.infoRow}>
                      <Ionicons
                        name="information-circle"
                        size={20}
                        color={colors.primary}
                      />
                      <Text
                        style={[
                          styles.infoText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {t('appearance.info')}
                      </Text>
                    </View>
                  </Card>
                </View>

                {/* Right Column - Sets */}
                <View style={styles.desktopRightColumn}>
                  <View style={styles.setsHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      {t('mySets.title')}
                    </Text>
                    <Text
                      style={[
                        styles.setsCount,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {t('common:counts.setCount', { count: sets.length })}
                    </Text>
                  </View>

                  {sets.length > 0 ? (
                    <View style={styles.setsList}>
                      {sets.map(set => (
                        <DesktopSetCard key={set.id} set={set} />
                      ))}
                    </View>
                  ) : (
                    <Card style={styles.section}>
                      <View style={styles.emptyState}>
                        <Ionicons
                          name="book-outline"
                          size={48}
                          color={colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.emptyText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {t('mySets.noSets')}
                        </Text>
                      </View>
                    </Card>
                  )}
                </View>
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
      edges={['top']}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/profile')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('title')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Guest Upgrade Banner */}
        {user?.isGuest && (
          <Card
            style={[
              styles.upgradeNotice,
              {
                backgroundColor: `${colors.warning}15`,
                borderColor: colors.warning,
              },
            ]}
          >
            <View style={styles.upgradeNoticeContent}>
              <Ionicons
                name="information-circle"
                size={24}
                color={colors.warning}
              />
              <View style={styles.upgradeNoticeText}>
                <Text
                  style={[styles.upgradeNoticeTitle, { color: colors.text }]}
                >
                  {t('auth:guest.youAreGuest')}
                </Text>
                <Text
                  style={[
                    styles.upgradeNoticeDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {t('auth:guest.savePermanently')}
                </Text>
              </View>
            </View>
            <Button
              title={t('auth:guest.upgradeNow')}
              onPress={() => router.push('/(auth)/login')}
              variant="outline"
              style={styles.upgradeNoticeButton}
            />
          </Card>
        )}

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('languages.title')}
          </Text>
          <Text
            style={[styles.sectionDescription, { color: colors.textSecondary }]}
          >
            {t('languages.description')}
          </Text>

          <View style={styles.languageDropdowns}>
            <LanguageDropdown
              languages={AVAILABLE_LANGUAGES}
              selectedLanguage={preferences.targetLanguage}
              onSelect={handleTargetLanguageChange}
              placeholder={t('languages.targetPlaceholder')}
              label={t('languages.targetLanguage')}
            />

            <LanguageDropdown
              languages={nativeLanguageOptions}
              selectedLanguage={preferences.nativeLanguage}
              onSelect={handleNativeLanguageChange}
              placeholder={t('languages.nativePlaceholder')}
              label={t('languages.nativeLanguage')}
            />
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('appearance.title')}
          </Text>
          <Text
            style={[styles.sectionDescription, { color: colors.textSecondary }]}
          >
            {t('appearance.description')}
          </Text>

          <View style={styles.themeOptions}>
            {themeOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.themeOption,
                  {
                    borderColor:
                      theme === option.value ? colors.primary : colors.border,
                    backgroundColor:
                      theme === option.value
                        ? `${colors.primary}10`
                        : 'transparent',
                  },
                ]}
                onPress={() => handleThemeChange(option.value)}
              >
                <Ionicons
                  name={option.icon}
                  size={32}
                  color={
                    theme === option.value
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.themeOptionLabel,
                    {
                      color:
                        theme === option.value ? colors.primary : colors.text,
                      fontWeight: theme === option.value ? '600' : '400',
                    },
                  ]}
                >
                  {option.label}
                </Text>
                {theme === option.value && (
                  <View style={styles.checkmark}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.section}>
          <View style={styles.infoRow}>
            <Ionicons
              name="information-circle"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {t('appearance.info')}
            </Text>
          </View>
        </Card>

        <View style={styles.setsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('mySets.title')}
          </Text>
          <Text
            style={[styles.sectionDescription, { color: colors.textSecondary }]}
          >
            {t('mySets.manage')}
          </Text>
        </View>

        {sets.length > 0 ? (
          sets.map(set => <SetCard key={set.id} set={set} />)
        ) : (
          <Card style={styles.section}>
            <View style={styles.emptyState}>
              <Ionicons
                name="book-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('mySets.noSets')}
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...Typography.h1,
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h2,
    fontSize: 20,
    marginBottom: Spacing.sm,
  },
  sectionDescription: {
    ...Typography.body,
    marginBottom: Spacing.lg,
  },
  themeOptions: {
    gap: Spacing.md,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    gap: Spacing.md,
  },
  themeOptionLabel: {
    ...Typography.body,
    fontSize: 18,
    flex: 1,
  },
  checkmark: {
    marginLeft: 'auto',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  infoText: {
    ...Typography.caption,
    flex: 1,
    lineHeight: 20,
  },
  languageDropdowns: {
    gap: Spacing.lg,
  },
  setsSection: {
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
  },
  upgradeNotice: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    borderRadius: BorderRadius.cardLarge,
  },
  upgradeNoticeContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  upgradeNoticeText: {
    flex: 1,
  },
  upgradeNoticeTitle: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  upgradeNoticeDescription: {
    ...Typography.caption,
    fontSize: 14,
    lineHeight: 20,
  },
  upgradeNoticeButton: {
    marginTop: Spacing.xs,
  },
  // Desktop styles
  desktopContainer: {
    flex: 1,
  },
  desktopHeader: {
    borderBottomWidth: 1,
    paddingVertical: Spacing.lg,
  },
  desktopHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  desktopContent: {
    flex: 1,
  },
  desktopScrollContent: {
    paddingVertical: Spacing.xxl,
  },
  desktopLayout: {
    flexDirection: 'row',
    gap: Spacing.xxl,
  },
  desktopLeftColumn: {
    width: 480,
  },
  desktopRightColumn: {
    flex: 1,
  },
  desktopLanguageRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  desktopLanguageColumn: {
    flex: 1,
  },
  desktopThemeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  desktopThemeOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    gap: Spacing.sm,
  },
  desktopCheckmark: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  setsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  setsCount: {
    ...Typography.body,
    fontSize: 14,
  },
  setsList: {
    gap: Spacing.sm,
  },
});
