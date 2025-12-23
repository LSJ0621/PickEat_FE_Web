/**
 * 장소 상세 정보 관련 Custom Hook
 * 장소 상세 정보 로딩 로직을 관리합니다.
 */

import { menuService } from '@/api/services/menu';
import { usePrevious } from '@/hooks/common/usePrevious';
import type { PlaceDetail } from '@/types/menu';
import { extractErrorMessage } from '@/utils/error';
import { startTransition, useEffect, useState } from 'react';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

interface UsePlaceDetailsReturn {
  status: LoadState;
  errorMessage: string | null;
  placeDetail: PlaceDetail | null;
}

/**
 * 장소 상세 정보를 로딩하는 Custom Hook
 */
export const usePlaceDetails = (placeId: string | null): UsePlaceDetailsReturn => {
  const [status, setStatus] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [placeDetail, setPlaceDetail] = useState<PlaceDetail | null>(null);
  const prevPlaceId = usePrevious(placeId);

  useEffect(() => {
    if (!placeId) {
      setPlaceDetail(null);
      setStatus('idle');
      return;
    }

    // StrictMode 대응: placeId가 변경되지 않았으면 스킵
    if (prevPlaceId === placeId) {
      return;
    }

    let cancelled = false;

    const fetchPlaceDetail = async () => {
      try {
        startTransition(() => {
          setStatus('loading');
          setErrorMessage(null);
        });

        const response = await menuService.getPlaceDetail(placeId);
        if (cancelled) return;

        startTransition(() => {
          setPlaceDetail(response.place);
          setStatus('ready');
        });
      } catch (error) {
        if (cancelled) return;
        startTransition(() => {
          setStatus('error');
          setErrorMessage(extractErrorMessage(error, '가게 상세 정보를 불러오지 못했습니다.'));
        });
      }
    };

    void fetchPlaceDetail();

    return () => {
      cancelled = true;
    };
  }, [placeId, prevPlaceId]);

  return {
    status,
    errorMessage,
    placeDetail,
  };
};

