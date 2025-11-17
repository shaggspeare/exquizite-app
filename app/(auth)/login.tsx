import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing, Typography } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { signInWithGoogle, signInAsGuest } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setIsLoading(true);
      await signInAsGuest('Guest User');
    } catch (error) {
      Alert.alert('Error', 'Failed to continue as guest');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>Exquizite</Text>
          <Text style={styles.subtitle}>
            Learn vocabulary with AI-powered games
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Sign in with Google"
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            style={styles.googleButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Continue as Guest"
            onPress={handleGuestSignIn}
            variant="outline"
            disabled={isLoading}
          />
        </View>

        <View style={styles.footer}>
          <Ionicons name="sparkles" size={20} color={Colors.ai} />
          <Text style={styles.footerText}>
            AI-enhanced learning experience
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl * 2,
  },
  logo: {
    ...Typography.h1,
    fontSize: 48,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    gap: Spacing.md,
  },
  googleButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xxl * 2,
    gap: Spacing.sm,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
