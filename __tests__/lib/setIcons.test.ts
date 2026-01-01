import { getIconForSet, commonSetIcons } from '@/lib/setIcons';

describe('setIcons', () => {
  describe('getIconForSet', () => {
    it('returns restaurant icon for food-related sets', () => {
      expect(getIconForSet('Spanish Food Vocabulary')).toBe('restaurant');
      expect(getIconForSet('Restaurant Phrases')).toBe('restaurant');
      expect(getIconForSet('Cooking Terms')).toBe('restaurant');
      expect(getIconForSet('Dining Out')).toBe('restaurant');
      expect(getIconForSet('Meal Time')).toBe('restaurant');
    });

    it('returns airplane icon for travel-related sets', () => {
      expect(getIconForSet('Travel Phrases')).toBe('airplane');
      expect(getIconForSet('Airport Vocabulary')).toBe('airplane');
      expect(getIconForSet('Vacation Words')).toBe('airplane');
      expect(getIconForSet('Tourism Guide')).toBe('airplane');
    });

    it('returns briefcase icon for business-related sets', () => {
      expect(getIconForSet('Business English')).toBe('briefcase');
      expect(getIconForSet('Office Terminology')).toBe('briefcase');
      expect(getIconForSet('Work Vocabulary')).toBe('briefcase');
    });

    it('returns cart icon for shopping-related sets', () => {
      expect(getIconForSet('Shopping Phrases')).toBe('cart');
      expect(getIconForSet('At the Store')).toBe('storefront');
      expect(getIconForSet('Market Vocabulary')).toBe('storefront');
    });

    it('returns medical icon for health-related sets', () => {
      expect(getIconForSet('Health Vocabulary')).toBe('medical');
      expect(getIconForSet('At the Hospital')).toBe('medical');
      expect(getIconForSet('Doctor Visit')).toBe('medical');
      expect(getIconForSet('Medicine Terms')).toBe('medical');
    });

    it('returns school icon for education-related sets', () => {
      expect(getIconForSet('School Subjects')).toBe('school');
      expect(getIconForSet('Education Vocabulary')).toBe('school');
      expect(getIconForSet('Study Terms')).toBe('book');
      expect(getIconForSet('Learning Materials')).toBe('book');
    });

    it('returns laptop icon for technology-related sets', () => {
      expect(getIconForSet('Technology Terms')).toBe('laptop');
      expect(getIconForSet('Computer Vocabulary')).toBe('laptop');
      expect(getIconForSet('Internet Phrases')).toBe('wifi');
      expect(getIconForSet('Coding Terms')).toBe('code');
    });

    it('returns home icon for home-related sets', () => {
      expect(getIconForSet('Home Vocabulary')).toBe('home');
      expect(getIconForSet('Family Members')).toBe('people');
      expect(getIconForSet('Children Activities')).toBe('people');
    });

    it('returns default book icon for unmatched sets', () => {
      expect(getIconForSet('Random Set Name')).toBe('book');
      expect(getIconForSet('Unknown Topic')).toBe('book');
      expect(getIconForSet('XYZ123')).toBe('book');
      expect(getIconForSet('')).toBe('book');
    });

    it('is case-insensitive', () => {
      expect(getIconForSet('FOOD vocabulary')).toBe('restaurant');
      expect(getIconForSet('Travel PHRASES')).toBe('airplane');
      expect(getIconForSet('BuSiNeSs TeRmS')).toBe('briefcase');
    });

    it('handles multiple keywords correctly', () => {
      // Should match the first keyword found in the map
      expect(getIconForSet('Food and Travel')).toBe('restaurant'); // 'food' comes first in iteration
    });

    it('handles special characters', () => {
      expect(getIconForSet('Spanish Food - Restaurant Vocabulary')).toBe(
        'restaurant'
      );
      expect(getIconForSet('Travel & Tourism')).toBe('airplane');
    });

    it('handles numeric and special set names', () => {
      expect(getIconForSet('123 Numbers')).toBe('book');
      expect(getIconForSet('@#$%')).toBe('book');
    });
  });

  describe('commonSetIcons', () => {
    it('contains expected common icons', () => {
      expect(commonSetIcons).toContain('restaurant');
      expect(commonSetIcons).toContain('airplane');
      expect(commonSetIcons).toContain('briefcase');
      expect(commonSetIcons).toContain('cart');
      expect(commonSetIcons).toContain('medical');
      expect(commonSetIcons).toContain('school');
      expect(commonSetIcons).toContain('book');
    });

    it('has at least 15 icons', () => {
      expect(commonSetIcons.length).toBeGreaterThanOrEqual(15);
    });

    it('contains only unique icons', () => {
      const uniqueIcons = new Set(commonSetIcons);
      expect(uniqueIcons.size).toBe(commonSetIcons.length);
    });
  });

  describe('Real-world Set Names', () => {
    it('correctly identifies common language learning sets', () => {
      expect(getIconForSet('Spanish Restaurant Phrases')).toBe('restaurant');
      expect(getIconForSet('German Travel Vocabulary')).toBe('airplane');
      expect(getIconForSet('French Business Terms')).toBe('briefcase');
      expect(getIconForSet('Italian Food Words')).toBe('restaurant');
      expect(getIconForSet('Japanese Shopping Expressions')).toBe('cart');
    });

    it('handles descriptive set names', () => {
      expect(getIconForSet('Essential Phrases for Travel Abroad')).toBe(
        'airplane'
      );
      expect(getIconForSet('Common Words for Restaurant Dining')).toBe(
        'restaurant'
      );
      expect(getIconForSet('Professional Business Communication')).toBe(
        'briefcase'
      );
    });

    it('handles topic-specific vocabulary sets', () => {
      expect(getIconForSet('Weather and Climate')).toBe('partly-sunny');
      expect(getIconForSet('Animals and Pets')).toBe('paw');
      expect(getIconForSet('Music and Arts')).toBe('musical-notes');
      expect(getIconForSet('Sports and Fitness')).toBe('football');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string', () => {
      expect(getIconForSet('')).toBe('book');
    });

    it('handles whitespace-only string', () => {
      expect(getIconForSet('   ')).toBe('book');
    });

    it('handles very long set names', () => {
      const longName = 'A'.repeat(1000) + ' food';
      expect(getIconForSet(longName)).toBe('restaurant');
    });

    it('handles unicode characters', () => {
      expect(getIconForSet('食べ物 food vocabulary')).toBe('restaurant');
      expect(getIconForSet('旅行 travel phrases')).toBe('airplane');
    });
  });
});
