import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Spacing, Typography, BorderRadius } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { showAlert } from '@/lib/alert';
import { DesktopLayout } from '@/components/layout/DesktopLayout';
import { DesktopContainer } from '@/components/layout/DesktopContainer';

export default function LoginScreen() {
  const { signInWithEmail, signUpWithEmail, signInAsGuest } = useAuth();
  const { colors } = useTheme();
  const { isDesktop } = useResponsive();
  const { mode } = useLocalSearchParams();
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp) {
      if (!name.trim()) {
        showAlert('Error', 'Please enter your name');
        return;
      }
      if (password !== confirmPassword) {
        showAlert('Error', 'Passwords do not match');
        return;
      }
      if (password.length < 6) {
        showAlert('Error', 'Password must be at least 6 characters');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email.trim(), password, name.trim());
        // If signup succeeds without error, user is signed in
        // The router will automatically redirect to language setup
        // Clear form but don't switch modes or show alert
      } else {
        await signInWithEmail(email.trim(), password);
      }
    } catch (error: any) {
      showAlert('Error', error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    try {
      await signInAsGuest('Guest User');
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to continue as guest');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setPassword('');
    setConfirmPassword('');
  };

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
                <View style={styles.desktopHeader}>
                  <Text style={[styles.desktopLogo, { color: colors.primary }]}>Exquizite</Text>
                  <Text style={[styles.desktopSubtitle, { color: colors.textSecondary }]}>
                    Learn vocabulary with AI-powered games
                  </Text>
                </View>

                <Card style={styles.desktopFormCard}>
                  <Text style={[styles.desktopFormTitle, { color: colors.text }]}>
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                  </Text>

                  {isSignUp && (
                    <Input
                      label="Name"
                      value={name}
                      onChangeText={setName}
                      placeholder="Your name"
                      autoCapitalize="words"
                    />
                  )}

                  <Input
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  <Input
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder={isSignUp ? 'Min 6 characters' : 'Enter password'}
                    secureTextEntry
                    autoCapitalize="none"
                  />

                  {isSignUp && (
                    <Input
                      label="Confirm Password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Re-enter password"
                      secureTextEntry
                      autoCapitalize="none"
                    />
                  )}

                  <Button
                    title={isSignUp ? 'Sign Up' : 'Sign In'}
                    onPress={handleEmailAuth}
                    disabled={isLoading}
                    style={styles.desktopPrimaryButton}
                  />

                  <Button
                    title={isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
                    onPress={toggleMode}
                    variant="text"
                    disabled={isLoading}
                  />

                  <View style={styles.desktopDivider}>
                    <View style={[styles.desktopDividerLine, { backgroundColor: colors.border }]} />
                    <Text style={[styles.desktopDividerText, { color: colors.textSecondary }]}>or</Text>
                    <View style={[styles.desktopDividerLine, { backgroundColor: colors.border }]} />
                  </View>

                  <Button
                    title="Continue as Guest"
                    onPress={handleGuestSignIn}
                    variant="outline"
                    disabled={isLoading}
                  />
                </Card>

                <View style={styles.desktopFooter}>
                  <Ionicons name="sparkles" size={20} color={colors.ai} />
                  <Text style={[styles.desktopFooterText, { color: colors.textSecondary }]}>
                    AI-enhanced learning experience
                  </Text>
                </View>
              </View>
            </DesktopContainer>
          </ScrollView>
        </View>
      </DesktopLayout>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.logo, { color: colors.primary }]}>Exquizite</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Learn vocabulary with AI-powered games
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={[styles.formTitle, { color: colors.text }]}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>

            {isSignUp && (
              <Input
                label="Name"
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                autoCapitalize="words"
              />
            )}

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder={isSignUp ? 'Min 6 characters' : 'Enter password'}
              secureTextEntry
              autoCapitalize="none"
            />

            {isSignUp && (
              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter password"
                secureTextEntry
                autoCapitalize="none"
              />
            )}

            <Button
              title={isSignUp ? 'Sign Up' : 'Sign In'}
              onPress={handleEmailAuth}
              disabled={isLoading}
              style={styles.primaryButton}
            />

            <Button
              title={isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
              onPress={toggleMode}
              variant="text"
              disabled={isLoading}
            />

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <Button
              title="Continue as Guest"
              onPress={handleGuestSignIn}
              variant="outline"
              disabled={isLoading}
            />
          </View>

          <View style={styles.footer}>
            <Ionicons name="sparkles" size={20} color={colors.ai} />
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              AI-enhanced learning experience
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logo: {
    ...Typography.h1,
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: Spacing.xl,
  },
  formTitle: {
    ...Typography.h2,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  primaryButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...Typography.caption,
    marginHorizontal: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  footerText: {
    ...Typography.caption,
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
    maxWidth: 480,
    marginHorizontal: 'auto' as any,
    width: '100%',
  },
  desktopHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  desktopLogo: {
    ...Typography.h1,
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  desktopSubtitle: {
    ...Typography.body,
    fontSize: 16,
    textAlign: 'center',
  },
  desktopFormCard: {
    padding: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  desktopFormTitle: {
    ...Typography.h2,
    fontSize: 24,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  desktopPrimaryButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  desktopDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  desktopDividerLine: {
    flex: 1,
    height: 1,
  },
  desktopDividerText: {
    ...Typography.caption,
    marginHorizontal: Spacing.md,
  },
  desktopFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  desktopFooterText: {
    ...Typography.caption,
    fontSize: 14,
  },
});
