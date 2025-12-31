/**
 * Routing logic for the app navigation.
 * Extracted as pure functions to enable testing and prevent regressions.
 *
 * This module handles the decision of where to route users based on:
 * - Authentication state (no user, guest user, authenticated user)
 * - Language configuration state
 * - Current route/segment
 */

export type RouteSegments = string[];

export interface RoutingState {
  user: { isGuest: boolean } | null;
  isConfigured: boolean; // preferences.isConfigured
  segments: RouteSegments;
}

export type RoutingDecision =
  | { action: 'redirect'; to: '/(auth)/login' | '/(auth)/language-setup' | '/(tabs)' }
  | { action: 'stay' };

/**
 * Determines the routing decision based on current state.
 *
 * @param state - The current routing state
 * @returns The routing decision (redirect or stay)
 *
 * Test cases:
 *
 * 1. No user, not in auth group -> redirect to login
 *    Input: { user: null, isConfigured: false, segments: ['(tabs)'] }
 *    Output: { action: 'redirect', to: '/(auth)/login' }
 *
 * 2. No user, already in auth group -> stay
 *    Input: { user: null, isConfigured: false, segments: ['(auth)', 'login'] }
 *    Output: { action: 'stay' }
 *
 * 3. Guest user in auth group (not on language-setup) -> redirect to main app
 *    Input: { user: { isGuest: true }, isConfigured: false, segments: ['(auth)', 'login'] }
 *    Output: { action: 'redirect', to: '/(tabs)' }
 *
 * 4. Guest user on language-setup -> stay (let them configure if they want)
 *    Input: { user: { isGuest: true }, isConfigured: false, segments: ['(auth)', 'language-setup'] }
 *    Output: { action: 'stay' }
 *
 * 5. Guest user in main app -> stay
 *    Input: { user: { isGuest: true }, isConfigured: true, segments: ['(tabs)'] }
 *    Output: { action: 'stay' }
 *
 * 6. Authenticated user without language config, not on setup -> redirect to language-setup
 *    Input: { user: { isGuest: false }, isConfigured: false, segments: ['(tabs)'] }
 *    Output: { action: 'redirect', to: '/(auth)/language-setup' }
 *
 * 7. Authenticated user without language config, already on setup -> stay
 *    Input: { user: { isGuest: false }, isConfigured: false, segments: ['(auth)', 'language-setup'] }
 *    Output: { action: 'stay' }
 *
 * 8. Authenticated user with language config, still on setup -> redirect to main app
 *    Input: { user: { isGuest: false }, isConfigured: true, segments: ['(auth)', 'language-setup'] }
 *    Output: { action: 'redirect', to: '/(tabs)' }
 *
 * 9. Authenticated user with config, in auth group (not setup) -> redirect to main app
 *    Input: { user: { isGuest: false }, isConfigured: true, segments: ['(auth)', 'login'] }
 *    Output: { action: 'redirect', to: '/(tabs)' }
 *
 * 10. Authenticated user with config, in main app -> stay
 *     Input: { user: { isGuest: false }, isConfigured: true, segments: ['(tabs)'] }
 *     Output: { action: 'stay' }
 *
 * REGRESSION TEST - Infinite loop scenario:
 * 11. After language setup completion, user should go to main app (not loop back)
 *     Input: { user: { isGuest: false }, isConfigured: true, segments: ['(auth)', 'language-setup'] }
 *     Output: { action: 'redirect', to: '/(tabs)' }
 *     This should NOT trigger another redirect back to language-setup
 */
export function getRoutingDecision(state: RoutingState): RoutingDecision {
  const { user, isConfigured, segments } = state;

  const inAuthGroup = segments[0] === '(auth)';
  const onLanguageSetup = segments[1] === 'language-setup';
  const inTabsGroup = segments[0] === '(tabs)';

  // Case 1: No user at all - redirect to login
  if (!user && !inAuthGroup) {
    return { action: 'redirect', to: '/(auth)/login' };
  }

  // Case 2: No user, already in auth group - stay
  if (!user && inAuthGroup) {
    return { action: 'stay' };
  }

  // Case 3 & 4 & 5: Guest user handling
  if (user?.isGuest) {
    if (inAuthGroup && !onLanguageSetup) {
      // Guest on login page should go to main app
      return { action: 'redirect', to: '/(tabs)' };
    }
    // Guest either in main app or on language setup - stay there
    return { action: 'stay' };
  }

  // From here, user is authenticated (non-guest)

  // Case 6 & 7: Authenticated user without language setup
  if (user && !isConfigured && !onLanguageSetup) {
    return { action: 'redirect', to: '/(auth)/language-setup' };
  }

  if (user && !isConfigured && onLanguageSetup) {
    return { action: 'stay' };
  }

  // Case 8: Authenticated user with language setup complete, still on language-setup screen
  if (user && isConfigured && onLanguageSetup) {
    return { action: 'redirect', to: '/(tabs)' };
  }

  // Case 9: Authenticated user with language setup, but still in auth group
  if (user && isConfigured && inAuthGroup && !onLanguageSetup) {
    return { action: 'redirect', to: '/(tabs)' };
  }

  // Case 10: User is properly in main app or any other valid state
  return { action: 'stay' };
}
