import { menuService } from '@features/agent/api';
import { useErrorHandler } from '@shared/hooks/useErrorHandler';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import {
  setSelectedMenu,
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
import { useCallback, useEffect, useRef } from 'react';
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

  const searchAbortRef = useRef<AbortController | null>(null);
  const communityAbortRef = useRef<AbortController | null>(null);
  const abortedByVisibilityRef = useRef(false);

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

    // Create new AbortControllers for this recommendation request
    const searchAbort = new AbortController();
    searchAbortRef.current = searchAbort;

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
            handleError(t('errors.agent.recommendationFailed'), 'Agent');
          }
        },
      },
      searchAbort.signal
    )
      .catch((error) => {
        // Ignore AbortError (caused by visibility change)
        if (error instanceof DOMException && error.name === 'AbortError') return;
        const errorMessage = extractErrorMessage(error, t('errors.agent.recommendationFailed'));
        handleError(errorMessage, 'Agent');
      })
      .finally(() => {
        dispatch(setSearchAiLoading({ isLoading: false, menuName: null }));
        dispatch(setSearchAiRetrying(false));
      });

    // Fire community API call independently with SSE streaming (runs in parallel)
    dispatch(setCommunityAiLoading({ isLoading: true, menuName: selectedMenu }));
    dispatch(setCommunityAiRetrying(false));

    const communityAbort = new AbortController();
    communityAbortRef.current = communityAbort;

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
            handleError(t('errors.agent.recommendationFailed'), 'Agent');
          }
        },
      },
      communityAbort.signal
    )
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        const errorMessage = extractErrorMessage(error, t('errors.agent.recommendationFailed'));
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
    t,
  ]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Set flag before abort so .finally() doesn't race with visibility handler
        if (searchAbortRef.current || communityAbortRef.current) {
          abortedByVisibilityRef.current = true;
        }
        searchAbortRef.current?.abort();
        communityAbortRef.current?.abort();
      } else if (document.visibilityState === 'visible') {
        if (abortedByVisibilityRef.current) {
          abortedByVisibilityRef.current = false;
          dispatch(setSearchAiLoading({ isLoading: false, menuName: null }));
          dispatch(setSearchAiRetrying(false));
          dispatch(setCommunityAiLoading({ isLoading: false, menuName: null }));
          dispatch(setCommunityAiRetrying(false));
          handleError(t('errors.agent.connectionLostByAppSwitch'), 'Agent');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [dispatch, t, handleError]);

  return {
    handleMenuClick,
    handleCancel,
    handleAiRecommendation,
  };
}
