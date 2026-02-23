/**
 * User Place 수정/삭제 Custom Hook
 */

import { userPlaceService } from '@features/user-place/api';
import { useErrorHandler } from '@shared/hooks/useErrorHandler';
import type { UpdateUserPlaceRequest } from '@features/user-place/types';
import { useCallback, useState } from 'react';

export const useUserPlaceActions = () => {
  const { handleError, handleSuccess } = useErrorHandler();
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  // 수정 실행
  const updatePlace = useCallback(
    async (id: number, data: UpdateUserPlaceRequest) => {
      setIsUpdateLoading(true);
      try {
        await userPlaceService.updateUserPlace(id, data);
        handleSuccess('userPlace.updateSuccess');
      } catch (error: unknown) {
        handleError(error, 'useUserPlaceActions');
        throw error;
      } finally {
        setIsUpdateLoading(false);
      }
    },
    [handleError, handleSuccess]
  );

  // 삭제 실행
  const deletePlace = useCallback(
    async (id: number) => {
      setIsDeleteLoading(true);
      try {
        await userPlaceService.deleteUserPlace(id);
        handleSuccess('userPlace.deleteSuccess');
      } catch (error: unknown) {
        handleError(error, 'useUserPlaceActions');
        throw error;
      } finally {
        setIsDeleteLoading(false);
      }
    },
    [handleError, handleSuccess]
  );

  return {
    // 상태
    isUpdateLoading,
    isDeleteLoading,
    // 함수
    updatePlace,
    deletePlace,
  };
};
