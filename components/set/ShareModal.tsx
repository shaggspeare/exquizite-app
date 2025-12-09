import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Share,
  ScrollView,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useSets } from '@/contexts/SetsContext';
import { WordSet, ShareMetadata } from '@/lib/types';
import { Spacing, Typography, BorderRadius, Shadow } from '@/lib/constants';
import { BlurView } from 'expo-blur';
import { generateShareText, generateWebShareUrl } from '@/lib/share-utils';
import { showAlert } from '@/lib/alert';
import {
  canUseWebShare,
  canUseClipboard,
  shareViaWebAPI,
  copyToClipboard as copyToClipboardWeb,
  getSocialShareUrls,
  openInNewTab,
  type SocialPlatform,
} from '@/lib/web-share';

interface ShareModalProps {
  visible: boolean;
  set: WordSet | null;
  onClose: () => void;
}

export function ShareModal({ visible, set, onClose }: ShareModalProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { shareSet, deleteShare } = useSets();
  const [shareData, setShareData] = useState<ShareMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [canCopy, setCanCopy] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setCanShare(canUseWebShare());
      setCanCopy(canUseClipboard());
    }
  }, []);

  useEffect(() => {
    if (visible && set) {
      // Clear previous share data when opening modal for a new set
      setShareData(null);
      setCopied(false);
      setIsLoading(true);
      generateShareLink();
    } else if (!visible) {
      // Cleanup when modal closes
      setShareData(null);
      setCopied(false);
      setIsLoading(false);
    }
  }, [visible, set]);

  const generateShareLink = async () => {
    if (!set || isLoading) return; // Prevent multiple simultaneous calls

    setIsLoading(true);
    try {
      console.log('ShareModal: Generating share link for set:', set.id);
      const data = await shareSet(set.id);
      console.log('ShareModal: Share link result:', data);

      if (data) {
        setShareData(data);
      } else {
        showAlert(t('common:status.error'), t('common:sharing.shareError'));
        onClose();
      }
    } catch (error) {
      console.error('ShareModal: Error generating share link:', error);
      showAlert(t('common:status.error'), t('common:sharing.shareError'));
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareData) return;

    try {
      const urlToCopy =
        Platform.OS === 'web'
          ? generateWebShareUrl(shareData.shareCode)
          : shareData.shareUrl;

      if (Platform.OS === 'web' && canCopy) {
        await copyToClipboardWeb(urlToCopy);
      } else {
        await Clipboard.setStringAsync(urlToCopy);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showAlert(t('common:status.error'), t('common:sharing.copyError'));
    }
  };

  const handleDeleteShare = () => {
    if (!set) return;

    showAlert(
      t('common:sharing.deactivateLink'),
      t('common:sharing.deactivateConfirm'),
      [
        { text: t('common:buttons.cancel'), style: 'cancel' },
        {
          text: t('common:sharing.deactivate'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteShare(set.id);
              showAlert(t('common:status.success'), t('common:sharing.linkDeactivated'));
              onClose();
            } catch (error) {
              showAlert(t('common:status.error'), t('common:sharing.shareError'));
            }
          },
        },
      ]
    );
  };

  const handleNativeShare = async () => {
    if (!set || !shareData) return;

    try {
      const message = generateShareText(
        set.name,
        shareData.shareCode,
        set.words.length,
        true
      );

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

  const handleWebShare = async () => {
    if (!set || !shareData) return;

    const webUrl = generateWebShareUrl(shareData.shareCode);
    const message = generateShareText(
      set.name,
      shareData.shareCode,
      set.words.length,
      true
    );

    try {
      if (canShare) {
        const success = await shareViaWebAPI({
          title: `Check out "${set.name}"`,
          text: message,
          url: webUrl,
        });

        if (success) return;
      }

      // Fallback to copy
      await handleCopyLink();
      showAlert(t('common:sharing.linkCopied'), t('common:sharing.linkCopiedToClipboard'));
    } catch (error) {
      console.error('Error sharing:', error);
      showAlert(t('common:status.error'), t('common:sharing.shareError'));
    }
  };

  const handleSocialShare = (platform: SocialPlatform) => {
    if (!set || !shareData) return;

    const webUrl = generateWebShareUrl(shareData.shareCode);
    const message = `Check out my "${set.name}" word set with ${set.words.length} words!`;

    const urls = getSocialShareUrls(webUrl, set.name, message);
    const targetUrl = urls[platform];

    openInNewTab(targetUrl);
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
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(0,0,0,0.7)' },
            ]}
          />
        )}

        <View style={styles.modalContainer}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            {/* Header - Fixed at top */}
            <View style={styles.header}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Ionicons name="share-social" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                {t('common:sharing.shareSet')}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
              bounces={true}
            >
              {/* Set Info */}
              <View
                style={[styles.setInfo, { backgroundColor: colors.background }]}
              >
                <Text style={[styles.setName, { color: colors.text }]}>
                  {set.name}
                </Text>
                <Text style={[styles.setMeta, { color: colors.textSecondary }]}>
                  {set.words.length} words • {set.targetLanguage.toUpperCase()}{' '}
                  → {set.nativeLanguage.toUpperCase()}
                </Text>
              </View>

              {/* Loading State */}
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text
                    style={[
                      styles.loadingText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {t('common:sharing.generatingLink')}
                  </Text>
                </View>
              )}

              {/* Share Link */}
              {!isLoading && shareData && (
                <>
                  {/* Share Code */}
                  <View style={styles.section}>
                    <Text
                      style={[
                        styles.sectionLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {t('common:sharing.shareCode')}
                    </Text>
                    <View
                      style={[
                        styles.codeContainer,
                        { backgroundColor: colors.background },
                      ]}
                    >
                      <Text style={[styles.shareCode, { color: colors.text }]}>
                        {shareData.shareCode}
                      </Text>
                    </View>
                  </View>

                  {/* Share Link */}
                  <View style={styles.section}>
                    <Text
                      style={[
                        styles.sectionLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {t('common:sharing.shareLink')}
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.linkContainer,
                        { backgroundColor: colors.background },
                      ]}
                      onPress={handleCopyLink}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[styles.shareLink, { color: colors.primary }]}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                      >
                        {Platform.OS === 'web'
                          ? generateWebShareUrl(shareData.shareCode)
                          : shareData.shareUrl}
                      </Text>
                      <Ionicons
                        name={copied ? 'checkmark-circle' : 'copy-outline'}
                        size={20}
                        color={copied ? colors.success : colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Stats */}
                  <View
                    style={[
                      styles.statsContainer,
                      { backgroundColor: colors.background },
                    ]}
                  >
                    <View style={styles.stat}>
                      <Ionicons
                        name="eye-outline"
                        size={20}
                        color={colors.primary}
                      />
                      <Text
                        style={[
                          styles.statLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {t('common:sharing.views')}
                      </Text>
                      <Text style={[styles.statValue, { color: colors.text }]}>
                        {shareData.viewCount}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statDivider,
                        { backgroundColor: colors.border },
                      ]}
                    />
                    <View style={styles.stat}>
                      <Ionicons
                        name="copy-outline"
                        size={20}
                        color={colors.success}
                      />
                      <Text
                        style={[
                          styles.statLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {t('common:sharing.copies')}
                      </Text>
                      <Text style={[styles.statValue, { color: colors.text }]}>
                        {shareData.copyCount}
                      </Text>
                    </View>
                  </View>

                  {/* Info Message */}
                  <View
                    style={[
                      styles.infoBox,
                      { backgroundColor: `${colors.primary}15` },
                    ]}
                  >
                    <Ionicons
                      name="information-circle"
                      size={18}
                      color={colors.primary}
                    />
                    <Text style={[styles.infoText, { color: colors.primary }]}>
                      {t('common:sharing.linkInfo')}
                    </Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.actions}>
                    {Platform.OS === 'web' ? (
                      <>
                        {/* Web Share Button (if supported) */}
                        {canShare && (
                          <TouchableOpacity
                            style={[
                              styles.actionButton,
                              { backgroundColor: colors.success },
                            ]}
                            onPress={handleWebShare}
                            activeOpacity={0.8}
                            accessibilityLabel="Share via Web Share API"
                            accessibilityRole="button"
                          >
                            <Ionicons
                              name="share-outline"
                              size={20}
                              color="#FFFFFF"
                            />
                            <Text style={styles.actionButtonText}>{t('common:buttons.share')}</Text>
                          </TouchableOpacity>
                        )}

                        {/* Copy Button (always visible on web) */}
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            { backgroundColor: colors.primary },
                          ]}
                          onPress={handleCopyLink}
                          activeOpacity={0.8}
                          accessibilityLabel="Copy link to clipboard"
                          accessibilityRole="button"
                        >
                          <Ionicons
                            name="copy-outline"
                            size={20}
                            color="#FFFFFF"
                          />
                          <Text style={styles.actionButtonText}>
                            {copied ? t('common:sharing.copied') : t('common:sharing.copyLink')}
                          </Text>
                        </TouchableOpacity>

                        {/* Delete Share Button */}
                        <TouchableOpacity
                          style={[
                            styles.deleteButton,
                            { borderColor: colors.error },
                          ]}
                          onPress={handleDeleteShare}
                          activeOpacity={0.7}
                          accessibilityLabel="Delete share link"
                          accessibilityRole="button"
                        >
                          <Ionicons
                            name="close-circle-outline"
                            size={20}
                            color={colors.error}
                          />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        {/* Native Mobile Actions */}
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            { backgroundColor: colors.primary },
                          ]}
                          onPress={handleCopyLink}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name="copy-outline"
                            size={20}
                            color="#FFFFFF"
                          />
                          <Text style={styles.actionButtonText}>
                            {copied ? t('common:sharing.copied') : t('common:sharing.copy')}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            { backgroundColor: colors.success },
                          ]}
                          onPress={handleNativeShare}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name="share-outline"
                            size={20}
                            color="#FFFFFF"
                          />
                          <Text style={styles.actionButtonText}>{t('common:buttons.share')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.deleteButton,
                            { borderColor: colors.error },
                          ]}
                          onPress={handleDeleteShare}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="close-circle-outline"
                            size={20}
                            color={colors.error}
                          />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>

                  {/* Social Media Buttons (Web only) */}
                  {Platform.OS === 'web' && shareData && (
                    <View style={styles.socialButtons}>
                      <TouchableOpacity
                        style={[
                          styles.socialButton,
                          { backgroundColor: '#1DA1F2' },
                        ]}
                        onPress={() => handleSocialShare('twitter')}
                        accessibilityLabel="Share on Twitter"
                        accessibilityRole="button"
                      >
                        <Ionicons
                          name="logo-twitter"
                          size={20}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.socialButton,
                          { backgroundColor: '#4267B2' },
                        ]}
                        onPress={() => handleSocialShare('facebook')}
                        accessibilityLabel="Share on Facebook"
                        accessibilityRole="button"
                      >
                        <Ionicons
                          name="logo-facebook"
                          size={20}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.socialButton,
                          { backgroundColor: '#25D366' },
                        ]}
                        onPress={() => handleSocialShare('whatsapp')}
                        accessibilityLabel="Share on WhatsApp"
                        accessibilityRole="button"
                      >
                        <Ionicons
                          name="logo-whatsapp"
                          size={20}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.socialButton,
                          { backgroundColor: '#0088cc' },
                        ]}
                        onPress={() => handleSocialShare('telegram')}
                        accessibilityLabel="Share on Telegram"
                        accessibilityRole="button"
                      >
                        <Ionicons
                          name="paper-plane"
                          size={20}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
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
    maxHeight: Platform.OS === 'web' ? '90%' : '80%',
  },
  modal: {
    borderRadius: BorderRadius.cardLarge,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    ...Shadow.cardDeep,
    maxHeight: '100%',
  },
  scrollView: {
    maxHeight: Platform.OS === 'web' ? undefined : 500,
  },
  scrollContent: {
    paddingBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: Platform.OS === 'web' ? 0 : 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  iconContainer: {
    width: 40,
    height: 40,
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
    padding: Spacing.sm,
    borderRadius: BorderRadius.input,
    marginBottom: Spacing.md,
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
    marginBottom: Spacing.md,
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
    padding: Spacing.sm,
    borderRadius: BorderRadius.input,
    marginBottom: Spacing.md,
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
    padding: Spacing.sm,
    borderRadius: BorderRadius.input,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
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
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.button,
    borderWidth: 2,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    justifyContent: 'center',
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.button,
  },
});
