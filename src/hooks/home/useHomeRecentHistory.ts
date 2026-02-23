import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { userService } from '@/api/services/user';
import type { RecommendationHistoryItem } from '@/types/user';

interface UseHomeRecentHistoryReturn {
  items: RecommendationHistoryItem[];
  isLoading: boolean;
  isVisible: boolean;
}

export function useHomeRecentHistory(): UseHomeRecentHistoryReturn {
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const [items, setItems] = useState<RecommendationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const response = await userService.getRecommendationHistory({ limit: 3 });
      setItems(response.items);
    } catch {
      // Non-critical: section hides itself when empty
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const isVisible = isAuthenticated === true && (isLoading || items.length > 0);

  return { items, isLoading, isVisible };
}
