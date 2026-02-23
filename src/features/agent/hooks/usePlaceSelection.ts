/**
 * 가게 선택 비즈니스 로직 hook
 */

import { ratingService } from '@features/rating/api';
import { useToast } from '@shared/hooks/useToast';
import { useErrorHandler } from '@shared/hooks/useErrorHandler';
import { useAppSelector } from '@app/store/hooks';
import type { PlaceRecommendationItem, PlaceRecommendationItemV2 } from '@features/agent/types';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function usePlaceSelection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const { handleError, handleSuccess } = useErrorHandler();
  const toast = useToast();
  const { t } = useTranslation();

  const searchAiRecommendationGroups = useAppSelector(
    (state) => state.agent.searchAiRecommendationGroups
  );
  const communityAiRecommendationGroups = useAppSelector(
    (state) => state.agent.communityAiRecommendationGroups
  );

  const searchPlaces = useMemo(
    () => searchAiRecommendationGroups.flatMap((g) => g.recommendations),
    [searchAiRecommendationGroups]
  );
  // Community recommendations contain V2 extended fields (rating, reviewCount) at runtime
  const communityPlaces = useMemo(
    () =>
      communityAiRecommendationGroups.flatMap(
        (g) => g.recommendations as unknown as PlaceRecommendationItemV2[]
      ),
    [communityAiRecommendationGroups]
  );

  const hasPlaces = searchPlaces.length > 0 || communityPlaces.length > 0;

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSelectPlace = useCallback(
    async (place: PlaceRecommendationItem) => {
      // Google 검색 가게는 평점 등록 차단
      if (place.source === 'GOOGLE') {
        toast.info(t('place.googlePlaceRatingNotSupported'));
        setIsModalOpen(false);
        return;
      }

      setIsSelecting(true);
      try {
        await ratingService.selectPlace({
          placeId: place.placeId,
          placeName: place.name,
        });
        handleSuccess(t('place.selectSuccess'));
        setIsModalOpen(false);
      } catch (error) {
        handleError(error, 'PlaceSelection');
      } finally {
        setIsSelecting(false);
      }
    },
    [handleError, handleSuccess, t, toast]
  );

  return {
    isModalOpen,
    openModal,
    closeModal,
    searchPlaces,
    communityPlaces,
    hasPlaces,
    handleSelectPlace,
    isSelecting,
  };
}
