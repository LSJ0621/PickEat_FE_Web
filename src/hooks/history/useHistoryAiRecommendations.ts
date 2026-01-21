/**
 * 이력 AI 추천 관련 Custom Hook
 * AI 추천 로직을 관리합니다.
 */

import { menuService } from '@/api/services/menu';
import { useUserLocation } from '@/hooks/map/useUserLocation';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppSelector } from '@/store/hooks';
import type { PlaceRecommendationItem } from '@/types/menu';
import type { RecommendationHistoryItem } from '@/types/user';
import { isAxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UseHistoryAiRecommendationsOptions {
  historyItem: RecommendationHistoryItem;
}

interface UseHistoryAiRecommendationsReturn {
  aiRecommendations: PlaceRecommendationItem[];
  isAiLoading: boolean;
  aiLoadingMenu: string | null;
  handleAiRecommend: (selectedMenu: string) => Promise<void>;
  loadStoredAiRecommendations: (menuName: string, options?: { silent?: boolean }) => Promise<void>;
  resetAiRecommendations: () => void;
}

/**
 * 이력 AI 추천 관련 로직을 관리하는 Custom Hook
 */
export const useHistoryAiRecommendations = (
  options: UseHistoryAiRecommendationsOptions
): UseHistoryAiRecommendationsReturn => {
  const { historyItem } = options;
  const [aiRecommendations, setAiRecommendations] = useState<PlaceRecommendationItem[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiLoadingMenu, setAiLoadingMenu] = useState<string | null>(null);
  const { latitude, longitude, address } = useUserLocation();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const { handleError, handleSuccess } = useErrorHandler();
  const { t } = useTranslation();

  const loadStoredAiRecommendations = useCallback(
    async (menuName: string, { silent }: { silent?: boolean } = {}) => {
      try {
        const response = await menuService.getPlaceRecommendationsByHistoryId(historyItem.id);
        const normalized = (response.places || [])
          .filter((place) => place.menuName === menuName)
          .map((place) => ({
            placeId: place.placeId.replace(/^places\//i, ''),
            name: place.name ?? '이름 없는 가게',
            reason: place.reason ?? '',
            menuName: place.menuName,
          }));

        setAiRecommendations(normalized);

        if (!silent) {
          if (normalized.length === 0) {
            handleError(t('errors.history.noSavedAiResults'), 'HistoryAiRecommendations');
          } else {
            handleSuccess('toast.ai.showingSavedRecommendation');
          }
        }
      } catch (historyError) {
        if (!silent) {
          handleError(historyError, 'HistoryAiRecommendations');
        }
      }
    },
    [historyItem.id, handleError, handleSuccess, t]
  );

  const handleAiRecommend = useCallback(
    async (selectedMenu: string) => {
      if (!isAuthenticated) {
        handleError(t('toast.auth.loginRequired'), 'HistoryAiRecommendations');
        return;
      }

      const normalizedAddress = historyItem.requestAddress?.trim() || address?.trim();
      const locationFallback = latitude !== null && longitude !== null
        ? `${latitude},${longitude}`
        : null;
      const queryBase = normalizedAddress || locationFallback;

      if (!queryBase) {
        handleError(t('errors.agent.locationRequired'), 'HistoryAiRecommendations');
        return;
      }

      const query = `${queryBase} ${selectedMenu}`.trim();

      setAiLoadingMenu(selectedMenu);
      setIsAiLoading(true);

      try {
        const response = await menuService.recommendPlaces({
          query,
          historyId: historyItem.id,
          menuName: selectedMenu,
        });
        const normalized = (response.recommendations || []).map((item) => ({
          ...item,
          placeId: item.placeId.replace(/^places\//i, ''),
          menuName: selectedMenu,
        }));

        setAiRecommendations(normalized);
        if (normalized.length === 0) {
          handleError(t('errors.agent.noAiResults'), 'HistoryAiRecommendations');
        }
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 400) {
          await loadStoredAiRecommendations(selectedMenu);
        } else {
          handleError(error, 'HistoryAiRecommendations');
        }
      } finally {
        setIsAiLoading(false);
        setAiLoadingMenu(null);
      }
    },
    [isAuthenticated, historyItem, address, latitude, longitude, loadStoredAiRecommendations, handleError, t]
  );

  const resetAiRecommendations = useCallback(() => {
    setAiRecommendations([]);
    setAiLoadingMenu(null);
  }, []);

  return {
    aiRecommendations,
    isAiLoading,
    aiLoadingMenu,
    handleAiRecommend,
    loadStoredAiRecommendations,
    resetAiRecommendations,
  };
};

