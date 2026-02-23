/**
 * 주소 검색 관련 Custom Hook
 * 주소 검색 및 선택 로직을 관리합니다.
 */

import { userService } from '@features/user/api';
import { useErrorHandler } from '@shared/hooks/useErrorHandler';
import type { AddressSearchResult, SelectedAddress } from '@features/user/types';
import type { Language } from '@shared/types/common';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface UseAddressSearchReturn {
  addressQuery: string;
  searchResults: AddressSearchResult[];
  isSearching: boolean;
  hasSearchedAddress: boolean;
  selectedAddress: SelectedAddress | null;
  setAddressQuery: (query: string) => void;
  handleSearch: () => Promise<void>;
  handleSelectAddress: (address: AddressSearchResult) => SelectedAddress;
  clearSearch: () => void;
  setSelectedAddress: (address: SelectedAddress | null) => void;
}

export const useAddressSearch = (): UseAddressSearchReturn => {
  const [addressQuery, setAddressQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AddressSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearchedAddress, setHasSearchedAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const { handleError } = useErrorHandler();
  const { i18n } = useTranslation();

  // 주소 검색
  const handleSearch = useCallback(async () => {
    if (!addressQuery.trim()) {
      return;
    }

    setIsSearching(true);
    setHasSearchedAddress(false);
    try {
      // i18n.language를 Language 타입으로 변환 (기본값: 'ko')
      const language: Language = (i18n.language === 'en' ? 'en' : 'ko');
      const result = await userService.searchAddress(addressQuery, language);
      setSearchResults(result.addresses);
      setHasSearchedAddress(true);
    } catch (error: unknown) {
      handleError(error, 'useAddressSearch');
    } finally {
      setIsSearching(false);
    }
  }, [addressQuery, i18n.language, handleError]);

  // 주소 선택
  const handleSelectAddress = useCallback((address: AddressSearchResult): SelectedAddress => {
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
    return selected;
  }, []);

  // 검색 초기화
  const clearSearch = useCallback(() => {
    setAddressQuery('');
    setSearchResults([]);
    setHasSearchedAddress(false);
  }, []);

  return {
    addressQuery,
    searchResults,
    isSearching,
    hasSearchedAddress,
    selectedAddress,
    setAddressQuery,
    handleSearch,
    handleSelectAddress,
    clearSearch,
    setSelectedAddress,
  };
};

