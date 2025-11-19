import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Spacing, Typography } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';

interface GameTemplate {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  aiEnabled?: boolean;
}

const templates: GameTemplate[] = [
  {
    id: 'flashcard',
    title: 'Flashcard',
    description: 'Flip to reveal translations',
    icon: 'layers',
    route: 'flashcard',
    aiEnabled: false,
  },
  {
    id: 'match',
    title: 'Match',
    description: 'Drag and connect pairs',
    icon: 'git-compare',
    route: 'match',
  },
  {
    id: 'quiz',
    title: 'Quiz',
    description: 'Multiple choice questions',
    icon: 'help-circle',
    route: 'quiz',
    aiEnabled: false,
  },
  {
    id: 'fill-blank',
    title: 'Fill in the Blank',
    description: 'Complete sentences with the right word',
    icon: 'create',
    route: 'fill-blank',
    aiEnabled: false,
  },
];

export default function TemplateSelectionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();

  const handleSelectTemplate = (template: GameTemplate) => {
    router.push(`/sets/${id}/play/${template.route}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Choose Activity</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.content}>
        {templates.map(template => (
          <TouchableOpacity
            key={template.id}
            onPress={() => handleSelectTemplate(template)}
            activeOpacity={0.7}
          >
            <Card style={styles.templateCard}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}10` }]}>
                <Ionicons
                  name={template.icon}
                  size={48}
                  color={colors.primary}
                />
              </View>
              <View style={styles.templateInfo}>
                <Text style={[styles.templateTitle, { color: colors.text }]}>{template.title}</Text>
                <Text style={[styles.templateDescription, { color: colors.textSecondary }]}>
                  {template.description}
                </Text>
                {template.aiEnabled && (
                  <View style={styles.aiBadge}>
                    <Ionicons name="sparkles" size={14} color={colors.ai} />
                    <Text style={[styles.aiBadgeText, { color: colors.ai }]}>AI hints available</Text>
                  </View>
                )}
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={colors.textSecondary}
              />
            </Card>
          </TouchableOpacity>
        ))}
      </View>
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
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 20,
  },
  headerPlaceholder: {
    width: 28,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  templateInfo: {
    flex: 1,
  },
  templateTitle: {
    ...Typography.h2,
    fontSize: 20,
    marginBottom: Spacing.xs,
  },
  templateDescription: {
    ...Typography.body,
    marginBottom: Spacing.xs,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  aiBadgeText: {
    ...Typography.caption,
  },
});
