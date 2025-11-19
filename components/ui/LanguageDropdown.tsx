import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { useState, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, Typography } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface LanguageDropdownProps {
  languages: Language[];
  selectedLanguage: string | null;
  onSelect: (code: string) => void;
  placeholder?: string;
  label?: string;
}

export function LanguageDropdown({
  languages,
  selectedLanguage,
  onSelect,
  placeholder = 'Select a language',
  label,
}: LanguageDropdownProps) {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedLang = languages.find(lang => lang.code === selectedLanguage);

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) {
      return languages;
    }
    const query = searchQuery.toLowerCase();
    return languages.filter(lang =>
      lang.name.toLowerCase().includes(query) || lang.code.toLowerCase().includes(query)
    );
  }, [languages, searchQuery]);

  const handleSelect = (code: string) => {
    onSelect(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}

      <TouchableOpacity
        style={[
          styles.trigger,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <View style={styles.triggerContent}>
          {selectedLang ? (
            <>
              <Text style={styles.flag}>{selectedLang.flag}</Text>
              <Text style={[styles.selectedText, { color: colors.text }]}>
                {selectedLang.name}
              </Text>
            </>
          ) : (
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
              {placeholder}
            </Text>
          )}
        </View>
        <Ionicons
          name="chevron-down"
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View
            style={[
              styles.modalHeader,
              {
                backgroundColor: colors.card,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {placeholder}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <View
              style={[
                styles.searchInput,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search languages..."
                placeholderTextColor={colors.textSecondary}
                style={[styles.searchTextInput, { color: colors.text }]}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <FlatList
            data={filteredLanguages}
            keyExtractor={item => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.languageItem,
                  { borderBottomColor: colors.border },
                  item.code === selectedLanguage && {
                    backgroundColor: `${colors.primary}10`,
                  },
                ]}
                onPress={() => handleSelect(item.code)}
              >
                <Text style={styles.languageItemFlag}>{item.flag}</Text>
                <Text style={[styles.languageItemName, { color: colors.text }]}>
                  {item.name}
                </Text>
                {item.code === selectedLanguage && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="search-outline"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No languages found
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 56,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  flag: {
    fontSize: 28,
  },
  selectedText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '500',
  },
  placeholderText: {
    ...Typography.body,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    ...Typography.h2,
    fontSize: 20,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchTextInput: {
    ...Typography.body,
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.sm,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  languageItemFlag: {
    fontSize: 32,
  },
  languageItemName: {
    ...Typography.body,
    fontSize: 18,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.md,
  },
  emptyText: {
    ...Typography.body,
    fontSize: 16,
  },
});
