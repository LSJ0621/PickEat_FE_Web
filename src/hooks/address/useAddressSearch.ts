/**
 * 주소 검색 관련 Custom Hook
 * 주소 검색 및 선택 로직을 관리합니다.
 */

import { userService } from '@/api/services/user';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import type { AddressSearchResult, SelectedAddress } from '@/types/user';
import { useCallback, useState } from 'react';

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
      handleError(error, 'useAddressSearch');
    } finally {
      setIsSearching(false);
    }
  }, [addressQuery, handleError]);

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

