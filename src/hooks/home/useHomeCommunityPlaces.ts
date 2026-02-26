import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { userPlaceService } from '@/api/services/user-place';
import type { UserPlace } from '@/types/user-place';

interface UseHomeCommunityPlacesReturn {
  places: UserPlace[];
  isLoading: boolean;
  isVisible: boolean;
}

export function useHomeCommunityPlaces(): UseHomeCommunityPlacesReturn {
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const [places, setPlaces] = useState<UserPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPlaces = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const response = await userPlaceService.getUserPlaces({ limit: 4, status: 'APPROVED' });
      setPlaces(response.items);
    } catch {
      // Non-critical: section hides itself when empty
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const isVisible = isAuthenticated === true && (isLoading || places.length > 0);

  return { places, isLoading, isVisible };
}
