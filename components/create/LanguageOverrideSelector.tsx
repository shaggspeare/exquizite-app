import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage, AVAILABLE_LANGUAGES } from '@/contexts/LanguageContext';
import { LanguageDropdown } from '@/components/ui/LanguageDropdown';
import { LanguageBadge } from '@/components/ui/LanguageBadge';
import { Card } from '@/components/ui/Card';
import { Spacing, Typography } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';

interface LanguageOverrideSelectorProps {
  targetLanguage: string | null;
  nativeLanguage: string | null;
  onTargetLanguageChange: (lang: string) => void;
  onNativeLanguageChange: (lang: string) => void;
  onUseDefaults: () => void;
}

export function LanguageOverrideSelector({
  targetLanguage,
  nativeLanguage,
  onTargetLanguageChange,
  onNativeLanguageChange,
  onUseDefaults,
}: LanguageOverrideSelectorProps) {
  const { t } = useTranslation('create');
  const { colors } = useTheme();
  const { preferences } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const isUsingDefaults =
    targetLanguage === preferences.targetLanguage &&
    nativeLanguage === preferences.nativeLanguage;

  const hasOverride = targetLanguage && nativeLanguage && !isUsingDefaults;

  return (
    <Card style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="language" size={20} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('languageOverride.title')}
          </Text>
          {hasOverride && (
            <View
              style={[
                styles.overrideBadge,
                { backgroundColor: `${colors.warning}20` },
              ]}
            >
              <Text style={[styles.overrideBadgeText, { color: colors.warning }]}>
                {t('languageOverride.custom')}
              </Text>
            </View>
          )}
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {expanded && (
        <>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.content}>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {t('languageOverride.description')}
            </Text>

            {isUsingDefaults ? (
              <View style={styles.defaultsSection}>
                <View style={styles.defaultsHeader}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={[styles.defaultsText, { color: colors.success }]}>
                    {t('languageOverride.usingDefaults')}
                  </Text>
                </View>
                <View style={styles.badgeContainer}>
                  <LanguageBadge
                    targetLanguage={preferences.targetLanguage!}
                    nativeLanguage={preferences.nativeLanguage!}
                    size="small"
                  />
                </View>
              </View>
            ) : (
              <>
                <View style={styles.dropdowns}>
                  <LanguageDropdown
                    languages={AVAILABLE_LANGUAGES}
                    selectedLanguage={targetLanguage}
                    onSelect={onTargetLanguageChange}
                    placeholder={t('languageOverride.selectTarget')}
                    label={t('languageOverride.targetLabel')}
                  />

                  <LanguageDropdown
                    languages={AVAILABLE_LANGUAGES}
                    selectedLanguage={nativeLanguage}
                    onSelect={onNativeLanguageChange}
                    placeholder={t('languageOverride.selectNative')}
                    label={t('languageOverride.nativeLabel')}
                  />
                </View>

                {targetLanguage && nativeLanguage && (
                  <View style={styles.previewContainer}>
                    <LanguageBadge
                      targetLanguage={targetLanguage}
                      nativeLanguage={nativeLanguage}
                      size="small"
                    />
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.resetButton,
                    {
                      backgroundColor: `${colors.primary}10`,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={onUseDefaults}
                >
                  <Ionicons name="refresh" size={18} color={colors.primary} />
                  <Text style={[styles.resetButtonText, { color: colors.primary }]}>
                    {t('languageOverride.useDefaults')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  headerTitle: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
  },
  overrideBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  overrideBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  description: {
    ...Typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  defaultsSection: {
    gap: Spacing.md,
  },
  defaultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  defaultsText: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '600',
  },
  badgeContainer: {
    alignItems: 'flex-start',
  },
  dropdowns: {
    gap: Spacing.md,
  },
  previewContainer: {
    alignItems: 'flex-start',
    paddingTop: Spacing.xs,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: Spacing.xs,
  },
  resetButtonText: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '600',
  },
});
