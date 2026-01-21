/**
 * 주소 추가/수정 모달 관리 Custom Hook
 * 주소 검색, 선택, 추가 등의 로직을 관리합니다.
 */

import { userService } from '@/api/services/user';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import type { AddressSearchResult, SelectedAddress } from '@/types/user';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface UseAddressModalOptions {
  addressesCount: number;
  onAddressAdded?: () => Promise<void>;
}

export const useAddressModal = (options?: UseAddressModalOptions) => {
  const { addressesCount = 0, onAddressAdded } = options || {};
  const { handleError, handleSuccess } = useErrorHandler();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  // 주소 추가/수정 모달 관련 상태
  const [addressQuery, setAddressQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AddressSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [addressAlias, setAddressAlias] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasSearchedAddress, setHasSearchedAddress] = useState(false);

  // 주소 검색
  const handleSearch = useCallback(async () => {
    if (!addressQuery.trim()) {
      return;
    }

    setIsSearching(true);
    setHasSearchedAddress(false);
    try {
      const result = await userService.searchAddress(addressQuery);
      setSearchResults(result.addresses);
      setHasSearchedAddress(true);
    } catch (error: unknown) {
      handleError(error, 'useAddressModal');
    } finally {
      setIsSearching(false);
    }
  }, [addressQuery, handleError]);

  // 주소 선택
  const handleSelectAddress = useCallback((address: AddressSearchResult) => {
    const selected: SelectedAddress = {
      address: address.address,
      roadAddress: address.roadAddress,
      postalCode: address.postalCode,
      latitude: address.latitude,
      longitude: address.longitude,
    };
    setSelectedAddress(selected);
    setAddressQuery('');
    setSearchResults([]);
  }, []);

  // 주소 추가
  const handleAddAddress = useCallback(async (): Promise<boolean> => {
    if (!selectedAddress) {
      handleError(t('errors.address.selectAddress'), 'useAddressModal');
      return false;
    }

    // 최대 4개 제한 확인
    if (addressesCount >= 4) {
      handleError(t('errors.address.maxAddressLimit'), 'useAddressModal');
      return false;
    }

    setIsSaving(true);
    try {
      const createdAddress = await userService.createAddress({
        selectedAddress,
        alias: addressAlias.trim() || undefined,
      });

      // Update Redux when first address is registered (becomes default)
      if (addressesCount === 0 && createdAddress.isDefault) {
        dispatch(
          updateUser({
            address: createdAddress.roadAddress,
            latitude: createdAddress.latitude,
            longitude: createdAddress.longitude,
          })
        );
      }

      // 주소 추가 후 리스트 새로고침 (콜백이 있으면 사용)
      if (onAddressAdded) {
        await onAddressAdded();
      }

      setAddressQuery('');
      setSearchResults([]);
      setSelectedAddress(null);
      setAddressAlias('');
      setHasSearchedAddress(false);
      handleSuccess('toast.address.added');
      return true; // 성공 시 true 반환
    } catch (error: unknown) {
      handleError(error, 'useAddressModal');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [selectedAddress, addressAlias, addressesCount, onAddressAdded, handleError, handleSuccess, dispatch, t]);

  // 주소 추가 모달 초기화
  const resetAddressModal = useCallback(() => {
    setAddressQuery('');
    setSearchResults([]);
    setSelectedAddress(null);
    setAddressAlias('');
    setHasSearchedAddress(false);
  }, []);

  return {
    // 상태
    addressQuery,
    searchResults,
    isSearching,
    selectedAddress,
    addressAlias,
    isSaving,
    hasSearchedAddress,
    // 상태 설정 함수
    setAddressQuery,
    setSelectedAddress,
    setAddressAlias,
    // 함수
    handleSearch,
    handleSelectAddress,
    handleAddAddress,
    resetAddressModal,
  };
};

