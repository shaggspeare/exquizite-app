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
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing, Typography } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { sets, deleteSet } = useSets();

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
          {user?.email && <Text style={styles.userEmail}>{user.email}</Text>}
          <View style={styles.accountType}>
            <Ionicons
              name={user?.isGuest ? 'person-outline' : 'logo-google'}
              size={16}
              color={Colors.textSecondary}
            />
            <Text style={styles.accountTypeText}>
              {user?.isGuest ? 'Guest Account' : 'Google Account'}
            </Text>
          </View>
        </Card>

        <Card style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Ionicons name="library" size={32} color={Colors.primary} />
              <Text style={styles.statValue}>{sets.length}</Text>
              <Text style={styles.statLabel}>Sets Created</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="book" size={32} color={Colors.primary} />
              <Text style={styles.statValue}>{totalWords}</Text>
              <Text style={styles.statLabel}>Total Words</Text>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Sets</Text>
          {sets.length === 0 ? (
            <Text style={styles.emptyText}>No sets created yet</Text>
          ) : (
            sets.map(set => (
              <Card key={set.id} style={styles.setCard}>
                <View style={styles.setInfo}>
                  <Text style={styles.setName}>{set.name}</Text>
                  <Text style={styles.setMeta}>
                    {set.words.length} {set.words.length === 1 ? 'word' : 'words'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteSet(set.id, set.name)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={24} color={Colors.error} />
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
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.h1,
    fontSize: 28,
    color: Colors.text,
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
    backgroundColor: `${Colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  userName: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    ...Typography.body,
    color: Colors.textSecondary,
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
    color: Colors.textSecondary,
  },
  statsCard: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h2,
    fontSize: 18,
    color: Colors.text,
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
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
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
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  setMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  actions: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});
