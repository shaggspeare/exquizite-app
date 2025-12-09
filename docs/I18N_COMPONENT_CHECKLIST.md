# i18n Component Update Checklist

Use this checklist to systematically update all components with translations.

## Components to Update

### ✅ Completed

- [x] [app/(tabs)/settings.tsx](<app/(tabs)/settings.tsx>) - Settings screen headers

### 🔲 Priority 1: Authentication & Core

- [ ] **[app/(auth)/login.tsx](<app/(auth)/login.tsx>)**
  - Namespace: `auth`
  - Strings: Login form, signup form, error messages, guest mode
  - Keys: `auth:login.*`, `auth:signup.*`, `auth:errors.*`

- [ ] **[app/(auth)/language-setup.tsx](<app/(auth)/language-setup.tsx>)**
  - Namespace: `auth`
  - Strings: Language setup screen
  - Keys: `auth:languageSetup.*`

### 🔲 Priority 2: Main Screens

- [ ] **[app/(tabs)/index.tsx](<app/(tabs)/index.tsx>)** (Home)
  - Namespace: `games`
  - Strings: Greeting, stats, quick practice, featured sets
  - Keys: `games:home.*`, `common:counts.*`

- [ ] **[app/(tabs)/profile.tsx](<app/(tabs)/profile.tsx>)**
  - Namespace: `profile`
  - Strings: Profile info, stats, settings link, your sets
  - Keys: `profile:*`, `common:counts.*`

- [ ] **[app/(tabs)/create.tsx](<app/(tabs)/create.tsx>)**
  - Namespace: `create`
  - Strings: Form labels, placeholders, buttons, errors
  - Keys: `create:*`, `common:buttons.*`

- [ ] **[app/(tabs)/settings.tsx](<app/(tabs)/settings.tsx>)** (Finish remaining strings)
  - Namespace: `settings`
  - Strings: All hardcoded text
  - Keys: `settings:*`, `auth:guest.*`, `common:counts.*`

### 🔲 Priority 3: Game Screens

- [ ] **[app/sets/[id]/index.tsx](app/sets/[id]/index.tsx)** (Set Detail)
  - Namespace: `games`
  - Strings: Set info, start practice button
  - Keys: `games:setNotFound`, `games:wordsInSet`, `games:startPractice`

- [ ] **[app/sets/[id]/play/template.tsx](app/sets/[id]/play/template.tsx)**
  - Namespace: `games`
  - Strings: Game mode names and descriptions
  - Keys: `games:chooseActivity`, `games:templates.*`

- [ ] **[app/sets/[id]/play/flashcard.tsx](app/sets/[id]/play/flashcard.tsx)**
  - Namespace: `games`
  - Strings: Navigation, flip instructions, completion
  - Keys: `games:flashcard.*`, `common:buttons.*`

- [ ] **[app/sets/[id]/play/quiz.tsx](app/sets/[id]/play/quiz.tsx)**
  - Namespace: `games`
  - Strings: Questions, progress, results
  - Keys: `games:quiz.*`, `common:buttons.*`

- [ ] **[app/sets/[id]/play/match.tsx](app/sets/[id]/play/match.tsx)**
  - Namespace: `games`
  - Strings: Headers, completion message
  - Keys: `games:match.*`, `common:buttons.*`, `common:status.*`

### 🔲 Priority 4: Components

- [ ] **[components/set/SetCard.tsx](components/set/SetCard.tsx)**
  - Namespace: `games`, `common`
  - Strings: Featured badge, progress, last practiced, actions
  - Keys: `games:setCard.*`, `common:time.*`, `common:buttons.*`

- [ ] **[components/ai/AISuggestionModal.tsx](components/ai/AISuggestionModal.tsx)**
  - Namespace: `create`
  - Strings: Modal title, prompts, buttons, status messages
  - Keys: `create:ai.*`, `common:buttons.*`

- [ ] **[components/set/ShareModal.tsx](components/set/ShareModal.tsx)**
  - Namespace: `common`, `profile`
  - Strings: Share instructions, buttons
  - Keys: To be added to translations

- [ ] **[components/tour/TourModal.tsx](components/tour/TourModal.tsx)**
  - Namespace: `common`
  - Strings: Tour slides, navigation
  - Keys: To be added to translations

- [ ] **[components/ui/Button.tsx](components/ui/Button.tsx)**
  - No strings (uses props)

- [ ] **[components/ui/Card.tsx](components/ui/Card.tsx)**
  - No strings (structural component)

### 🔲 Desktop Components

- [ ] **[components/profile/DesktopProfileView.tsx](components/profile/DesktopProfileView.tsx)**
  - Same as mobile profile

- [ ] **[components/create/DesktopCreateView.tsx](components/create/DesktopCreateView.tsx)**
  - Same as mobile create

- [ ] **[components/sets/DesktopSetDetailView.tsx](components/sets/DesktopSetDetailView.tsx)**
  - Same as mobile set detail

## Update Pattern

For each component:

### 1. Add Import

```typescript
import { useTranslation } from 'react-i18next';
```

### 2. Add Hook in Component

```typescript
export default function MyComponent() {
  const { t } = useTranslation('namespace'); // Choose appropriate namespace
  // ... rest of component
}
```

### 3. Replace Strings

**Before:**

```typescript
<Text>Settings</Text>
<Button title="Save" />
```

**After:**

```typescript
<Text>{t('title')}</Text>
<Button title={t('common:buttons.save')} />
```

### 4. Handle Variables

**Before:**

```typescript
<Text>Hello, {user.name}!</Text>
<Text>{count} words</Text>
```

**After:**

```typescript
<Text>{t('greeting', { name: user.name })}</Text>
<Text>{t('common:counts.wordCount', { count })}</Text>
```

### 5. Handle Conditionals

**Before:**

```typescript
<Text>{sets.length === 1 ? 'set' : 'sets'}</Text>
```

**After:**

```typescript
<Text>{t('common:counts.setCount', { count: sets.length })}</Text>
```

## Testing Checklist

After updating each component:

- [ ] Component renders without errors
- [ ] All text is visible (no blank spots)
- [ ] Variables interpolate correctly
- [ ] Pluralization works (test count: 0, 1, 2, 5)
- [ ] Language switching works
- [ ] Layout doesn't break with longer text
- [ ] RTL languages display correctly (if applicable)

## Common Mistakes to Avoid

❌ **Don't concatenate translated strings**

```typescript
// BAD
<Text>{t('you_have')} {count} {t('words')}</Text>

// GOOD
<Text>{t('wordCount', { count })}</Text>
```

❌ **Don't hardcode button text**

```typescript
// BAD
<Button title="Save" />

// GOOD
<Button title={t('common:buttons.save')} />
```

❌ **Don't forget namespace prefix for cross-namespace access**

```typescript
// BAD (if not in 'common' namespace)
{
  t('buttons.save');
}

// GOOD
{
  t('common:buttons.save');
}
```

## Translation Key Conventions

- Use lowercase with camelCase: `myKey`, `myLongKey`
- Use dots for nesting: `section.subsection.key`
- Be descriptive: `emailPlaceholder` not `placeholder1`
- Group related keys: `auth.login.*`, `auth.signup.*`

## Progress Tracking

Total Components: ~35

- ✅ Completed: 1
- 🔄 In Progress: 0
- 🔲 Not Started: 34

**Completion: ~3%**

## Notes

- Start with high-traffic screens (auth, home, create)
- Test each screen after updating
- Update both mobile and desktop versions
- Check that error messages are translated
- Verify alerts and modals

---

**Tip**: Update 2-3 components per session to maintain quality and catch issues early.
