/**
 * Helper utilities for assigning topic-based icons to word sets
 * This helps visually differentiate different topics in the UI
 */

import { Ionicons } from '@expo/vector-icons';

type IconName = keyof typeof Ionicons.glyphMap;

/**
 * Map of common topic keywords to appropriate icons
 */
const topicIconMap: Record<string, IconName> = {
  // Food & Dining
  food: 'restaurant',
  restaurant: 'restaurant',
  dining: 'restaurant',
  cooking: 'restaurant',
  meal: 'restaurant',

  // Travel
  travel: 'airplane',
  airport: 'airplane',
  flight: 'airplane',
  vacation: 'airplane',
  tourism: 'airplane',
  hotel: 'bed',

  // Business
  business: 'briefcase',
  work: 'briefcase',
  office: 'briefcase',
  meeting: 'people',

  // Shopping
  shopping: 'cart',
  store: 'storefront',
  market: 'storefront',

  // Health & Medical
  health: 'medical',
  hospital: 'medical',
  doctor: 'medical',
  medicine: 'medical',

  // Education
  school: 'school',
  education: 'school',
  study: 'book',
  learning: 'book',

  // Nature
  nature: 'leaf',
  environment: 'leaf',
  plants: 'flower',
  garden: 'flower',

  // Sports & Fitness
  sports: 'football',
  fitness: 'fitness',
  gym: 'fitness',
  exercise: 'fitness',

  // Technology
  technology: 'laptop',
  computer: 'laptop',
  internet: 'wifi',
  coding: 'code',

  // Music & Arts
  music: 'musical-notes',
  art: 'color-palette',
  painting: 'color-palette',

  // Home & Family
  home: 'home',
  family: 'people',
  children: 'people',

  // Weather
  weather: 'partly-sunny',
  climate: 'partly-sunny',

  // Animals
  animals: 'paw',
  pets: 'paw',

  // Default fallback
  default: 'book',
};

/**
 * Get an appropriate icon for a set based on its name
 * Attempts to match keywords in the set name to topic icons
 *
 * @param setName - The name of the word set
 * @returns An icon name from Ionicons
 */
export function getIconForSet(setName: string): IconName {
  const lowerName = setName.toLowerCase();

  // Check each keyword in the topic map
  for (const [keyword, icon] of Object.entries(topicIconMap)) {
    if (lowerName.includes(keyword)) {
      return icon;
    }
  }

  // Return default if no match found
  return topicIconMap.default;
}

/**
 * Predefined icon options that can be used for sets
 * Useful for UI pickers or random assignment
 */
export const commonSetIcons: IconName[] = [
  'restaurant',
  'airplane',
  'briefcase',
  'cart',
  'medical',
  'school',
  'leaf',
  'football',
  'laptop',
  'musical-notes',
  'home',
  'partly-sunny',
  'paw',
  'book',
  'star',
  'heart',
  'globe',
  'trophy',
  'camera',
  'cafe',
];
