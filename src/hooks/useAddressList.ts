/**
 * 주소 리스트 관리 Custom Hook
 * 주소 리스트 조회, 기본 주소 설정, 삭제 등의 로직을 관리합니다.
 */

import { userService } from '@/api/services/user';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import type { UserAddress } from '@/types/user';
import { extractErrorMessage } from '@/utils/error';
import { useState, useCallback } from 'react';

export const useAddressList = () => {
  const dispatch = useAppDispatch();

  // 주소 리스트 관련 상태
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<UserAddress | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<number[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmDefaultAddress, setConfirmDefaultAddress] = useState<UserAddress | null>(null);

  // 주소 리스트 로드
  const loadAddresses = useCallback(async () => {
    setIsLoadingAddresses(true);
    try {
      const [addressesResponse, defaultResponse] = await Promise.all([
        userService.getAddresses(),
        userService.getDefaultAddress(),
      ]);
      setAddresses(addressesResponse.addresses);
      setDefaultAddress(defaultResponse.address);
    } catch (error: unknown) {
      console.error('주소 리스트 조회 실패:', error);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, []);

  // 기본 주소 설정
  const handleSetDefaultAddress = useCallback(async (id: number) => {
    try {
      const updatedAddress = await userService.setDefaultAddress(id);
      
      // 응답값으로 Redux 업데이트
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
      
      await loadAddresses();
      alert('기본 주소가 변경되었습니다.');
    } catch (error: unknown) {
      console.error('기본 주소 설정 실패:', error);
      alert(extractErrorMessage(error, '기본 주소 설정에 실패했습니다.'));
    }
  }, [dispatch, loadAddresses]);

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
    
    try {
      await handleSetDefaultAddress(confirmDefaultAddress.id);
      setConfirmDefaultAddress(null);
    } catch (error) {
      // handleSetDefaultAddress에서 이미 에러 처리
    }
  }, [confirmDefaultAddress, handleSetDefaultAddress]);

  // 주소 삭제 (배열로 여러 개 삭제)
  const handleDeleteAddresses = useCallback(async (ids: number[]) => {
    if (ids.length === 0) {
      alert('삭제할 주소를 선택해주세요.');
      return;
    }

    // 기본주소가 포함되어 있는지 확인
    const hasDefaultAddress = ids.some((id) => {
      const addr = addresses.find((a) => a.id === id);
      return addr?.isDefault;
    });

    if (hasDefaultAddress) {
      alert('기본주소는 삭제할 수 없습니다. 기본주소를 변경한 후 삭제해주세요.');
      return;
    }

    if (!confirm(`정말 ${ids.length}개의 주소를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await userService.deleteAddresses(ids);
      await loadAddresses();
      setSelectedDeleteIds([]);
      alert(`${ids.length}개의 주소가 삭제되었습니다.`);
    } catch (error: unknown) {
      console.error('주소 삭제 실패:', error);
      alert(extractErrorMessage(error, '주소 삭제에 실패했습니다.'));
    }
  }, [addresses, loadAddresses]);

  // 주소 삭제 선택 토글
  const handleToggleDeleteSelection = useCallback((id: number) => {
    if (selectedDeleteIds.includes(id)) {
      setSelectedDeleteIds(selectedDeleteIds.filter((selectedId) => selectedId !== id));
    } else {
      // 기본주소는 선택할 수 없음
      const addr = addresses.find((a) => a.id === id);
      if (addr?.isDefault) {
        alert('기본주소는 삭제할 수 없습니다.');
        return;
      }
      // 최대 3개까지 선택 가능
      if (selectedDeleteIds.length >= 3) {
        alert('최대 3개까지 삭제할 수 있습니다.');
        return;
      }
      setSelectedDeleteIds([...selectedDeleteIds, id]);
    }
  }, [selectedDeleteIds, addresses]);

  // 주소 리스트 모달 초기화
  const resetAddressListModal = useCallback(() => {
    setSelectedDeleteIds([]);
    setIsEditMode(false);
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
    // 상태 설정 함수
    setIsEditMode,
    setConfirmDefaultAddress,
    // 함수
    loadAddresses,
    handleSetDefaultAddress,
    handleAddressClick,
    handleConfirmSetDefault,
    handleDeleteAddresses,
    handleToggleDeleteSelection,
    resetAddressListModal,
  };
};

