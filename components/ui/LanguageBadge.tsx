import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { getLanguageName, AVAILABLE_LANGUAGES } from '@/contexts/LanguageContext';
import { Spacing, Typography } from '@/lib/constants';

interface LanguageBadgeProps {
  targetLanguage: string;
  nativeLanguage: string;
  size?: 'small' | 'medium';
  compact?: boolean; // Show only flags, no text
}

export function LanguageBadge({
  targetLanguage,
  nativeLanguage,
  size = 'medium',
  compact = false,
}: LanguageBadgeProps) {
  const { colors } = useTheme();

  const targetLang = AVAILABLE_LANGUAGES.find(l => l.code === targetLanguage);
  const nativeLang = AVAILABLE_LANGUAGES.find(l => l.code === nativeLanguage);

  if (!targetLang || !nativeLang) {
    return null;
  }

  const isSmall = size === 'small';

  // Compact mode: only flags/codes, no text
  if (compact) {
    return (
      <View
        style={[
          styles.containerCompact,
          {
            backgroundColor: `${colors.primary}08`,
            borderColor: `${colors.primary}20`,
          },
        ]}
      >
        {Platform.OS === 'web' ? (
          <View style={[styles.codeBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.codeText}>
              {targetLanguage.toUpperCase()}
            </Text>
          </View>
        ) : (
          <Text style={styles.flagCompact}>
            {targetLang.flag}
          </Text>
        )}

        <Text style={[styles.arrow, { color: colors.textSecondary }]}>→</Text>

        {Platform.OS === 'web' ? (
          <View style={[styles.codeBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.codeText}>
              {nativeLanguage.toUpperCase()}
            </Text>
          </View>
        ) : (
          <Text style={styles.flagCompact}>
            {nativeLang.flag}
          </Text>
        )}
      </View>
    );
  }

  // Full mode: flags + text
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `${colors.primary}08`,
          borderColor: `${colors.primary}20`,
        },
        isSmall && styles.containerSmall,
      ]}
    >
      {Platform.OS === 'web' ? (
        <View style={[styles.codeBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.codeText}>
            {targetLanguage.toUpperCase()}
          </Text>
        </View>
      ) : (
        <Text style={isSmall ? styles.flagSmall : styles.flag}>
          {targetLang.flag}
        </Text>
      )}
      <Text
        style={[
          styles.text,
          { color: colors.text },
          isSmall && styles.textSmall,
        ]}
      >
        {targetLang.name}
      </Text>

      <Text style={[styles.arrow, { color: colors.textSecondary }]}>→</Text>

      {Platform.OS === 'web' ? (
        <View style={[styles.codeBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.codeText}>
            {nativeLanguage.toUpperCase()}
          </Text>
        </View>
      ) : (
        <Text style={isSmall ? styles.flagSmall : styles.flag}>
          {nativeLang.flag}
        </Text>
      )}
      <Text
        style={[
          styles.text,
          { color: colors.text },
          isSmall && styles.textSmall,
        ]}
      >
        {nativeLang.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  containerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  codeBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  flag: {
    fontSize: 16,
    ...Platform.select({
      web: {
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Segoe UI Emoji", "Segoe UI Symbol", "Apple Color Emoji", "Twemoji Mozilla", "Noto Color Emoji", "Android Emoji"',
      },
    }),
  },
  flagSmall: {
    fontSize: 14,
    ...Platform.select({
      web: {
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Segoe UI Emoji", "Segoe UI Symbol", "Apple Color Emoji", "Twemoji Mozilla", "Noto Color Emoji", "Android Emoji"',
      },
    }),
  },
  flagCompact: {
    fontSize: 18,
    ...Platform.select({
      web: {
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Segoe UI Emoji", "Segoe UI Symbol", "Apple Color Emoji", "Twemoji Mozilla", "Noto Color Emoji", "Android Emoji"',
      },
    }),
  },
  arrow: {
    ...Typography.body,
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.6,
  },
  text: {
    ...Typography.body,
    fontSize: 13,
    fontWeight: '500',
  },
  textSmall: {
    fontSize: 11,
    fontWeight: '500',
  },
});
