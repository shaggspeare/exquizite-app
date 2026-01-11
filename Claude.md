# Exquizite - Language Learning App Context

## Overview
Exquizite is a multi-platform (iOS, Android, Web) language learning application built with React Native (Expo) and TypeScript. The app allows users to create vocabulary sets and practice them through various game modes.

---

## Tech Stack
- **Framework**: React Native + Expo Router v6 (file-based routing)
- **Language**: TypeScript
- **Backend**: Supabase (PostgreSQL with RLS policies)
- **State Management**: React Context API
- **Animations**: react-native-reanimated
- **Internationalization**: i18next + react-i18next
- **Storage**: @react-native-async-storage/async-storage
- **AI Integration**: OpenAI API for vocabulary and sentence generation

---

## Project Structure

```
/app                      # Expo Router screens (file-based routing)
├── _layout.tsx          # Root layout with providers
├── (auth)/              # Auth group
│   ├── login.tsx
│   └── language-setup.tsx
└── (tabs)/              # Main app tabs
    ├── index.tsx        # Home/Dashboard
    ├── my-sets.tsx      # User's sets
    ├── profile.tsx
    ├── create.tsx       # Create/Edit sets
    ├── settings.tsx
    ├── sets/[id]/       # Set details & play modes
    │   ├── index.tsx
    │   └── play/
    │       ├── flashcard.tsx
    │       ├── quiz.tsx
    │       ├── match.tsx
    │       └── fill-blank.tsx
    └── shared-[shareCode].tsx

/contexts                # React Context providers
├── AuthContext.tsx      # User authentication state
├── SetsContext.tsx      # Vocabulary sets management
├── LanguageContext.tsx  # Learning language preferences
├── I18nContext.tsx      # UI language management
├── ThemeContext.tsx     # Dark/Light mode
└── TourProvider.tsx     # First-time user onboarding

/components              # Reusable UI components
├── SetCard.tsx
├── LanguageBadge.tsx
├── Button.tsx
├── AlertDialog.tsx
└── Desktop*.tsx         # Desktop-specific layouts

/lib                     # Utilities, helpers, configuration
├── supabase.ts          # Supabase client setup
├── i18n/                # i18next configuration
│   ├── index.ts
│   └── languages.ts
├── types.ts             # TypeScript type definitions
├── constants.ts         # Colors, spacing, typography
├── alert.ts             # Alert utility
├── responsive.ts        # Responsive design helpers
└── guestStorage.ts      # Offline storage for guest mode

/translations            # i18next translation files
├── en/                  # 45+ language directories
│   ├── common.json      # Shared strings (buttons, status, time)
│   ├── games.json       # Game mode text
│   ├── settings.json    # Settings UI text
│   ├── profile.json     # Profile screen text
│   ├── create.json      # Create/edit screen text
│   └── auth.json        # Login/signup/language setup text
├── es/
├── de/
└── [42 more languages...]

/hooks                   # Custom React hooks
└── useResponsive.tsx    # Device detection hook

/scripts                 # Automation scripts
├── generate-all-translations.js
├── generate-remaining-translations.js
└── generate-7-languages.js
```

---

## Provider Stack Hierarchy

```typescript
ThemeProvider
  └── I18nProvider
      └── AlertProvider
          └── AuthProvider
              └── LanguageProvider
                  └── SetsProvider
                      └── TourProvider
```

**Loading Coordination:**
- Root layout waits for `authLoading` and `langLoading` before routing
- `setsLoading` does NOT block navigation (loads in background)
- Auto-reload mechanism on web for forced refresh (1-second interval)

---

## Key Contexts & State Management

### AuthContext
**Purpose**: User authentication state
**Key State:**
- `user: User | null`
- `isLoading: boolean`

**Key Methods:**
- `signInGuest()`: Anonymous authentication
- `signIn(email, password)`: Email/password login
- `signOut()`: Logout user
- `refreshToken()`: Refresh session token

### SetsContext
**Purpose**: Vocabulary sets management
**Key State:**
- `sets: WordSet[]`
- `isLoading: boolean`

**Key Methods:**
- `createSet(name, words, targetLang, nativeLang): Promise<WordSet>`
- `updateSet(id, name, words, targetLang, nativeLang): Promise<void>`
- `deleteSet(id): Promise<void>`
- `getSetById(id): WordSet | undefined`
- `updateLastPracticed(id): Promise<void>`
- `shareSet(setId, options): Promise<ShareMetadata>`
- `getSharedSet(shareCode): Promise<SharedSetDetails>`
- `copySharedSet(shareCode, customName): Promise<WordSet>`

### LanguageContext
**Purpose**: Learning language preferences (target/native languages)
**Key State:**
- `preferences: { targetLanguage, nativeLanguage, isConfigured }`
- `isLoading: boolean`

**Key Methods:**
- `setLanguages(target, native): Promise<void>`

### I18nContext
**Purpose**: UI language management
**Key State:**
- `currentLanguage: string`
- `isRTL: boolean`
- `isChangingLanguage: boolean`

**Key Methods:**
- `changeLanguage(code): Promise<void>`

### ThemeContext
**Purpose**: Dark/Light mode
**Key State:**
- `isDark: boolean`
- `colors: { primary, background, text, border, ... }`

**Key Methods:**
- `toggleTheme(): void`

---

## Translation System

### Configuration
- **Library**: i18next + react-i18next
- **Namespaces per language**: 6 (common, games, settings, profile, create, auth)
- **UI Languages**: 45 total (44 fully translated)
- **Default UI language**: English (`'en'`)
- **RTL support**: Arabic, Hebrew (requires app reload)

### Usage Pattern
```typescript
const { t } = useTranslation('games');
t('flashcard.title', { setName: 'Spanish Food' })
t('common:buttons.save') // Cross-namespace reference
```

### Supported Languages (45)
**European (23):** English, Spanish, German, French, Italian, Portuguese, Dutch, Swedish, Norwegian, Danish, Finnish, Polish, Czech, Croatian, Slovak, Slovenian, Serbian, Hungarian, Romanian, Ukrainian, Russian, Bulgarian, Greek

**Asian (14):** Japanese, Korean, Chinese (Simplified), Chinese (Traditional), Thai, Hindi, Vietnamese, Indonesian, Malay, Uzbek, Kazakh, Gujarati, Cebuano, Tagalog

**Middle Eastern/Other (8):** Arabic, Hebrew, Turkish, Catalan, Lithuanian, Latvian, Estonian

### Adding New UI Strings
**IMPORTANT**: When adding new UI text, you MUST add translations for ALL 45 supported languages.

**Process:**
1. Add the English string to the appropriate namespace (e.g., `translations/en/common.json`)
2. Use translation scripts to generate translations for all other languages:
   ```bash
   # Generate all translations (use carefully, API cost)
   node scripts/generate-all-translations.js

   # Generate remaining missing translations only
   node scripts/generate-remaining-translations.js

   # Generate for specific 7 languages at a time
   node scripts/generate-7-languages.js
   ```
3. Review generated translations for accuracy
4. Test on RTL languages (Arabic, Hebrew) if applicable

**Translation Namespaces:**
- `common.json`: Buttons, status messages, time strings, sharing, tour
- `games.json`: Game mode text (flashcard, quiz, match, fillBlank, home, dashboard)
- `settings.json`: Settings screen UI
- `profile.json`: Profile screen UI
- `create.json`: Create/edit set screen UI
- `auth.json`: Login, signup, language setup UI

---

## Game Modes

### 1. Flashcard Mode
**File**: [app/(tabs)/sets/[id]/play/flashcard.tsx](app/(tabs)/sets/[id]/play/flashcard.tsx)

**Features:**
- 3D card flip animation (react-native-reanimated)
- Front: Word, Back: Translation
- Progress bar with gradient
- Previous/Next navigation
- Auto-completion tracking via `updateLastPracticed()`

**Styling:**
- Mobile: 450px card height
- Desktop: 700x500px card container
- Responsive text sizing (mobile: 48px, desktop: 64px)

### 2. Quiz Mode
**File**: [app/(tabs)/sets/[id]/play/quiz.tsx](app/(tabs)/sets/[id]/play/quiz.tsx)

**Features:**
- Multiple choice (4 options: A, B, C, D)
- Score tracking
- Skip functionality (no score increment)
- Visual feedback (green checkmark, red X)
- Completion alert with percentage score

**Key Functions:**
- `generateQuizOptions()`: Creates MCQ options
- `handleSelectAnswer()`: Validates answer, updates score
- `handleNext()`: Moves to next question or completes quiz

**Current Skip Behavior:**
- Skip button appears when question hasn't been answered
- Clicking skip moves to next question without scoring
- **Note**: Currently does NOT track skipped words or add them to queue

### 3. Match Mode
**File**: [app/(tabs)/sets/[id]/play/match.tsx](app/(tabs)/sets/[id]/play/match.tsx)

**Features:**
- Pair matching game
- Timer-based scoring
- Grid layout with cards

### 4. Fill in the Blank Mode
**File**: [app/(tabs)/sets/[id]/play/fill-blank.tsx](app/(tabs)/sets/[id]/play/fill-blank.tsx)

**Features:**
- Sentence completion
- AI-generated hints
- Input validation

---

## Set Creation Flow

**File**: [app/(tabs)/create.tsx](app/(tabs)/create.tsx)

**Components Used:**
- `WordPairInput`: Individual word/translation input rows
- `AISuggestionModal`: AI-powered vocabulary generation
- `BulkImportModal`: CSV/text import functionality
- `LanguageOverrideSelector`: Custom language selection per set
- `LanguageBadge`: Display selected languages

**Key State:**
- `setName`: Set title (auto-generated as "Set N" if empty)
- `wordPairs`: Array<{id, word, translation}>
- `overrideTargetLanguage`: Custom language code (optional)
- `overrideNativeLanguage`: Custom language code (optional)
- `showAIModal`: AI suggestion modal visibility
- `showBulkImportModal`: Bulk import modal visibility
- `saving`: Loading state during save

**Constraints:**
- `MAX_WORDS_PER_SET`: 20 words per set

**Key Functions:**
- `handleSave()`: Validates, creates/updates set, navigates back
- `addWordPair()`: Adds new word pair (respects max limit)
- `handleAIWordsSelected()`: Merges AI suggestions with existing words
- `handleBulkImport()`: Imports from formatted text
- `clearForm()`: Resets entire form state

**Current Unsaved Changes Handling:**
- Uses `useFocusEffect` to detect navigation
- State persists across navigation until explicitly cleared
- **Note**: No explicit unsaved changes modal currently implemented

---

## Responsive Design

### useResponsive Hook
**File**: [hooks/useResponsive.tsx](hooks/useResponsive.tsx)

**Returns:**
```typescript
{
  isDesktop: boolean,    // width > 1024px
  isTablet: boolean,     // 768px < width <= 1024px
  isMobile: boolean,     // width <= 768px
  screenType: 'desktop' | 'tablet' | 'mobile'
}
```

**Common Pattern:**
```typescript
const { isDesktop } = useResponsive();
if (isDesktop) return <DesktopLayout>{...}</DesktopLayout>
return <SafeAreaView>{...}</SafeAreaView>
```

### Desktop Components
- `DesktopLayout`: Full-height wrapper
- `DesktopContainer`: Max-width constraint container
- `DesktopSidebar`: Navigation sidebar
- `DesktopHomeView`: Dashboard layout
- `DesktopCreateView`: Create form layout

---

## Constants & Theme System

**File**: [lib/constants.ts](lib/constants.ts)

### Colors
```typescript
colors: {
  primary: '#5B9EFF',
  background: '#F5F5F5',
  text: '#333333',
  border: '#E0E0E0',
  success: '#4CAF50',
  error: '#F44336',
  // ... more colors
}
```

### Spacing
```typescript
spacing: {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
}
```

### Typography
```typescript
typography: {
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  body: { fontSize: 16, fontWeight: 'normal' },
  // ... more styles
}
```

---

## Data Persistence

### Local Storage
- **Library**: @react-native-async-storage/async-storage
- **Keys**: `app_ui_language`, `app_theme`, `tour_completed`, etc.

### Guest Mode
- **File**: [lib/guestStorage.ts](lib/guestStorage.ts)
- **Purpose**: Offline data storage for users not logged in
- **Storage**: Local async storage

### Cloud Storage
- **Backend**: Supabase PostgreSQL
- **Security**: Row Level Security (RLS) policies
- **Tables**: users, word_sets, word_pairs, shared_sets, etc.

---

## Navigation Pattern

### Expo Router v6
- **File-based routing**: Routes defined by file structure
- **Group-based organization**: `(auth)`, `(tabs)`
- **Route params**: `useLocalSearchParams<T>()`
- **Tab bar**: Auto-generated from Tabs.Screen declarations

### Hidden Routes
Routes not shown in tab bar:
- `create`: Create/edit set screen
- `settings`: Settings screen
- `sets/[id]`: Set details
- `shared-[shareCode]`: Shared sets

---

## Error Handling

### Alert System
**File**: [lib/alert.ts](lib/alert.ts)

**Usage:**
```typescript
showAlert('Error', 'Something went wrong', [
  { text: 'OK', onPress: () => {} }
]);
```

**Pattern:**
- Wraps native alerts with translation support
- Validation on field changes and form submission
- Retry logic via `retryOperation()` for Supabase calls

---

## AI Integration

### OpenAI Features
1. **Vocabulary Generation**: Generate word lists based on themes
2. **Sentence Generation**: Create example sentences for fill-in-the-blank
3. **Translation Automation**: Generate UI translations for all 45 languages

**API Key Management:**
- Stored in environment variables
- Backend processing via Supabase Edge Functions

---

## Social Features

### Set Sharing
**Methods:**
- `shareSet(setId, options)`: Generate share code
- `getSharedSet(shareCode)`: Fetch shared set details
- `copySharedSet(shareCode, customName)`: Copy shared set to user's library

**Tracking:**
- View counts
- Copy counts
- Share code expiration (optional)

---

## Common Patterns

### Loading States
```typescript
if (isLoading) {
  return <ActivityIndicator size="large" color={colors.primary} />
}
```

### Error Boundaries
- Wrap critical components with try-catch
- Display user-friendly error messages
- Log errors for debugging

### Form Validation
- Validate on field change
- Show validation errors inline
- Disable submit button when invalid

---

## Development Scripts

### Translation Scripts
```bash
# Generate all translations (use carefully, API cost)
node scripts/generate-all-translations.js

# Generate remaining missing translations only
node scripts/generate-remaining-translations.js

# Generate for specific 7 languages at a time
node scripts/generate-7-languages.js
```

### Running the App
```bash
# Start Expo development server
npm start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run on web
npx expo start --web
```

### Type Checking
```bash
# Run TypeScript compiler
npx tsc --noEmit
```

### Linting
```bash
# Run ESLint
npm run lint
```

---

## Key Type Definitions

**File**: [lib/types.ts](lib/types.ts)

### WordSet
```typescript
interface WordSet {
  id: string;
  name: string;
  user_id: string;
  target_language: string;
  native_language: string;
  created_at: string;
  updated_at: string;
  last_practiced_at?: string;
  word_pairs: WordPair[];
}
```

### WordPair
```typescript
interface WordPair {
  id: string;
  word: string;
  translation: string;
  set_id?: string;
}
```

### User
```typescript
interface User {
  id: string;
  email?: string;
  is_guest: boolean;
  created_at: string;
}
```

---

## Testing Strategy

### Unit Tests
- Context providers
- Utility functions
- Custom hooks

### Integration Tests
- Screen navigation flows
- Form submissions
- Game mode logic

### E2E Tests
- Complete user journeys
- Multi-platform testing (iOS, Android, Web)

---

## Performance Considerations

1. **Memoization**: Use `useMemo` and `useCallback` for expensive computations
2. **Virtualization**: Use FlatList for long lists
3. **Image Optimization**: Lazy load images, use appropriate sizes
4. **Bundle Size**: Code splitting, tree shaking
5. **Animation Performance**: Use react-native-reanimated for 60fps animations

---

## Security Best Practices

1. **Supabase RLS**: Enforce row-level security policies
2. **API Key Protection**: Never expose API keys in client code
3. **Input Validation**: Sanitize all user inputs
4. **XSS Prevention**: Escape user-generated content
5. **Authentication**: Secure token storage, refresh logic

---

## Deployment

### iOS
- Build with Expo Application Services (EAS)
- Submit to App Store Connect
- TestFlight for beta testing

### Android
- Build with EAS
- Submit to Google Play Console
- Internal testing track for QA

### Web
- Build for production: `npm run build:web`
- Deploy to hosting service (Vercel, Netlify, etc.)
- Configure environment variables

---

## Future Enhancements

1. **Spaced Repetition**: Implement SRS algorithm for optimal learning
2. **Audio Pronunciation**: Add TTS for word pronunciation
3. **Achievements**: Gamification with badges and streaks
4. **Social Learning**: Friend lists, challenges, leaderboards
5. **Advanced Analytics**: Track learning progress, identify weak areas
6. **Offline Mode**: Full offline support with sync when online

---

## Contact & Support

For bugs, feature requests, or questions, please open an issue on the GitHub repository.

---

**Last Updated**: 2026-01-11
