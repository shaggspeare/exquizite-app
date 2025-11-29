import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Share } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/contexts/ThemeContext';
import { useSets } from '@/contexts/SetsContext';
import { WordSet, ShareMetadata } from '@/lib/types';
import { Spacing, Typography, BorderRadius, Shadow } from '@/lib/constants';
import { BlurView } from 'expo-blur';
import { generateShareText } from '@/lib/share-utils';
import { showAlert } from '@/lib/alert';

interface ShareModalProps {
  visible: boolean;
  set: WordSet | null;
  onClose: () => void;
}

export function ShareModal({ visible, set, onClose }: ShareModalProps) {
  const { colors } = useTheme();
  const { shareSet, deleteShare } = useSets();
  const [shareData, setShareData] = useState<ShareMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (visible && set) {
      generateShareLink();
    }
  }, [visible, set]);

  const generateShareLink = async () => {
    if (!set) return;

    setIsLoading(true);
    try {
      const data = await shareSet(set.id);
      if (data) {
        setShareData(data);
      } else {
        showAlert('Error', 'Failed to generate share link. Please try again.');
        onClose();
      }
    } catch (error) {
      console.error('Error generating share link:', error);
      showAlert('Error', 'Failed to generate share link. Please try again.');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareData) return;

    try {
      await Clipboard.setStringAsync(shareData.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showAlert('Error', 'Failed to copy link to clipboard');
    }
  };

  const handleDeleteShare = () => {
    if (!set) return;

    showAlert(
      'Deactivate Share Link',
      'Are you sure you want to deactivate this share link? Anyone with the link will no longer be able to access this set.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteShare(set.id);
              showAlert('Success', 'Share link has been deactivated');
              onClose();
            } catch (error) {
              showAlert('Error', 'Failed to deactivate share link');
            }
          },
        },
      ]
    );
  };

  const handleNativeShare = async () => {
    if (!set || !shareData) return;

    try {
      const message = generateShareText(set.name, shareData.shareCode, set.words.length, true);

      await Share.share({
        message,
        title: `Share "${set.name}"`,
      });
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.message !== 'User did not share') {
        console.error('Error sharing:', error);
      }
    }
  };

  if (!set) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={40} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.7)' }]} />
        )}

        <View style={styles.modalContainer}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                <Ionicons name="share-social" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Share Set</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Set Info */}
            <View style={[styles.setInfo, { backgroundColor: colors.background }]}>
              <Text style={[styles.setName, { color: colors.text }]}>{set.name}</Text>
              <Text style={[styles.setMeta, { color: colors.textSecondary }]}>
                {set.words.length} words • {set.targetLanguage.toUpperCase()} → {set.nativeLanguage.toUpperCase()}
              </Text>
            </View>

            {/* Loading State */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Generating share link...
                </Text>
              </View>
            )}

            {/* Share Link */}
            {!isLoading && shareData && (
              <>
                {/* Share Code */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                    Share Code
                  </Text>
                  <View style={[styles.codeContainer, { backgroundColor: colors.background }]}>
                    <Text style={[styles.shareCode, { color: colors.text }]}>
                      {shareData.shareCode}
                    </Text>
                  </View>
                </View>

                {/* Share Link */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                    Share Link
                  </Text>
                  <TouchableOpacity
                    style={[styles.linkContainer, { backgroundColor: colors.background }]}
                    onPress={handleCopyLink}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.shareLink, { color: colors.primary }]}
                      numberOfLines={1}
                      ellipsizeMode="middle"
                    >
                      {shareData.shareUrl}
                    </Text>
                    <Ionicons
                      name={copied ? 'checkmark-circle' : 'copy-outline'}
                      size={20}
                      color={copied ? colors.success : colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Stats */}
                <View style={[styles.statsContainer, { backgroundColor: colors.background }]}>
                  <View style={styles.stat}>
                    <Ionicons name="eye-outline" size={20} color={colors.primary} />
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Views</Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {shareData.viewCount}
                    </Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.stat}>
                    <Ionicons name="copy-outline" size={20} color={colors.success} />
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Copies</Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {shareData.copyCount}
                    </Text>
                  </View>
                </View>

                {/* Info Message */}
                <View style={[styles.infoBox, { backgroundColor: `${colors.primary}15` }]}>
                  <Ionicons name="information-circle" size={18} color={colors.primary} />
                  <Text style={[styles.infoText, { color: colors.primary }]}>
                    Anyone with this link can view and copy your set
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={handleCopyLink}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="copy-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>
                      {copied ? 'Copied!' : 'Copy'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.success }]}
                    onPress={handleNativeShare}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Share</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.deleteButton, { borderColor: colors.error }]}
                    onPress={handleDeleteShare}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
  },
  modal: {
    borderRadius: BorderRadius.cardLarge,
    padding: Spacing.xl,
    ...Shadow.cardDeep,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.h2,
    flex: 1,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  setInfo: {
    padding: Spacing.md,
    borderRadius: BorderRadius.input,
    marginBottom: Spacing.lg,
  },
  setName: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
  },
  setMeta: {
    ...Typography.caption,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  loadingText: {
    ...Typography.body,
    marginTop: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  codeContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.input,
    alignItems: 'center',
  },
  shareCode: {
    ...Typography.h2,
    fontWeight: '700',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.input,
    gap: Spacing.sm,
  },
  shareLink: {
    ...Typography.body,
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.input,
    marginBottom: Spacing.lg,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statDivider: {
    width: 1,
    marginHorizontal: Spacing.md,
  },
  statLabel: {
    ...Typography.small,
  },
  statValue: {
    ...Typography.h3,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.input,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  infoText: {
    ...Typography.caption,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.button,
    gap: Spacing.xs,
    ...Shadow.button,
  },
  actionButtonText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  deleteButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.button,
    borderWidth: 2,
  },
});
