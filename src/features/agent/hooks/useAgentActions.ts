import { menuService } from '@features/agent/api';
import { useErrorHandler } from '@shared/hooks/useErrorHandler';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import {
  setSelectedMenu,
  setSelectedPlace,
  setShowConfirmCard,
  upsertSearchAiRecommendations,
  upsertCommunityAiRecommendations,
  setSearchAiLoading,
  setCommunityAiLoading,
  setSearchAiRetrying,
  setCommunityAiRetrying,
} from '@app/store/slices/agentSlice';
import type { PlaceRecommendationResponse } from '@features/agent/types';
import { extractErrorMessage } from '@shared/utils/error';
import { isAxiosError } from 'axios';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface UseAgentActionsProps {
  latitude: number | null;
  longitude: number | null;
}

export function useAgentActions({
  latitude,
  longitude,
}: UseAgentActionsProps) {
  const dispatch = useAppDispatch();
  const { handleError, handleSuccess } = useErrorHandler();
  const { t } = useTranslation();

  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const selectedMenu = useAppSelector((state) => state.agent.selectedMenu);
  const menuHistoryId = useAppSelector((state) => state.agent.menuHistoryId);
  const searchAiRecommendationGroups = useAppSelector((state) => state.agent.searchAiRecommendationGroups);

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
          .filter((place) => place.placeId != null)
          .map((place) => ({
            placeId: place.placeId!.replace(/^places\//i, ''),
            name: place.name ?? '이름 없는 가게',
            reason: place.reason ?? '',
            menuName: place.menuName,
          }));

        dispatch(upsertSearchAiRecommendations({ menuName, recommendations: normalized }));
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

    const alreadyRecommended = searchAiRecommendationGroups.find(
      (group) => group.menuName === selectedMenu && group.recommendations.length > 0
    );
    if (alreadyRecommended) {
      dispatch(setShowConfirmCard(false));
      handleSuccess('toast.ai.showingSavedRecommendation');
      return;
    }

    // Validate that coordinates are available
    if (latitude === null || longitude === null) {
      handleError(t('errors.agent.locationRequired'), 'Agent');
      return;
    }

    dispatch(setShowConfirmCard(false));

    // Fire search API call independently with SSE streaming
    dispatch(setSearchAiLoading({ isLoading: true, menuName: selectedMenu }));
    dispatch(setSearchAiRetrying(false));
    menuService.recommendSearchPlacesStream(
      {
        latitude: latitude!,
        longitude: longitude!,
        menuName: selectedMenu,
        menuRecommendationId: menuHistoryId,
      },
      {
        onEvent: (event) => {
          if (event.type === 'retrying') {
            dispatch(setSearchAiRetrying(true));
          } else if (event.type === 'status') {
            dispatch(setSearchAiRetrying(false));
          } else if (event.type === 'result' && event.data) {
            const response = event.data as PlaceRecommendationResponse;
            const normalized = (response.recommendations || [])
              .filter((item) => item.placeId != null)
              .map((item) => ({
                ...item,
                placeId: item.placeId!.replace(/^places\//i, ''),
                menuName: selectedMenu,
              }));
            dispatch(upsertSearchAiRecommendations({ menuName: selectedMenu, recommendations: normalized }));
            dispatch(setSearchAiRetrying(false));
          } else if (event.type === 'error') {
            dispatch(setSearchAiRetrying(false));
            handleError(event.message || 'Search places streaming error', 'Agent');
          }
        },
      }
    )
      .catch((error) => {
        if (isAxiosError(error) && error.response?.status === 400 && menuHistoryId !== null) {
          loadStoredAiRecommendations(menuHistoryId, selectedMenu, { silent: true });
        } else {
          const errorMessage = extractErrorMessage(error, 'Search places streaming failed');
          handleError(errorMessage, 'Agent');
        }
      })
      .finally(() => {
        dispatch(setSearchAiLoading({ isLoading: false, menuName: null }));
        dispatch(setSearchAiRetrying(false));
      });

    // Fire community API call independently with SSE streaming (runs in parallel)
    dispatch(setCommunityAiLoading({ isLoading: true, menuName: selectedMenu }));
    dispatch(setCommunityAiRetrying(false));
    menuService.recommendCommunityPlacesStream(
      {
        latitude: latitude!,
        longitude: longitude!,
        menuName: selectedMenu,
        menuRecommendationId: menuHistoryId,
      },
      {
        onEvent: (event) => {
          if (event.type === 'retrying') {
            dispatch(setCommunityAiRetrying(true));
          } else if (event.type === 'status') {
            dispatch(setCommunityAiRetrying(false));
          } else if (event.type === 'result' && event.data) {
            const response = event.data as PlaceRecommendationResponse;
            const normalized = (response.recommendations || [])
              .filter((item) => item.placeId != null)
              .map((item) => ({
                ...item,
                placeId: item.placeId!.replace(/^places\//i, ''),
                menuName: selectedMenu,
              }));
            dispatch(upsertCommunityAiRecommendations({ menuName: selectedMenu, recommendations: normalized }));
            dispatch(setCommunityAiRetrying(false));
          } else if (event.type === 'error') {
            dispatch(setCommunityAiRetrying(false));
            handleError(event.message || 'Community places streaming error', 'Agent');
          }
        },
      }
    )
      .catch((error) => {
        const errorMessage = extractErrorMessage(error, 'Community places streaming failed');
        handleError(errorMessage, 'Agent');
      })
      .finally(() => {
        dispatch(setCommunityAiLoading({ isLoading: false, menuName: null }));
        dispatch(setCommunityAiRetrying(false));
      });
  }, [
    isAuthenticated,
    selectedMenu,
    menuHistoryId,
    searchAiRecommendationGroups,
    latitude,
    longitude,
    dispatch,
    handleError,
    handleSuccess,
    loadStoredAiRecommendations,
    t,
  ]);

  return {
    handleMenuClick,
    handleCancel,
    handleAiRecommendation,
  };
}
