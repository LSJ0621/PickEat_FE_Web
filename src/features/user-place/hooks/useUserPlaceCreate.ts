/**
 * User Place 등록 Custom Hook
 * 등록 전 확인 및 실제 등록 로직을 관리합니다.
 */

import { userPlaceService } from '@features/user-place/api';
import { useErrorHandler } from '@shared/hooks/useErrorHandler';
import type {
  CheckRegistrationRequest,
  CheckRegistrationResponse,
  CreateUserPlaceRequest,
} from '@features/user-place/types';
import { useCallback, useState } from 'react';

export const useUserPlaceCreate = () => {
  const { handleError, handleSuccess } = useErrorHandler();
  const [checkResult, setCheckResult] = useState<CheckRegistrationResponse | null>(null);
  const [isCheckLoading, setIsCheckLoading] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  // 등록 전 확인 실행
  const checkRegistration = useCallback(
    async (data: CheckRegistrationRequest) => {
      setIsCheckLoading(true);
      try {
        const result = await userPlaceService.checkRegistration(data);
        setCheckResult(result);
      } catch (error: unknown) {
        handleError(error, 'useUserPlaceCreate');
      } finally {
        setIsCheckLoading(false);
      }
    },
    [handleError]
  );

  // 가게 등록 실행
  const createPlace = useCallback(
    async (data: CreateUserPlaceRequest) => {
      setIsCreateLoading(true);
      try {
        const result = await userPlaceService.createUserPlace(data);
        handleSuccess('userPlace.createSuccess');
        setCheckResult(null);
        return result;
      } catch (error: unknown) {
        handleError(error, 'useUserPlaceCreate');
        throw error;
      } finally {
        setIsCreateLoading(false);
      }
    },
    [handleError, handleSuccess]
  );

  // 확인 결과 초기화
  const resetCheck = useCallback(() => {
    setCheckResult(null);
  }, []);

  return {
    // 상태
    checkResult,
    isCheckLoading,
    isCreateLoading,
    // 함수
    checkRegistration,
    createPlace,
    resetCheck,
  };
};
