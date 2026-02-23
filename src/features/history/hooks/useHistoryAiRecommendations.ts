/**
 * 이력 AI 추천 관련 Custom Hook
 * AI 추천 로직을 관리합니다.
 */

import { menuService } from '@features/agent/api';
import { useUserLocation } from '@features/map/hooks/useUserLocation';
import { useErrorHandler } from '@shared/hooks/useErrorHandler';
import { useAppSelector } from '@app/store/hooks';
import type { PlaceRecommendationItemV2 } from '@features/agent/types';
import type { RecommendationHistoryItem } from '@features/user/types';
import { isAxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UseHistoryAiRecommendationsOptions {
  historyItem: RecommendationHistoryItem;
}

interface UseHistoryAiRecommendationsReturn {
  aiRecommendations: PlaceRecommendationItemV2[];
  searchEntryPointHtml: string | null;
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
  const [aiRecommendations, setAiRecommendations] = useState<PlaceRecommendationItemV2[]>([]);
  const [searchEntryPointHtml, setSearchEntryPointHtml] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiLoadingMenu, setAiLoadingMenu] = useState<string | null>(null);
  const { latitude, longitude, address } = useUserLocation();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const { handleError, handleSuccess } = useErrorHandler();
  const { t, i18n } = useTranslation();

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
            rating: place.rating ?? undefined,
            reviewCount: place.userRatingCount ?? undefined,
            isOpen: place.openNow ?? undefined,
            address: place.address ?? undefined,
            photoUrl: place.photos?.[0] ?? undefined,
            source: place.source,
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

      // Validate location data
      if (latitude === null || longitude === null) {
        handleError(t('errors.agent.locationRequired'), 'HistoryAiRecommendations');
        return;
      }

      // Validate address
      const normalizedAddress = historyItem.requestAddress?.trim() || address?.trim();
      if (!normalizedAddress) {
        handleError(t('errors.agent.addressRequired'), 'HistoryAiRecommendations');
        return;
      }

      setAiLoadingMenu(selectedMenu);
      setIsAiLoading(true);

      try {
        const response = await menuService.recommendPlacesV2({
          menuName: selectedMenu,
          address: normalizedAddress,
          latitude,
          longitude,
          menuRecommendationId: historyItem.id,
          language: i18n.language === 'en' ? 'en' : 'ko',
        });

        const normalized = (response.recommendations || []).map((item) => ({
          ...item,
          placeId: item.placeId.replace(/^places\//i, ''),
          menuName: selectedMenu,
        }));

        setAiRecommendations(normalized);
        setSearchEntryPointHtml(response.searchEntryPointHtml ?? null);

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
    [isAuthenticated, historyItem, address, latitude, longitude, loadStoredAiRecommendations, handleError, t, i18n.language]
  );

  const resetAiRecommendations = useCallback(() => {
    setAiRecommendations([]);
    setAiLoadingMenu(null);
  }, []);

  return {
    aiRecommendations,
    searchEntryPointHtml,
    isAiLoading,
    aiLoadingMenu,
    handleAiRecommend,
    loadStoredAiRecommendations,
    resetAiRecommendations,
  };
};
