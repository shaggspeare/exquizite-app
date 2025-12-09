import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from 'react';
import { storage } from '@/lib/storage';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { useSets } from './SetsContext';

const TOUR_STORAGE_KEY = 'exquizite_tour_completed';

interface TourContextType {
  hasCompletedTour: boolean;
  showTour: () => void;
  completeTour: () => void;
  skipTour: () => void;
  isTourVisible: boolean;
  isLoading: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const { preferences, isLoading: langLoading } = useLanguage();
  const { sets, isLoading: setsLoading } = useSets();

  const [hasCompletedTour, setHasCompletedTour] = useState(false);
  const [isTourVisible, setIsTourVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const previousUserId = useRef<string | null>(null);

  // Get user-scoped storage key
  const getTourKey = (userId: string | null | undefined) => {
    if (!userId) return `${TOUR_STORAGE_KEY}_guest`;
    return `${TOUR_STORAGE_KEY}_${userId}`;
  };

  // Load tour completion state from storage
  const loadTourCompletion = async () => {
    setIsLoading(true);
    try {
      const key = getTourKey(user?.id);
      const completed = await storage.getItem(key);
      setHasCompletedTour(completed === 'true');
    } catch (error) {
      console.error('Failed to load tour completion state:', error);
      setHasCompletedTour(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Save tour completion to storage
  const saveTourCompletion = async () => {
    try {
      const key = getTourKey(user?.id);
      await storage.setItem(key, 'true');
      setHasCompletedTour(true);
    } catch (error) {
      console.error('Failed to save tour completion:', error);
    }
  };

  // Load tour state when user changes
  useEffect(() => {
    if (user?.id !== previousUserId.current) {
      loadTourCompletion();
      previousUserId.current = user?.id ?? null;
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    loadTourCompletion();
  }, []);

  const showTour = () => {
    setIsTourVisible(true);
  };

  const completeTour = async () => {
    setIsTourVisible(false);
    await saveTourCompletion();
  };

  const skipTour = async () => {
    setIsTourVisible(false);
    await saveTourCompletion();
  };

  return (
    <TourContext.Provider
      value={{
        hasCompletedTour,
        showTour,
        completeTour,
        skipTour,
        isTourVisible,
        isLoading,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}
