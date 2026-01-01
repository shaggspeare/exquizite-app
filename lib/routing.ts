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
 * 3. Guest user without language config, not on setup -> redirect to language-setup
 *    Input: { user: { isGuest: true }, isConfigured: false, segments: ['(tabs)'] }
 *    Output: { action: 'redirect', to: '/(auth)/language-setup' }
 *
 * 4. Guest user without language config, on language-setup -> stay
 *    Input: { user: { isGuest: true }, isConfigured: false, segments: ['(auth)', 'language-setup'] }
 *    Output: { action: 'stay' }
 *
 * 5. Guest user with language config complete, still on setup -> redirect to main app
 *    Input: { user: { isGuest: true }, isConfigured: true, segments: ['(auth)', 'language-setup'] }
 *    Output: { action: 'redirect', to: '/(tabs)' }
 *
 * 6. Guest user with config, in auth group (not setup) -> redirect to main app
 *    Input: { user: { isGuest: true }, isConfigured: true, segments: ['(auth)', 'login'] }
 *    Output: { action: 'redirect', to: '/(tabs)' }
 *
 * 7. Guest user with config, in main app -> stay
 *    Input: { user: { isGuest: true }, isConfigured: true, segments: ['(tabs)'] }
 *    Output: { action: 'stay' }
 *
 * 8. Authenticated user without language config, not on setup -> redirect to language-setup
 *    Input: { user: { isGuest: false }, isConfigured: false, segments: ['(tabs)'] }
 *    Output: { action: 'redirect', to: '/(auth)/language-setup' }
 *
 * 9. Authenticated user without language config, already on setup -> stay
 *    Input: { user: { isGuest: false }, isConfigured: false, segments: ['(auth)', 'language-setup'] }
 *    Output: { action: 'stay' }
 *
 * 10. Authenticated user with language config, still on setup -> redirect to main app
 *     Input: { user: { isGuest: false }, isConfigured: true, segments: ['(auth)', 'language-setup'] }
 *     Output: { action: 'redirect', to: '/(tabs)' }
 *
 * 11. Authenticated user with config, in auth group (not setup) -> redirect to main app
 *     Input: { user: { isGuest: false }, isConfigured: true, segments: ['(auth)', 'login'] }
 *     Output: { action: 'redirect', to: '/(tabs)' }
 *
 * 12. Authenticated user with config, in main app -> stay
 *     Input: { user: { isGuest: false }, isConfigured: true, segments: ['(tabs)'] }
 *     Output: { action: 'stay' }
 *
 * REGRESSION TEST - Infinite loop scenario:
 * 13. After language setup completion, user should go to main app (not loop back)
 *     Input: { user: { isGuest: false }, isConfigured: true, segments: ['(auth)', 'language-setup'] }
 *     Output: { action: 'redirect', to: '/(tabs)' }
 *     This should NOT trigger another redirect back to language-setup
 */
export function getRoutingDecision(state: RoutingState): RoutingDecision {
  const { user, isConfigured, segments } = state;

  const inAuthGroup = segments[0] === '(auth)';
  const onLanguageSetup = segments[1] === 'language-setup';

  // Case 1: No user at all - redirect to login
  if (!user && !inAuthGroup) {
    return { action: 'redirect', to: '/(auth)/login' };
  }

  // Case 2: No user, already in auth group - stay
  if (!user && inAuthGroup) {
    return { action: 'stay' };
  }

  // From here, user exists (guest or authenticated)

  // Case 3 & 4: Any user (guest or authenticated) without language config
  if (user && !isConfigured && !onLanguageSetup) {
    return { action: 'redirect', to: '/(auth)/language-setup' };
  }

  if (user && !isConfigured && onLanguageSetup) {
    return { action: 'stay' };
  }

  // Case 5 & 6 & 7: Any user (guest or authenticated) with language setup complete
  if (user && isConfigured && onLanguageSetup) {
    return { action: 'redirect', to: '/(tabs)' };
  }

  if (user && isConfigured && inAuthGroup && !onLanguageSetup) {
    return { action: 'redirect', to: '/(tabs)' };
  }

  // Case 8: User is properly in main app or any other valid state
  return { action: 'stay' };
}
