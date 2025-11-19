import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useSets } from '@/contexts/SetsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spacing, Typography } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { sets, deleteSet } = useSets();
  const { colors } = useTheme();
  const router = useRouter();

  const totalWords = sets.reduce((sum, set) => sum + set.words.length, 0);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const handleDeleteSet = (setId: string, setName: string) => {
    Alert.alert(
      'Delete Set',
      `Are you sure you want to delete "${setName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSet(setId),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/settings')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: `${colors.primary}20` }]}>
            <Ionicons name="person" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'Guest'}</Text>
          {user?.email && <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>}
          <View style={styles.accountType}>
            <Ionicons
              name={user?.isGuest ? 'person-outline' : 'logo-google'}
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.accountTypeText, { color: colors.textSecondary }]}>
              {user?.isGuest ? 'Guest Account' : 'Google Account'}
            </Text>
          </View>
        </Card>

        <Card style={styles.statsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistics</Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Ionicons name="library" size={32} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>{sets.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Sets Created</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="book" size={32} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>{totalWords}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Words</Text>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Sets</Text>
          {sets.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No sets created yet</Text>
          ) : (
            sets.map(set => (
              <Card key={set.id} style={styles.setCard}>
                <View style={styles.setInfo}>
                  <Text style={[styles.setName, { color: colors.text }]}>{set.name}</Text>
                  <Text style={[styles.setMeta, { color: colors.textSecondary }]}>
                    {set.words.length} {set.words.length === 1 ? 'word' : 'words'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteSet(set.id, set.name)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={24} color={colors.error} />
                </TouchableOpacity>
              </Card>
            ))
          )}
        </View>

        <View style={styles.actions}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="outline"
          />
        </View>
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
  profileCard: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  userName: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    ...Typography.body,
    marginBottom: Spacing.sm,
  },
  accountType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  accountTypeText: {
    ...Typography.caption,
  },
  statsCard: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h2,
    fontSize: 18,
    marginBottom: Spacing.md,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Spacing.lg,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h1,
    fontSize: 24,
    marginTop: Spacing.sm,
  },
  statLabel: {
    ...Typography.caption,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  setCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  setInfo: {
    flex: 1,
  },
  setName: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  setMeta: {
    ...Typography.caption,
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  actions: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});
