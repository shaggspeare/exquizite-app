import { getRoutingDecision, RoutingState, RoutingDecision } from '../../lib/routing';

describe('getRoutingDecision', () => {
  describe('No user scenarios', () => {
    it('redirects to login when no user and not in auth group', () => {
      const state: RoutingState = {
        user: null,
        isConfigured: false,
        segments: ['(tabs)'],
      };
      expect(getRoutingDecision(state)).toEqual({
        action: 'redirect',
        to: '/(auth)/login',
      });
    });

    it('stays when no user but already in auth group', () => {
      const state: RoutingState = {
        user: null,
        isConfigured: false,
        segments: ['(auth)', 'login'],
      };
      expect(getRoutingDecision(state)).toEqual({ action: 'stay' });
    });
  });

  describe('Guest user scenarios', () => {
    it('redirects guest without config to language-setup', () => {
      const state: RoutingState = {
        user: { isGuest: true },
        isConfigured: false,
        segments: ['(tabs)'],
      };
      expect(getRoutingDecision(state)).toEqual({
        action: 'redirect',
        to: '/(auth)/language-setup',
      });
    });

    it('redirects guest from login page to language-setup when not configured', () => {
      const state: RoutingState = {
        user: { isGuest: true },
        isConfigured: false,
        segments: ['(auth)', 'login'],
      };
      expect(getRoutingDecision(state)).toEqual({
        action: 'redirect',
        to: '/(auth)/language-setup',
      });
    });

    it('stays when guest is on language-setup page', () => {
      const state: RoutingState = {
        user: { isGuest: true },
        isConfigured: false,
        segments: ['(auth)', 'language-setup'],
      };
      expect(getRoutingDecision(state)).toEqual({ action: 'stay' });
    });

    it('redirects guest from language-setup to main app after completing setup', () => {
      const state: RoutingState = {
        user: { isGuest: true },
        isConfigured: true,
        segments: ['(auth)', 'language-setup'],
      };
      expect(getRoutingDecision(state)).toEqual({
        action: 'redirect',
        to: '/(tabs)',
      });
    });

    it('stays when guest is in main app with config', () => {
      const state: RoutingState = {
        user: { isGuest: true },
        isConfigured: true,
        segments: ['(tabs)'],
      };
      expect(getRoutingDecision(state)).toEqual({ action: 'stay' });
    });

    it('redirects guest with config from auth group to main app', () => {
      const state: RoutingState = {
        user: { isGuest: true },
        isConfigured: true,
        segments: ['(auth)', 'login'],
      };
      expect(getRoutingDecision(state)).toEqual({
        action: 'redirect',
        to: '/(tabs)',
      });
    });
  });

  describe('Authenticated user without language config', () => {
    it('redirects to language-setup when not on setup page', () => {
      const state: RoutingState = {
        user: { isGuest: false },
        isConfigured: false,
        segments: ['(tabs)'],
      };
      expect(getRoutingDecision(state)).toEqual({
        action: 'redirect',
        to: '/(auth)/language-setup',
      });
    });

    it('stays when already on language-setup page', () => {
      const state: RoutingState = {
        user: { isGuest: false },
        isConfigured: false,
        segments: ['(auth)', 'language-setup'],
      };
      expect(getRoutingDecision(state)).toEqual({ action: 'stay' });
    });
  });

  describe('Authenticated user with language config', () => {
    it('redirects from language-setup to main app after completing setup (REGRESSION TEST)', () => {
      const state: RoutingState = {
        user: { isGuest: false },
        isConfigured: true,
        segments: ['(auth)', 'language-setup'],
      };
      expect(getRoutingDecision(state)).toEqual({
        action: 'redirect',
        to: '/(tabs)',
      });
    });

    it('redirects from auth group (not language-setup) to main app', () => {
      const state: RoutingState = {
        user: { isGuest: false },
        isConfigured: true,
        segments: ['(auth)', 'login'],
      };
      expect(getRoutingDecision(state)).toEqual({
        action: 'redirect',
        to: '/(tabs)',
      });
    });

    it('stays when in main app', () => {
      const state: RoutingState = {
        user: { isGuest: false },
        isConfigured: true,
        segments: ['(tabs)'],
      };
      expect(getRoutingDecision(state)).toEqual({ action: 'stay' });
    });
  });

  describe('Edge cases', () => {
    it('handles empty segments array', () => {
      const state: RoutingState = {
        user: null,
        isConfigured: false,
        segments: [],
      };
      // No user and not in auth group -> redirect to login
      expect(getRoutingDecision(state)).toEqual({
        action: 'redirect',
        to: '/(auth)/login',
      });
    });

    it('handles nested routes in tabs group', () => {
      const state: RoutingState = {
        user: { isGuest: false },
        isConfigured: true,
        segments: ['(tabs)', 'sets', '[id]'],
      };
      expect(getRoutingDecision(state)).toEqual({ action: 'stay' });
    });

    it('handles nested routes in auth group', () => {
      const state: RoutingState = {
        user: { isGuest: false },
        isConfigured: true,
        segments: ['(auth)', 'register'],
      };
      expect(getRoutingDecision(state)).toEqual({
        action: 'redirect',
        to: '/(tabs)',
      });
    });
  });

  describe('Regression: Infinite loop prevention', () => {
    it('does not create a loop when transitioning from language-setup to tabs', () => {
      // This simulates what happens after setLanguages() is called
      // Step 1: User completes language setup, isConfigured becomes true
      const afterSetup: RoutingState = {
        user: { isGuest: false },
        isConfigured: true,
        segments: ['(auth)', 'language-setup'],
      };
      const decision1 = getRoutingDecision(afterSetup);
      expect(decision1).toEqual({ action: 'redirect', to: '/(tabs)' });

      // Step 2: After redirect to tabs, should stay there
      const afterRedirect: RoutingState = {
        user: { isGuest: false },
        isConfigured: true,
        segments: ['(tabs)'],
      };
      const decision2 = getRoutingDecision(afterRedirect);
      expect(decision2).toEqual({ action: 'stay' });
    });

    it('does not redirect guest users back and forth', () => {
      // Guest in tabs without config should be redirected to language-setup
      const guestInTabs: RoutingState = {
        user: { isGuest: true },
        isConfigured: false,
        segments: ['(tabs)'],
      };
      expect(getRoutingDecision(guestInTabs)).toEqual({
        action: 'redirect',
        to: '/(auth)/language-setup',
      });

      // Guest on language-setup should stay there
      const guestOnSetup: RoutingState = {
        user: { isGuest: true },
        isConfigured: false,
        segments: ['(auth)', 'language-setup'],
      };
      expect(getRoutingDecision(guestOnSetup)).toEqual({ action: 'stay' });

      // After guest completes setup, should be redirected to tabs
      const guestAfterSetup: RoutingState = {
        user: { isGuest: true },
        isConfigured: true,
        segments: ['(auth)', 'language-setup'],
      };
      expect(getRoutingDecision(guestAfterSetup)).toEqual({
        action: 'redirect',
        to: '/(tabs)',
      });

      // Guest with config in tabs should stay
      const guestWithConfigInTabs: RoutingState = {
        user: { isGuest: true },
        isConfigured: true,
        segments: ['(tabs)'],
      };
      expect(getRoutingDecision(guestWithConfigInTabs)).toEqual({ action: 'stay' });
    });
  });
});
