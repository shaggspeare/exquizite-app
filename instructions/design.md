# Exquizite - UI/UX Specification

## Product Overview
**App Name:** Exquizite  
**Platform:** iOS (iPhones)  
**Description:** Educational vocabulary learning app with AI-assisted features for creating and playing word-based learning games

## Design Philosophy
- Minimalist interface inspired by Notion's design language
- Typography-focused with clear visual hierarchy
- Generous white space and breathing room
- Soft, subtle interactions without overwhelming animations
- Educational yet modern, professional but approachable

## Visual Style Guide

### Color Palette
- **Background:** #FAFAFA
- **Card Background:** #FFFFFF
- **Primary Text:** #1A1A1A
- **Secondary Text:** #6B6B6B
- **Accent:** #5B67E5 (soft blue)
- **Success:** #10B981
- **Error:** #EF4444
- **AI Indicator:** #8B5CF6 (purple)

### Typography
- **Font Family:** SF Pro Display (iOS System Font)
- **Heading 1:** 32pt, Semi-bold
- **Heading 2:** 24pt, Medium
- **Body:** 16pt, Regular
- **Caption:** 14pt, Regular
- **Small:** 12pt, Regular

### Components
- **Corner Radius:** 12px for cards, 8px for buttons
- **Shadows:** Subtle (0 2px 8px rgba(0,0,0,0.08))
- **Spacing Grid:** 8pt base unit
- **Minimum Touch Target:** 44x44pt

## Feature Set & Screens

### 1. Authentication Screen
**Features:**
- Sign in with Google
- Continue as Guest option

**Layout:**
- Centered app logo "Exquizite" with subtle gradient
- Google Sign-in button (white with Google colors)
- "Continue as Guest" text button below
- Clean background with subtle geometric pattern

### 2. Home Dashboard
**Features:**
- Display user's word sets
- Quick access to create new set
- Profile section

**Layout:**
- Top section: Welcome message + profile avatar
- "My Sets" grid (2 columns on iPhone, 3-4 on iPad)
- Each set card shows:
    - Set name
    - Word count badge
    - Last practiced date
    - Subtle progress indicator
- Floating "+" button (bottom right) for new set
- Empty state: Illustration with "Create your first set" prompt

### 3. Create/Edit Set Screen
**Features:**
- Add word-translation pairs
- Copy from existing sets
- AI assistance for word suggestions
- Maximum 20 words per set

**Layout:**
- Navigation bar with Cancel/Save
- Set name input field (large, prominent)
- Word pairs section:
    - Clean input rows with "Word" | "Translation" placeholders
    - "+" button to add new pair
    - Swipe to delete gesture
    - Reorder handle on right
- Action buttons row:
    - "Copy from existing" (document icon)
    - "Ask AI" (sparkle icon)
- Word count indicator: "X/20 words"
- AI suggestion panel (slides up when activated):
    - Suggested words based on theme
    - Tap to add functionality

### 4. Template Selection Screen
**Features:**
- Three game templates
- Visual preview of each
- AI-enhanced indicators

**Layout:**
- Navigation title: "Choose Activity"
- Vertical stack of template cards:

  **Flashcard Card:**
    - Icon: Stacked cards illustration
    - Title: "Flashcard"
    - Subtitle: "Flip to reveal translations"
    - AI badge: "AI hints available"

  **Match Card:**
    - Icon: Connecting lines illustration
    - Title: "Match"
    - Subtitle: "Drag and connect pairs"

  **Quiz Card:**
    - Icon: Question marks illustration
    - Title: "Quiz"
    - Subtitle: "Multiple choice questions"
    - AI badge: "AI-generated options"

- Selected card gets accent border and subtle scale

### 5. Game Screens

#### 5.1 Flashcard Screen
**Features:**
- Tap to flip cards
- Sound pronunciation (optional)
- AI-generated hints
- Progress tracking

**Layout:**
- Progress bar at top (thin, accent color)
- Main card (70% of screen height):
    - Front: Word in large text
    - Back: Translation + hint section
    - Flip animation on tap
- Bottom controls:
    - Sound button (if available)
    - "Show hint" button (AI sparkle icon)
    - Previous/Next arrows
- Card counter: "3 of 12"
- Hint panel (expands from bottom):
    - AI-generated memory tips
    - Usage examples
    - Visual associations

#### 5.2 Match Game Screen
**Features:**
- Drag and drop mechanics
- Visual feedback for matches
- Timer/Score display

**Layout:**
- Header: Timer + Score
- Game area (two columns):
    - Left: Word cards (draggable)
    - Right: Translation zones (drop targets)
- Cards:
    - Subtle shadow when lifted
    - Green glow for correct match
    - Red shake for incorrect
- Completion modal:
    - Time taken
    - Accuracy percentage
    - "Play Again" / "Back to Sets" buttons

#### 5.3 Quiz Screen
**Features:**
- Multiple choice (4 options)
- Optional AI-generated hints/descriptions
- Progress tracking

**Layout:**
- Progress indicator (dots or bar)
- Question card:
    - Word to translate (large text)
    - Optional context/hint (collapsible)
- Answer options (4 cards in 2x2 grid):
    - Tap to select
    - Green highlight for correct
    - Red for incorrect with correct answer shown
- Bottom section:
    - "Skip" button (left)
    - "Check" button (right, becomes "Next" after answer)

### 6. Profile & Settings Screen
**Features:**
- View all sets
- Edit/Delete sets
- Account management

**Layout:**
- Profile header:
    - Avatar + Name
    - Stats: Total sets, Words learned
- Sets list:
    - Section header: "Your Sets"
    - List items with set name, word count
    - Swipe actions: Edit (blue), Delete (red)
- Settings section:
    - Account type (Google/Guest)
    - Sign out button

## iOS-Specific Design Elements

### Navigation
- Standard iOS navigation bar styling
- Back button: "< Back" or just "<"
- Right-aligned action buttons
- Large titles where appropriate

### Gestures
- Swipe from left edge to go back
- Pull to refresh on lists
- Long press for context menus
- Pinch to zoom on iPad for card views

### Animations
- Standard iOS transitions (push/pop)
- Spring animations for interactive elements
- Subtle haptic feedback for actions
- Card flip: 0.6s ease-in-out
- Match connection: Draw line animation

### Empty States
- Friendly illustrations
- Clear call-to-action
- Helpful description text

### Loading States
- Skeleton screens for content loading
- Subtle activity indicators
- AI processing: Pulsing sparkle animation

## AI-Enhanced Features Visual Indicators

### AI Badges
- Purple gradient background
- Sparkle/magic wand icon
- "AI" text label when space permits

### AI Processing States
1. **Idle:** Subtle sparkle icon
2. **Processing:** Pulsing animation
3. **Complete:** Brief success animation

### AI-Generated Content Markers
- Small sparkle icon next to AI content
- Subtle purple tint for AI-generated sections
- "Generated by AI" caption where appropriate

## iPad Adaptations
- Multi-column layouts where appropriate
- Slide-over support for set creation
- Split view: Sets list + Game view
- Larger cards with more spacing
- Keyboard shortcuts support

## Accessibility Considerations
- Dynamic Type support
- VoiceOver optimized labels
- Sufficient color contrast (WCAG AA)
- Reduced motion options
- Clear focus indicators

## Error States
- Inline validation messages
- Toast notifications for actions
- Modal alerts for critical errors
- Network offline state handling