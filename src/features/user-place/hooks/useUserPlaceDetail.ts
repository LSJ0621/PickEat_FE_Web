/**
 * User Place 상세 조회 Custom Hook
 */

import { userPlaceService } from '@features/user-place/api';
import { useErrorHandler } from '@shared/hooks/useErrorHandler';
import type { UserPlace } from '@features/user-place/types';
import { useCallback, useEffect, useState } from 'react';

export const useUserPlaceDetail = (id: number | null) => {
  const { handleError } = useErrorHandler();
  const [place, setPlace] = useState<UserPlace | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 상세 조회
  const loadPlace = useCallback(async () => {
    if (!id) {
      setPlace(null);
      return;
    }

    setIsLoading(true);
    try {
      const result = await userPlaceService.getUserPlace(id);
      setPlace(result);
    } catch (error: unknown) {
      handleError(error, 'useUserPlaceDetail');
      setPlace(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, handleError]);

  // id 변경 시 재로드
  useEffect(() => {
    void loadPlace();
  }, [loadPlace]);

  // 수동 재로드
  const refetch = useCallback(() => {
    void loadPlace();
  }, [loadPlace]);

  return {
    place,
    isLoading,
    refetch,
  };
};
