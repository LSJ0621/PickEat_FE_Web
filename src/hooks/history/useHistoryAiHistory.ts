/**
 * 이력 AI 추천 이력 관련 Custom Hook
 * AI 추천 이력 로직을 관리합니다.
 */

import { menuService } from '@/api/services/menu';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppSelector } from '@/store/hooks';
import type { PlaceRecommendationItem } from '@/types/menu';
import type { RecommendationHistoryItem } from '@/types/user';
import { useCallback, useMemo, useState } from 'react';

interface MenuPlaceRecommendationGroup {
  menuName: string;
  recommendations: PlaceRecommendationItem[];
}

interface UseHistoryAiHistoryOptions {
  historyItem: RecommendationHistoryItem;
}

interface UseHistoryAiHistoryReturn {
  showAiHistory: boolean;
  aiHistoryRecommendations: PlaceRecommendationItem[];
  isAiHistoryLoading: boolean;
  groupedAiHistory: MenuPlaceRecommendationGroup[];
  handleShowAiHistory: () => Promise<void>;
}

/**
 * 이력 AI 추천 이력 관련 로직을 관리하는 Custom Hook
 */
export const useHistoryAiHistory = (
  options: UseHistoryAiHistoryOptions
): UseHistoryAiHistoryReturn => {
  const { historyItem } = options;
  const [showAiHistory, setShowAiHistory] = useState(false);
  const [aiHistoryRecommendations, setAiHistoryRecommendations] = useState<PlaceRecommendationItem[]>([]);
  const [isAiHistoryLoading, setIsAiHistoryLoading] = useState(false);
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const { handleError } = useErrorHandler();

  const handleShowAiHistory = useCallback(async () => {
    if (!isAuthenticated) {
      handleError('로그인이 필요합니다.', 'useHistoryAiHistory');
      return;
    }

    if (!historyItem.hasPlaceRecommendations) {
      handleError('이 메뉴에 대한 AI 추천 이력이 없습니다.', 'useHistoryAiHistory');
      return;
    }

    // 이미 열려있으면 닫기 (토글)
    if (showAiHistory && aiHistoryRecommendations.length > 0) {
      setShowAiHistory(false);
      return;
    }

    setIsAiHistoryLoading(true);
    setShowAiHistory(true);
    setAiHistoryRecommendations([]);

    try {
      const response = await menuService.getPlaceRecommendationsByHistoryId(historyItem.id);
      const normalized = (response.places || []).map((place) => ({
        placeId: place.placeId.replace(/^places\//i, ''),
        name: place.name ?? '이름 없는 가게',
        reason: place.reason ?? '',
        menuName: place.menuName,
      }));

      setAiHistoryRecommendations(normalized);
      if (normalized.length === 0) {
        handleError('AI 추천 이력이 없습니다.', 'useHistoryAiHistory');
        setShowAiHistory(false);
      }
    } catch (error) {
      handleError(error, 'useHistoryAiHistory');
      setShowAiHistory(false);
    } finally {
      setIsAiHistoryLoading(false);
    }
  }, [isAuthenticated, historyItem, showAiHistory, aiHistoryRecommendations.length, handleError]);

  const groupedAiHistory: MenuPlaceRecommendationGroup[] = useMemo(() => {
    return aiHistoryRecommendations.reduce<MenuPlaceRecommendationGroup[]>((acc, place) => {
      const key = place.menuName || '선택한 메뉴';
      const existing = acc.find((group) => group.menuName === key);
      if (existing) {
        existing.recommendations.push(place);
      } else {
        acc.push({ menuName: key, recommendations: [place] });
      }
      return acc;
    }, []);
  }, [aiHistoryRecommendations]);

  return {
    showAiHistory,
    aiHistoryRecommendations,
    isAiHistoryLoading,
    groupedAiHistory,
    handleShowAiHistory,
  };
};

