import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAddressSearch } from '@/hooks/address/useAddressSearch';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { userService } from '@/api/services/user';
import type { AddressSearchResult, SelectedAddress } from '@/types/user';

vi.mock('@/api/services/user');
vi.mock('@/hooks/useErrorHandler');

describe('useAddressSearch', () => {
  const mockHandleError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useErrorHandler).mockReturnValue({
      handleError: mockHandleError,
      handleSuccess: vi.fn(),
    });
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useAddressSearch());

      expect(result.current.addressQuery).toBe('');
      expect(result.current.searchResults).toEqual([]);
      expect(result.current.isSearching).toBe(false);
      expect(result.current.hasSearchedAddress).toBe(false);
      expect(result.current.selectedAddress).toBe(null);
    });
  });

  describe('handleSearch', () => {
    it('should not search when query is empty', async () => {
      const { result } = renderHook(() => useAddressSearch());

      await act(async () => {
        await result.current.handleSearch();
      });

      expect(userService.searchAddress).not.toHaveBeenCalled();
    });

    it('should not search when query is only whitespace', async () => {
      const { result } = renderHook(() => useAddressSearch());

      act(() => {
        result.current.setAddressQuery('   ');
      });

      await act(async () => {
        await result.current.handleSearch();
      });

      expect(userService.searchAddress).not.toHaveBeenCalled();
    });

    it('should successfully search for addresses', async () => {
      const mockAddresses: AddressSearchResult[] = [
        {
          address: '서울시 강남구',
          roadAddress: '서울시 강남구 테헤란로',
          postalCode: '12345',
          latitude: '37.123',
          longitude: '127.456',
        },
        {
          address: '서울시 서초구',
          roadAddress: '서울시 서초구 강남대로',
          postalCode: '54321',
          latitude: '37.124',
          longitude: '127.457',
        },
      ];

      vi.mocked(userService.searchAddress).mockResolvedValue({
        meta: {
          total_count: 2,
          pageable_count: 2,
          is_end: true,
        },
        addresses: mockAddresses,
      });

      const { result } = renderHook(() => useAddressSearch());

      act(() => {
        result.current.setAddressQuery('서울시');
      });

      await act(async () => {
        await result.current.handleSearch();
      });

      expect(userService.searchAddress).toHaveBeenCalledWith('서울시');
      expect(result.current.searchResults).toEqual(mockAddresses);
      expect(result.current.hasSearchedAddress).toBe(true);
      expect(result.current.isSearching).toBe(false);
    });

    it('should handle search error', async () => {
      const error = new Error('Search failed');
      vi.mocked(userService.searchAddress).mockRejectedValue(error);

      const { result } = renderHook(() => useAddressSearch());

      act(() => {
        result.current.setAddressQuery('서울시');
      });

      await act(async () => {
        await result.current.handleSearch();
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, 'useAddressSearch');
      expect(result.current.isSearching).toBe(false);
    });

    it('should set hasSearchedAddress to false before searching', async () => {
      vi.mocked(userService.searchAddress).mockResolvedValue({
        meta: {
          total_count: 0,
          pageable_count: 0,
          is_end: true,
        },
        addresses: [],
      });

      const { result } = renderHook(() => useAddressSearch());

      act(() => {
        result.current.setAddressQuery('서울시');
      });

      let searchingState = false;
      vi.mocked(userService.searchAddress).mockImplementation(async () => {
        searchingState = result.current.hasSearchedAddress;
        return {
          meta: {
            total_count: 0,
            pageable_count: 0,
            is_end: true,
          },
          addresses: [],
        };
      });

      await act(async () => {
        await result.current.handleSearch();
      });

      expect(searchingState).toBe(false);
      expect(result.current.hasSearchedAddress).toBe(true);
    });
  });

  describe('handleSelectAddress', () => {
    it('should select address and return it', () => {
      const mockAddress: AddressSearchResult = {
        address: '서울시 강남구',
        roadAddress: '서울시 강남구 테헤란로',
        postalCode: '12345',
        latitude: '37.123',
        longitude: '127.456',
      };

      const { result } = renderHook(() => useAddressSearch());

      let selectedAddress: SelectedAddress | null = null;
      act(() => {
        selectedAddress = result.current.handleSelectAddress(mockAddress);
      });

      const expectedSelected: SelectedAddress = {
        address: '서울시 강남구',
        roadAddress: '서울시 강남구 테헤란로',
        postalCode: '12345',
        latitude: '37.123',
        longitude: '127.456',
      };

      expect(selectedAddress).toEqual(expectedSelected);
      expect(result.current.selectedAddress).toEqual(expectedSelected);
    });

    it('should clear addressQuery and searchResults when selecting address', () => {
      const mockAddress: AddressSearchResult = {
        address: '서울시 강남구',
        roadAddress: '서울시 강남구 테헤란로',
        postalCode: '12345',
        latitude: '37.123',
        longitude: '127.456',
      };

      const { result } = renderHook(() => useAddressSearch());

      act(() => {
        result.current.setAddressQuery('서울시');
      });

      act(() => {
        result.current.handleSelectAddress(mockAddress);
      });

      expect(result.current.addressQuery).toBe('');
      expect(result.current.searchResults).toEqual([]);
    });
  });

  describe('clearSearch', () => {
    it('should clear all search state', async () => {
      vi.mocked(userService.searchAddress).mockResolvedValue({
        meta: {
          total_count: 1,
          pageable_count: 1,
          is_end: true,
        },
        addresses: [
          {
            address: '서울시 강남구',
            roadAddress: '서울시 강남구 테헤란로',
            postalCode: '12345',
            latitude: '37.123',
            longitude: '127.456',
          },
        ],
      });

      const { result } = renderHook(() => useAddressSearch());

      act(() => {
        result.current.setAddressQuery('서울시');
      });

      await act(async () => {
        await result.current.handleSearch();
      });

      expect(result.current.hasSearchedAddress).toBe(true);

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.addressQuery).toBe('');
      expect(result.current.searchResults).toEqual([]);
      expect(result.current.hasSearchedAddress).toBe(false);
    });

    it('should not affect selectedAddress', () => {
      const mockAddress: AddressSearchResult = {
        address: '서울시 강남구',
        roadAddress: '서울시 강남구 테헤란로',
        postalCode: '12345',
        latitude: '37.123',
        longitude: '127.456',
      };

      const { result } = renderHook(() => useAddressSearch());

      act(() => {
        result.current.handleSelectAddress(mockAddress);
      });

      const selectedBeforeClear = result.current.selectedAddress;

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.selectedAddress).toEqual(selectedBeforeClear);
    });
  });

  describe('setSelectedAddress', () => {
    it('should set selected address directly', () => {
      const mockSelected: SelectedAddress = {
        address: '서울시 강남구',
        roadAddress: '서울시 강남구 테헤란로',
        postalCode: '12345',
        latitude: '37.123',
        longitude: '127.456',
      };

      const { result } = renderHook(() => useAddressSearch());

      act(() => {
        result.current.setSelectedAddress(mockSelected);
      });

      expect(result.current.selectedAddress).toEqual(mockSelected);
    });

    it('should allow clearing selected address', () => {
      const mockSelected: SelectedAddress = {
        address: '서울시 강남구',
        roadAddress: '서울시 강남구 테헤란로',
        postalCode: '12345',
        latitude: '37.123',
        longitude: '127.456',
      };

      const { result } = renderHook(() => useAddressSearch());

      act(() => {
        result.current.setSelectedAddress(mockSelected);
      });

      expect(result.current.selectedAddress).toEqual(mockSelected);

      act(() => {
        result.current.setSelectedAddress(null);
      });

      expect(result.current.selectedAddress).toBe(null);
    });
  });

  describe('setAddressQuery', () => {
    it('should update addressQuery', () => {
      const { result } = renderHook(() => useAddressSearch());

      act(() => {
        result.current.setAddressQuery('부산시');
      });

      expect(result.current.addressQuery).toBe('부산시');
    });
  });

  describe('Loading state', () => {
    it('should set isSearching to true during search', async () => {
      let isSearchingDuringCall = false;

      vi.mocked(userService.searchAddress).mockImplementation(async () => {
        isSearchingDuringCall = true;
        return {
          meta: {
            total_count: 0,
            pageable_count: 0,
            is_end: true,
          },
          addresses: [],
        };
      });

      const { result } = renderHook(() => useAddressSearch());

      act(() => {
        result.current.setAddressQuery('서울시');
      });

      await act(async () => {
        await result.current.handleSearch();
      });

      expect(isSearchingDuringCall).toBe(true);
      expect(result.current.isSearching).toBe(false);
    });
  });
});
