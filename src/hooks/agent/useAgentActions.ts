import { menuService } from '@/api/services/menu';
import { searchService } from '@/api/services/search';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setAiLoading,
  setIsSearching,
  setRestaurants,
  setSelectedMenu,
  setSelectedPlace,
  setShowConfirmCard,
  upsertAiRecommendations,
} from '@/store/slices/agentSlice';
import type { ResultsSectionRef } from '@/components/features/agent/ResultsSection';
import { isAxiosError } from 'axios';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface UseAgentActionsProps {
  latitude: number | null;
  longitude: number | null;
  hasLocation: boolean;
  address: string | null;
  resultsSectionRef: React.RefObject<ResultsSectionRef | null>;
}

export function useAgentActions({
  latitude,
  longitude,
  hasLocation,
  address,
  resultsSectionRef,
}: UseAgentActionsProps) {
  const dispatch = useAppDispatch();
  const { handleError, handleSuccess } = useErrorHandler();
  const { t } = useTranslation();

  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const selectedMenu = useAppSelector((state) => state.agent.selectedMenu);
  const menuHistoryId = useAppSelector((state) => state.agent.menuHistoryId);
  const menuRequestAddress = useAppSelector((state) => state.agent.menuRequestAddress);
  const aiRecommendationGroups = useAppSelector((state) => state.agent.aiRecommendationGroups);

  const handleMenuClick = useCallback(
    (
      menu: string,
      historyId: number,
      meta: { requestAddress: string | null } = {
        requestAddress: null,
      }
    ) => {
      dispatch(
        setSelectedMenu({
          menu,
          historyId,
          requestAddress: meta.requestAddress ?? null,
        })
      );
    },
    [dispatch]
  );

  const handleSearch = useCallback(async () => {
    if (!isAuthenticated) {
      handleError(t('toast.auth.loginRequired'), 'Agent');
      return;
    }

    if (!hasLocation || latitude === null || longitude === null) {
      handleError(t('errors.agent.noLocationData'), 'Agent');
      return;
    }

    if (!selectedMenu) {
      return;
    }

    dispatch(setShowConfirmCard(false));
    // 일반 검색 탭으로 자동 전환
    resultsSectionRef.current?.switchToTab('search');
    dispatch(setIsSearching(true));
    try {
      const result = await searchService.restaurants({
        menuName: selectedMenu,
        latitude,
        longitude,
        includeRoadAddress: false,
      });
      dispatch(setRestaurants(result.restaurants));
    } catch (error) {
      handleError(error, 'Agent');
    } finally {
      dispatch(setIsSearching(false));
    }
  }, [
    isAuthenticated,
    hasLocation,
    latitude,
    longitude,
    selectedMenu,
    dispatch,
    resultsSectionRef,
    handleError,
    t,
  ]);

  const handleCancel = useCallback(() => {
    dispatch(setShowConfirmCard(false));
  }, [dispatch]);

  const loadStoredAiRecommendations = useCallback(
    async (
      historyId: number,
      menuName: string,
      { silent }: { silent?: boolean } = {}
    ) => {
      try {
        const response = await menuService.getPlaceRecommendationsByHistoryId(historyId);
        const normalized = (response.places || [])
          .filter((place) => place.menuName === menuName)
          .map((place) => ({
            placeId: place.placeId.replace(/^places\//i, ''),
            name: place.name ?? '이름 없는 가게',
            reason: place.reason ?? '',
            menuName: place.menuName,
          }));

        dispatch(upsertAiRecommendations({ menuName, recommendations: normalized }));
        dispatch(setSelectedPlace(null));

        if (!silent) {
          if (normalized.length === 0) {
            handleError(t('errors.agent.savedResultNotFound'), 'Agent');
          } else {
            handleSuccess('toast.ai.showingSavedRecommendation');
          }
        }
      } catch (historyError) {
        if (!silent) {
          handleError(historyError, 'Agent');
        }
      }
    },
    [dispatch, handleError, handleSuccess, t]
  );

  const handleAiRecommendation = useCallback(async () => {
    if (!isAuthenticated) {
      handleError(t('toast.auth.loginRequired'), 'Agent');
      return;
    }

    if (!selectedMenu || menuHistoryId === null) {
      return;
    }

    const alreadyRecommended = aiRecommendationGroups.find(
      (group) => group.menuName === selectedMenu && group.recommendations.length > 0
    );
    if (alreadyRecommended) {
      dispatch(setShowConfirmCard(false));
      // 이미 추천받은 메뉴도 AI 탭으로 전환
      resultsSectionRef.current?.switchToTab('ai');
      handleSuccess('toast.ai.showingSavedRecommendation');
      return;
    }

    // 주소 우선순위: 현재 주소 > 요청에 저장된 주소 > 좌표
    const normalizedAddress = address?.trim() || menuRequestAddress?.trim();
    const locationFallback = latitude !== null && longitude !== null
      ? `${latitude},${longitude}`
      : null;
    const queryBase = normalizedAddress || locationFallback;

    if (!queryBase) {
      handleError(t('errors.agent.locationRequired'), 'Agent');
      return;
    }

    const query = `${queryBase} ${selectedMenu}`.trim();

    dispatch(setShowConfirmCard(false));
    // AI 추천 탭으로 자동 전환
    resultsSectionRef.current?.switchToTab('ai');
    dispatch(setAiLoading({ isLoading: true, menuName: selectedMenu }));

    try {
      const response = await menuService.recommendPlaces({
        query,
        historyId: menuHistoryId,
        menuName: selectedMenu,
      });
      const normalized = (response.recommendations || []).map((item) => ({
        ...item,
        placeId: item.placeId.replace(/^places\//i, ''),
        menuName: selectedMenu,
      }));

      dispatch(upsertAiRecommendations({ menuName: selectedMenu, recommendations: normalized }));
      if (normalized.length === 0) {
        handleError(t('errors.agent.noAiResults'), 'Agent');
      }
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 400 && menuHistoryId !== null) {
        await loadStoredAiRecommendations(menuHistoryId, selectedMenu);
      } else {
        handleError(error, 'Agent');
      }
    } finally {
      dispatch(setAiLoading({ isLoading: false, menuName: null }));
    }
  }, [
    isAuthenticated,
    selectedMenu,
    menuHistoryId,
    aiRecommendationGroups,
    address,
    menuRequestAddress,
    latitude,
    longitude,
    dispatch,
    resultsSectionRef,
    handleError,
    handleSuccess,
    loadStoredAiRecommendations,
    t,
  ]);

  return {
    handleMenuClick,
    handleSearch,
    handleCancel,
    handleAiRecommendation,
  };
}
