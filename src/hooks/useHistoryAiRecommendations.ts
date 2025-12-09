/**
 * 이력 AI 추천 관련 Custom Hook
 * AI 추천 로직을 관리합니다.
 */

import { menuService } from '@/api/services/menu';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useAppSelector } from '@/store/hooks';
import type { PlaceRecommendationItem } from '@/types/menu';
import type { RecommendationHistoryItem } from '@/types/user';
import { isAxiosError } from 'axios';
import { useCallback, useState } from 'react';

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
            alert('저장된 AI 추천 결과가 없습니다.');
          } else {
            alert('이미 추천받은 메뉴입니다. 저장된 결과를 보여드렸어요.');
          }
        }
      } catch (historyError) {
        console.error('기존 AI 추천 조회 실패:', historyError);
        if (!silent) {
          alert('기존 AI 추천 결과를 가져오지 못했습니다.');
        }
      }
    },
    [historyItem.id]
  );

  const handleAiRecommend = useCallback(
    async (selectedMenu: string) => {
      if (!isAuthenticated) {
        alert('로그인이 필요합니다.');
        return;
      }

      const normalizedAddress = historyItem.requestAddress?.trim() || address?.trim();
      const locationFallback = historyItem.requestLocation
        ? `${historyItem.requestLocation.lat},${historyItem.requestLocation.lng}`
        : latitude !== null && longitude !== null
          ? `${latitude},${longitude}`
          : null;
      const queryBase = normalizedAddress || locationFallback;

      if (!queryBase) {
        alert('AI 추천을 사용하려면 주소 또는 위치 정보가 필요합니다.');
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
          alert('AI 추천 결과가 없습니다.');
        }
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 400) {
          await loadStoredAiRecommendations(selectedMenu);
        } else {
          console.error('AI 추천 식당 조회 실패:', error);
          alert('AI 추천 식당을 가져오지 못했습니다.');
        }
      } finally {
        setIsAiLoading(false);
        setAiLoadingMenu(null);
      }
    },
    [isAuthenticated, historyItem, address, latitude, longitude, loadStoredAiRecommendations]
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

