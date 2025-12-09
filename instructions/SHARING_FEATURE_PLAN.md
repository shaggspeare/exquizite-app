# Set Sharing Feature - Implementation Plan

## Overview

The sharing feature will allow users to share their word sets with others via shareable links. Recipients can:

- View and practice the shared set
- Save a copy to their own collection
- Access the set without authentication (public sharing)

## Core Requirements

### User Stories

1. **As a set creator**, I want to generate a shareable link for my set
2. **As a set creator**, I want to control who can access my shared sets (public/private)
3. **As a recipient**, I want to access a shared set via link and practice it
4. **As a recipient**, I want to save a copy of a shared set to my own collection
5. **As a recipient**, I want to practice a shared set without creating an account (guest mode)

## Technical Architecture

### Database Schema Changes

#### New Table: `shared_sets`

```sql
CREATE TABLE shared_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  set_id UUID NOT NULL REFERENCES word_sets(id) ON DELETE CASCADE,
  share_code VARCHAR(12) UNIQUE NOT NULL,  -- Short, unique code for sharing
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 0,
  copy_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,  -- Optional expiration
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_shared_sets_share_code ON shared_sets(share_code);
CREATE INDEX idx_shared_sets_set_id ON shared_sets(set_id);
```

#### New Table: `set_copies`

Track when users save copies of shared sets

```sql
CREATE TABLE set_copies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_set_id UUID NOT NULL REFERENCES word_sets(id) ON DELETE SET NULL,
  copied_set_id UUID NOT NULL REFERENCES word_sets(id) ON DELETE CASCADE,
  copied_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  shared_via_code VARCHAR(12),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_set_copies_copied_by ON set_copies(copied_by);
```

#### Update `word_sets` table

Add fields to track sharing status:

```sql
ALTER TABLE word_sets
  ADD COLUMN is_shareable BOOLEAN DEFAULT true,
  ADD COLUMN original_author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN is_copy BOOLEAN DEFAULT false;
```

### Row-Level Security (RLS) Policies

```sql
-- Users can always read their own sets
CREATE POLICY "Users can read own sets"
  ON word_sets FOR SELECT
  USING (user_id = auth.uid());

-- Users can read sets that are shared via share code
CREATE POLICY "Users can read shared sets"
  ON word_sets FOR SELECT
  USING (
    id IN (
      SELECT set_id FROM shared_sets
      WHERE is_active = true
      AND is_public = true
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

-- Allow public read access to shared_sets table for active shares
CREATE POLICY "Anyone can read active shares"
  ON shared_sets FOR SELECT
  USING (is_active = true AND is_public = true);

-- Users can only create shares for their own sets
CREATE POLICY "Users can share own sets"
  ON shared_sets FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    set_id IN (SELECT id FROM word_sets WHERE user_id = auth.uid())
  );

-- Users can update/delete their own shares
CREATE POLICY "Users can manage own shares"
  ON shared_sets FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete own shares"
  ON shared_sets FOR DELETE
  USING (created_by = auth.uid());
```

## Backend Implementation

### Supabase Edge Functions

#### 1. `generate-share-link`

```typescript
// supabase/functions/generate-share-link/index.ts
// Generates a unique share code and creates sharing link
```

**Input:**

- `setId`: UUID of the set to share
- `isPublic`: boolean (default: true)
- `expiresInDays`: number (optional)

**Output:**

- `shareCode`: 12-character unique code
- `shareUrl`: Full URL with share code
- `shareId`: UUID of the share record

**Logic:**

1. Validate user owns the set
2. Generate unique 12-character code (alphanumeric)
3. Check code doesn't already exist
4. Insert into `shared_sets` table
5. Return share URL and metadata

#### 2. `get-shared-set`

```typescript
// supabase/functions/get-shared-set/index.ts
// Retrieves a shared set by share code
```

**Input:**

- `shareCode`: 12-character code

**Output:**

- Set metadata (name, languages, word count)
- Word pairs
- Author information (anonymized)
- Share statistics (view count, copy count)

**Logic:**

1. Validate share code exists and is active
2. Check expiration date
3. Increment view count
4. Fetch set with all word pairs
5. Return sanitized data (hide user_id)

#### 3. `copy-shared-set`

```typescript
// supabase/functions/copy-shared-set/index.ts
// Creates a copy of a shared set for the current user
```

**Input:**

- `shareCode`: 12-character code
- `userId`: UUID of the user copying (optional for guests)

**Output:**

- New set ID
- Success status

**Logic:**

1. Fetch original set via share code
2. Create new set for current user
3. Copy all word pairs
4. Record in `set_copies` table
5. Increment copy count on share
6. Return new set ID

## Frontend Implementation

### 1. Type Definitions Update

```typescript
// lib/types.ts

export interface SharedSet {
  id: string;
  setId: string;
  shareCode: string;
  isPublic: boolean;
  createdBy: string;
  viewCount: number;
  copyCount: number;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface ShareMetadata {
  shareCode: string;
  shareUrl: string;
  viewCount: number;
  copyCount: number;
  createdAt: string;
  expiresAt?: string;
}
```

### 2. Context Updates

#### SetsContext Additions

```typescript
// contexts/SetsContext.tsx

interface SetsContextType {
  // ... existing properties

  // New sharing methods
  shareSet: (setId: string, options?: ShareOptions) => Promise<ShareMetadata>;
  getSharedSet: (shareCode: string) => Promise<WordSet | null>;
  copySharedSet: (shareCode: string, customName?: string) => Promise<string>;
  getShareInfo: (setId: string) => Promise<SharedSet | null>;
  updateShare: (shareId: string, options: Partial<SharedSet>) => Promise<void>;
  deleteShare: (shareId: string) => Promise<void>;
}

interface ShareOptions {
  isPublic?: boolean;
  expiresInDays?: number;
}
```

### 3. New Screens/Components

#### a. Share Modal Component

**Location:** `/components/ShareModal.tsx`

**Features:**

- Display shareable link
- Copy to clipboard button
- QR code generation (optional)
- Share statistics (views, copies)
- Toggle public/private
- Set expiration date
- Deactivate share button

#### b. Shared Set Preview Screen

**Location:** `/app/shared/[shareCode].tsx`

**Features:**

- Display set information (name, language, word count)
- Show author (anonymized)
- Preview first 5 word pairs
- "Practice Now" button → redirects to practice modes
- "Save to My Sets" button → copies set
- Guest-friendly (no auth required to view)

#### c. Practice with Share Code

**Location:** Update existing practice screens to support share codes

**Features:**

- Accept `?share=CODE` query parameter
- Load set from share code instead of user's collection
- Track as "practice from shared set" (don't save progress)
- Show "Save this set" CTA after practice

#### d. Share Button Integration

**Location:** `/components/SetCard.tsx` and set detail screens

**Features:**

- Share icon button on each set
- Opens ShareModal
- Show "shared" indicator if set is already shared

### 4. Routing Changes

```
/app/
  shared/
    [shareCode].tsx           # Preview shared set page
    practice/
      [shareCode]/
        flashcard.tsx         # Practice shared set in flashcard mode
        match.tsx             # Practice shared set in match mode
        quiz.tsx              # Practice shared set in quiz mode
```

### 5. Deep Linking Support

Configure app.json for deep linking:

```json
{
  "expo": {
    "scheme": "exquizite",
    "ios": {
      "associatedDomains": ["applinks:exquizite.app"]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "https",
              "host": "exquizite.app",
              "pathPrefix": "/shared"
            }
          ]
        }
      ]
    }
  }
}
```

## Security Considerations

### 1. Share Code Generation

- Use cryptographically secure random generation
- 12 characters: uppercase, lowercase, numbers (62^12 combinations)
- Check uniqueness before insertion
- Rate limit share creation (max 10 shares per user per day)

### 2. Access Control

- Public shares: accessible by anyone with the link
- Expired shares: return 404 or "Link expired" message
- Deactivated shares: return "Link no longer active"
- Original set deletion: keep share record but mark as unavailable

### 3. Data Privacy

- Never expose original creator's email or sensitive info
- Show only: display name (or "Anonymous User")
- Sanitize all user-generated content (set names, words)
- Prevent SQL injection in share code lookup

### 4. Abuse Prevention

- Rate limit share code lookups (100 per IP per hour)
- Rate limit copy operations (10 per user per hour)
- Flag sets with excessive copies as potential spam
- Allow users to report inappropriate shared content

### 5. Guest User Handling

- Allow practice without account
- Require account to save/copy sets
- Show signup CTA after practicing shared set
- Preserve share code in session for post-signup copy

## Implementation Phases

### Phase 1: Backend & Database (Week 1)

- [ ] Create database tables (`shared_sets`, `set_copies`)
- [ ] Update `word_sets` table schema
- [ ] Implement RLS policies
- [ ] Create `generate-share-link` function
- [ ] Create `get-shared-set` function
- [ ] Create `copy-shared-set` function
- [ ] Write unit tests for edge functions

### Phase 2: Context & Services (Week 1-2)

- [ ] Update TypeScript types
- [ ] Implement sharing methods in SetsContext
- [ ] Add share code validation
- [ ] Implement error handling and retries
- [ ] Add analytics tracking for share events

### Phase 3: UI Components (Week 2)

- [ ] Create ShareModal component
- [ ] Add share button to SetCard
- [ ] Create shared set preview screen
- [ ] Implement copy-to-clipboard functionality
- [ ] Add share statistics display
- [ ] Design share icon and visual indicators

### Phase 4: Routing & Deep Linking (Week 2-3)

- [ ] Create `/app/shared/[shareCode].tsx` route
- [ ] Implement share code parameter parsing
- [ ] Update practice screens to accept share codes
- [ ] Configure deep linking in app.json
- [ ] Test iOS/Android deep link handling
- [ ] Add fallback for web browsers

### Phase 5: Polish & Testing (Week 3)

- [ ] Implement QR code generation (optional)
- [ ] Add animations and loading states
- [ ] Handle offline scenarios gracefully
- [ ] Write integration tests
- [ ] Conduct user acceptance testing
- [ ] Performance testing (large sets)
- [ ] Security audit

### Phase 6: Analytics & Monitoring (Week 4)

- [ ] Track share creation events
- [ ] Track share views and copies
- [ ] Monitor most shared sets
- [ ] Set up alerts for abuse patterns
- [ ] Create admin dashboard for share moderation

## User Flow Examples

### Flow 1: Creating and Sharing a Set

1. User creates/has a word set
2. User taps "Share" button on set
3. ShareModal opens with generated link
4. User taps "Copy Link"
5. User shares link via messaging app
6. Toast confirms: "Link copied to clipboard"

### Flow 2: Receiving and Practicing a Shared Set

1. User receives link: `exquizite://shared/ABC123XYZ789`
2. User taps link → app opens to shared set preview
3. Preview shows set name, language, word count
4. User taps "Practice Now"
5. User selects practice mode (flashcard/match/quiz)
6. User practices the set
7. After practice, prompt: "Save this set to your collection?"
8. User taps "Save" → set is copied to their account

### Flow 3: Guest User Copying a Shared Set

1. Guest user (not logged in) opens shared link
2. Can view and practice the set
3. When attempting to save: "Sign up to save sets"
4. User creates account
5. Original share code is preserved
6. After signup, automatically prompts to save the set

## Success Metrics

### Engagement Metrics

- Number of shares created per week
- Share-to-copy conversion rate (% of views that result in copies)
- Average views per shared set
- Time spent on shared set preview page

### Growth Metrics

- New user signups from shared links
- Viral coefficient (avg shared sets per user)
- Guest-to-registered user conversion rate

### Quality Metrics

- Share link uptime (99.9% target)
- Average load time for shared set preview (<2s)
- Error rate on share operations (<0.1%)

## Future Enhancements (Post-MVP)

1. **Collaborative Sets**: Allow multiple users to edit a shared set
2. **Comments**: Let users comment on shared sets
3. **Collections**: Share multiple sets as a bundle
4. **Social Features**: Follow other users, like sets
5. **Leaderboards**: Compete on shared sets
6. **Custom Branding**: Add cover images to shared sets
7. **Analytics Dashboard**: Detailed stats for creators
8. **Private Sharing**: Share with specific email addresses
9. **Embedding**: Embed sets on external websites
10. **API Access**: Public API for third-party integrations

## Technical Debt & Considerations

- **Share Code Collisions**: Handle rare hash collisions gracefully
- **Set Versioning**: What happens if original set is updated after sharing?
- **Deleted Users**: Handle when original creator deletes their account
- **Large Sets**: Optimize performance for sets with 200 words
- **Internationalization**: Share UI must support all app languages
- **Accessibility**: Ensure share features are screen-reader friendly

## Questions to Resolve

1. Should shared sets update in real-time if the original is modified?
   - **Recommendation**: No - copies are snapshots at copy time

2. Can users un-share a set after sharing?
   - **Recommendation**: Yes - deactivate link, but keep copies already made

3. Should there be attribution on copied sets?
   - **Recommendation**: Optional "Created by [User]" watermark

4. What happens to shares when original set is deleted?
   - **Recommendation**: Mark as unavailable, keep existing copies

5. Should guests be able to create shares?
   - **Recommendation**: No - require account to create shares

## Resources Needed

- **Design**: Share modal UI, preview page design
- **Testing**: QA for iOS, Android, web deep linking
- **Documentation**: User guide for sharing feature
- **Marketing**: Announcement, tutorial video

## Risks & Mitigation

| Risk                               | Impact | Mitigation                        |
| ---------------------------------- | ------ | --------------------------------- |
| Spam/abuse via sharing             | High   | Rate limiting, reporting system   |
| Performance issues with viral sets | Medium | Caching, CDN for popular sets     |
| Deep linking failures              | Medium | Fallback to manual code entry     |
| Share code collisions              | Low    | 62^12 space + collision detection |
| Database load from shares          | Medium | Read replicas, caching layer      |

---

**Document Version**: 1.0
**Last Updated**: 2025-11-23
**Author**: Implementation Planning Team
