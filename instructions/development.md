# Exquizite - Frontend Development Guide

## Tech Stack
- **Framework:** React Native with Expo SDK 50+
- **Navigation:** Expo Router (File-based routing)
- **Authentication:** Expo Auth Session (Google OAuth)
- **Styling:** React Native StyleSheet
- **Animations:** React Native Reanimated 3
- **Gestures:** React Native Gesture Handler
- **State Management:** React Context API + useReducer (local state only)
- **Icons:** @expo/vector-icons
- **Storage:** Expo SecureStore (for auth tokens)
- **Audio:** Expo AV (for pronunciation sounds)

## Project Structure
```
app/
├── (auth)/
│   ├── _layout.tsx        # Auth stack layout
│   ├── login.tsx          # Login screen
│   └── guest-setup.tsx    # Guest account setup
├── (tabs)/
│   ├── _layout.tsx        # Tab navigator
│   ├── index.tsx          # Home/Dashboard
│   ├── profile.tsx        # Profile & Settings
│   └── create.tsx         # Quick create shortcut
├── sets/
│   ├── [id]/
│   │   ├── index.tsx      # Set detail view
│   │   ├── edit.tsx       # Edit existing set
│   │   └── play/
│   │       ├── _layout.tsx    # Game stack layout
│   │       ├── template.tsx   # Template selection
│   │       ├── flashcard.tsx  # Flashcard game
│   │       ├── match.tsx      # Match game
│   │       └── quiz.tsx       # Quiz game
│   └── new.tsx            # Create new set
├── _layout.tsx            # Root layout
└── +not-found.tsx         # 404 screen

components/
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── Modal.tsx
├── game/
│   ├── FlashCard.tsx
│   ├── MatchCard.tsx
│   ├── QuizOption.tsx
│   └── ProgressBar.tsx
├── set/
│   ├── SetCard.tsx
│   ├── WordPairInput.tsx
│   └── SetList.tsx
└── ai/
    ├── AIBadge.tsx
    ├── HintPanel.tsx
    └── SuggestionModal.tsx

lib/
├── auth.ts               # Auth utilities
├── constants.ts          # App constants
├── types.ts             # TypeScript definitions
├── animations.ts        # Reanimated animations
├── mockData.ts          # Temporary mock data
└── ai-helpers.ts        # AI feature helpers

contexts/
├── AuthContext.tsx      # Authentication state
├── GameContext.tsx      # Current game state
└── SetsContext.tsx      # Word sets management
```

## Routes & Navigation

### Authentication Flow
```typescript
// app/_layout.tsx
export default function RootLayout() {
  // Check auth state
  // Redirect to /(auth)/login if not authenticated
  // Otherwise render main app
}
```

**Routes:**
- `/(auth)/login` - Google Sign-in & Guest option
- `/(auth)/guest-setup` - Optional guest name setup
- Main app routes (protected)

### Main App Routes
```typescript
// Tab Routes
/(tabs)/
  - index (Home Dashboard)
  - create (Quick Create)
  - profile (Profile & Settings)

// Set Management Routes  
/sets/new - Create new set
/sets/[id] - View set details
/sets/[id]/edit - Edit existing set
/sets/[id]/play/template - Choose game template
/sets/[id]/play/flashcard - Flashcard game
/sets/[id]/play/match - Match game
/sets/[id]/play/quiz - Quiz game
```

## Screen Implementations

### 1. Authentication Screen
```typescript
// app/(auth)/login.tsx
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
  });

  // Handle Google auth response
  // Store tokens in SecureStore
  // Navigate to main app
}
```

### 2. Home Dashboard
```typescript
// app/(tabs)/index.tsx
export default function HomeScreen() {
  // Local state for sets (will be replaced with Supabase later)
  const [sets, setSets] = useState([]);
  
  // Components:
  // - Header with welcome message
  // - FlatList with SetCard components
  // - FAB for creating new set
  // - Empty state component
}
```

### 3. Create/Edit Set Screen
```typescript
// app/sets/new.tsx
export default function CreateSetScreen() {
  const [setName, setSetName] = useState('');
  const [wordPairs, setWordPairs] = useState([
    { id: '1', word: '', translation: '' }
  ]);

  // Features:
  // - Dynamic word pair inputs
  // - Add/remove word pairs
  // - Swipe to delete (Swipeable from react-native-gesture-handler)
  // - Drag to reorder (using Reanimated)
  // - AI suggestions modal
  // - Validation (max 20 words)
  
  // Save to local state for now
  const saveSet = () => {
    // Validate
    // Save locally
    // Navigate to set detail
  };
}
```

### 4. Game Screens

#### Flashcard Implementation
```typescript
// app/sets/[id]/play/flashcard.tsx
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

export default function FlashcardScreen() {
  const rotation = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const flipCard = () => {
    rotation.value = withSpring(rotation.value === 0 ? 180 : 0);
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      rotation.value,
      [0, 180],
      [0, 180]
    );
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  // Card flip animation
  // Progress tracking
  // Navigation between cards
  // AI hint panel (slides from bottom)
}
```

#### Match Game Implementation
```typescript
// app/sets/[id]/play/match.tsx
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';

export default function MatchScreen() {
  const [matches, setMatches] = useState([]);
  const [score, setScore] = useState(0);

  // Draggable word cards
  // Drop zones for translations
  // Match validation
  // Visual feedback animations
  // Score tracking
}
```

#### Quiz Implementation
```typescript
// app/sets/[id]/play/quiz.tsx
export default function QuizScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);

  // Generate random options (3 wrong + 1 correct)
  // Answer validation
  // Progress tracking
  // AI-generated distractors
}
```

## Core Components

### Button Component
```typescript
// components/ui/Button.tsx
import { Pressable, Text, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({ title, onPress, variant = 'primary', ...props }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(0.95); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={onPress}
      style={[styles.button, styles[variant], animatedStyle]}
      {...props}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
    </AnimatedPressable>
  );
}
```

### Card Component
```typescript
// components/ui/Card.tsx
export function Card({ children, style, ...props }) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
});
```

### FlashCard Component
```typescript
// components/game/FlashCard.tsx
export function FlashCard({ word, translation, isFlipped, onFlip }) {
  // Animated card with flip functionality
  // Front: word
  // Back: translation
  // Gesture handler for tap
}
```

## State Management

### Auth Context
```typescript
// contexts/AuthContext.tsx
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check stored auth token
  // Google sign-in methods
  // Guest mode handling
  // Sign out

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Sets Context (Local Storage)
```typescript
// contexts/SetsContext.tsx
const SetsContext = createContext();

export function SetsProvider({ children }) {
  const [sets, setSets] = useState([]);

  // CRUD operations for sets
  // Will be replaced with Supabase later
  
  const createSet = (newSet) => {
    const set = {
      id: Date.now().toString(),
      ...newSet,
      createdAt: new Date().toISOString(),
    };
    setSets([...sets, set]);
    return set;
  };

  return (
    <SetsContext.Provider value={{ sets, createSet, updateSet, deleteSet }}>
      {children}
    </SetsContext.Provider>
  );
}
```

## Animations Library

### Common Animations
```typescript
// lib/animations.ts
import { withSpring, withTiming, Easing } from 'react-native-reanimated';

export const animations = {
  // Card flip
  flip: (value) => withSpring(value, {
    damping: 15,
    stiffness: 100,
  }),

  // Fade in
  fadeIn: (value) => withTiming(value, {
    duration: 300,
    easing: Easing.out(Easing.ease),
  }),

  // Slide up
  slideUp: (value) => withSpring(value, {
    damping: 20,
    stiffness: 90,
  }),

  // Scale bounce
  bounce: (value) => withSpring(value, {
    damping: 10,
    stiffness: 200,
  }),
};
```

## AI Features (Mock Implementation)

### AI Suggestions
```typescript
// lib/ai-helpers.ts
export function generateWordSuggestions(theme: string): WordPair[] {
  // Mock AI suggestions for now
  // Will integrate with real AI service later
  const suggestions = {
    'animals': [
      { word: 'cat', translation: 'кіт' },
      { word: 'dog', translation: 'собака' },
    ],
    // ... more themes
  };
  
  return suggestions[theme] || [];
}

export function generateHint(word: string): string {
  // Mock hint generation
  return `Think about the first letter: ${word[0].toUpperCase()}...`;
}

export function generateQuizOptions(correct: string, all: string[]): string[] {
  // Generate 3 plausible wrong answers
  // Shuffle with correct answer
  return shuffle([correct, ...wrongOptions]);
}
```

## Styling System

### Theme Constants
```typescript
// lib/constants.ts
export const Colors = {
  background: '#FAFAFA',
  card: '#FFFFFF',
  primary: '#5B67E5',
  primaryDark: '#4B57D5',
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  success: '#10B981',
  error: '#EF4444',
  ai: '#8B5CF6',
  border: '#E5E5E5',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '600',
  },
  h2: {
    fontSize: 24,
    fontWeight: '500',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
  },
};
```

### Common Styles
```typescript
// lib/commonStyles.ts
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
    fontSize: 16,
  },
});
```

## Performance Optimizations

### List Optimization
```typescript
// Use FlatList with proper props
<FlatList
  data={sets}
  keyExtractor={(item) => item.id}
  renderItem={renderSetCard}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
  initialNumToRender={10}
  getItemLayout={(data, index) => ({
    length: CARD_HEIGHT,
    offset: CARD_HEIGHT * index,
    index,
  })}
/>
```

### Memo Components
```typescript
// Memoize expensive components
export const SetCard = memo(({ set, onPress }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.set.id === nextProps.set.id;
});
```

## Dependencies

```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "expo-auth-session": "~5.4.0",
    "expo-crypto": "~12.8.0",
    "expo-router": "~3.4.0",
    "expo-secure-store": "~12.8.0",
    "expo-web-browser": "~12.8.0",
    "expo-av": "~13.10.0",
    "react-native-reanimated": "~3.6.0",
    "react-native-gesture-handler": "~2.14.0",
    "react-native-safe-area-context": "4.8.0",
    "react-native-screens": "~3.29.0",
    "@expo/vector-icons": "^14.0.0"
  }
}
```

## Next Steps

1. **Setup Expo project:**
   ```bash
   npx create-expo-app exquizite --template blank-typescript
   cd exquizite
   npx expo install expo-router react-native-safe-area-context react-native-screens
   ```

2. **Configure Expo Router:**
    - Update app.json for expo-router
    - Create file-based routing structure

3. **Implement core screens:**
    - Start with auth flow
    - Build dashboard and create screens
    - Add game screens one by one

4. **Add animations:**
    - Integrate Reanimated 3
    - Implement card flip, slide, and scale animations

5. **Polish UI:**
    - Refine styles to match design spec
    - Add loading states and error handling
    - Implement haptic feedback

## Notes

- All data is stored locally in memory/state for now
- AI features use mock data temporarily
- Focus on smooth animations and gestures
- Prepare components for easy Supabase integration later
- Test on physical iOS devices for best performance