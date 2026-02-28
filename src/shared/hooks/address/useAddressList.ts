/**
 * 주소 리스트 관리 Custom Hook
 * 주소 리스트 조회, 기본 주소 설정, 삭제 등의 로직을 관리합니다.
 */

import { userService } from '@features/user/api';
import { useErrorHandler } from '@shared/hooks/useErrorHandler';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import { updateUser } from '@app/store/slices/authSlice';
import { fetchAddresses, invalidateAddresses } from '@app/store/slices/userDataSlice';
import type { UserAddress } from '@features/user/types';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const useAddressList = () => {
  const dispatch = useAppDispatch();
  const { handleError, handleSuccess } = useErrorHandler();
  const { t } = useTranslation();

  // Redux에서 주소 리스트 가져오기
  const { list: addresses, defaultAddress, isLoading: isLoadingAddresses } = useAppSelector(
    (state) => state.userData.addresses
  );

  // UI 전용 로컬 상태
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<number[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmDefaultAddress, setConfirmDefaultAddress] = useState<UserAddress | null>(null);
  const [confirmDeleteIds, setConfirmDeleteIds] = useState<number[] | null>(null);

  // 주소 리스트 로드 (Redux thunk 사용)
  const loadAddresses = useCallback(async () => {
    await dispatch(fetchAddresses());
  }, [dispatch]);

  // 기본 주소 설정
  const handleSetDefaultAddress = useCallback(async (id: number) => {
    try {
      const updatedAddress = await userService.setDefaultAddress(id);

      // 응답값으로 Redux auth 업데이트
      const latitudeValue = updatedAddress.latitude !== null && !Number.isNaN(updatedAddress.latitude)
        ? updatedAddress.latitude
        : null;
      const longitudeValue = updatedAddress.longitude !== null && !Number.isNaN(updatedAddress.longitude)
        ? updatedAddress.longitude
        : null;

      dispatch(
        updateUser({
          address: updatedAddress.roadAddress,
          latitude: latitudeValue,
          longitude: longitudeValue,
        })
      );

      // Redux 캐시 무효화 후 재로드
      dispatch(invalidateAddresses());
      await loadAddresses();
      handleSuccess('toast.address.defaultChanged');
    } catch (error: unknown) {
      handleError(error, 'useAddressList');
    }
  }, [dispatch, loadAddresses, handleError, handleSuccess]);

  // 주소 클릭 시 기본주소 변경 확인
  const handleAddressClick = useCallback((address: UserAddress) => {
    if (address.isDefault) {
      return; // 기본주소는 클릭 불가
    }
    setConfirmDefaultAddress(address);
  }, []);

  // 기본주소 변경 확인 후 처리
  const handleConfirmSetDefault = useCallback(async () => {
    if (!confirmDefaultAddress) return;
    await handleSetDefaultAddress(confirmDefaultAddress.id);
    setConfirmDefaultAddress(null);
  }, [confirmDefaultAddress, handleSetDefaultAddress]);

  // 주소 삭제 (배열로 여러 개 삭제) - 확인 다이얼로그 표시용
  const handleDeleteAddresses = useCallback((ids: number[]) => {
    if (ids.length === 0) {
      handleError(t('errors.address.selectToDelete'), 'useAddressList');
      return;
    }

    // 기본주소가 포함되어 있는지 확인
    const hasDefaultAddress = ids.some((id) => {
      const addr = addresses.find((a) => a.id === id);
      return addr?.isDefault;
    });

    if (hasDefaultAddress) {
      handleError(t('errors.address.cannotDeleteDefault'), 'useAddressList');
      return;
    }

    setConfirmDeleteIds(ids);
  }, [addresses, handleError, t]);

  // 실제 삭제 수행 (ConfirmDialog 확인 후)
  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDeleteIds) return;

    try {
      await userService.deleteAddresses(confirmDeleteIds);
      // Redux 캐시 무효화 후 재로드
      dispatch(invalidateAddresses());
      await loadAddresses();
      setSelectedDeleteIds([]);
      setConfirmDeleteIds(null);
      handleSuccess('toast.address.deleted', { count: confirmDeleteIds.length });
    } catch (error: unknown) {
      handleError(error, 'useAddressList');
    }
  }, [confirmDeleteIds, dispatch, loadAddresses, handleError, handleSuccess]);

  // 삭제 취소
  const handleCancelDelete = useCallback(() => {
    setConfirmDeleteIds(null);
  }, []);

  // 주소 삭제 선택 토글
  const handleToggleDeleteSelection = useCallback((id: number) => {
    if (selectedDeleteIds.includes(id)) {
      setSelectedDeleteIds(selectedDeleteIds.filter((selectedId) => selectedId !== id));
    } else {
      // 기본주소는 선택할 수 없음
      const addr = addresses.find((a) => a.id === id);
      if (addr?.isDefault) {
        handleError(t('errors.address.cannotDeleteDefaultShort'), 'useAddressList');
        return;
      }
      // 최대 3개까지 선택 가능
      if (selectedDeleteIds.length >= 3) {
        handleError(t('errors.address.maxDeleteLimit'), 'useAddressList');
        return;
      }
      setSelectedDeleteIds([...selectedDeleteIds, id]);
    }
  }, [selectedDeleteIds, addresses, handleError, t]);

  // 편집 상태 초기화
  const resetEditState = useCallback(() => {
    setSelectedDeleteIds([]);
    setIsEditMode(false);
    setConfirmDefaultAddress(null);
  }, []);

  // 편집 모드 토글
  const toggleEditMode = useCallback(() => {
    if (isEditMode) {
      resetEditState();
    } else {
      setIsEditMode(true);
    }
  }, [isEditMode, resetEditState]);

  // 기본주소 변경 취소
  const handleCancelSetDefault = useCallback(() => {
    setConfirmDefaultAddress(null);
  }, []);

  return {
    // 상태
    addresses,
    defaultAddress,
    isLoadingAddresses,
    selectedDeleteIds,
    isEditMode,
    confirmDefaultAddress,
    confirmDeleteIds,
    // 상태 설정 함수
    setIsEditMode,
    setConfirmDefaultAddress,
    // 함수
    loadAddresses,
    handleSetDefaultAddress,
    handleAddressClick,
    handleConfirmSetDefault,
    handleCancelSetDefault,
    handleDeleteAddresses,
    handleConfirmDelete,
    handleCancelDelete,
    handleToggleDeleteSelection,
    resetEditState,
    toggleEditMode,
  };
};

