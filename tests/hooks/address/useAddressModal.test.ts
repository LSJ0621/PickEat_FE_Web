import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAddressModal } from '@/hooks/address/useAddressModal';
import { userService } from '@/api/services/user';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import type { AddressSearchResult, SelectedAddress } from '@/types/user';
import { createMockUserAddress } from '@tests/factories/address';

vi.mock('@/api/services/user');
vi.mock('@/hooks/useErrorHandler');

describe('useAddressModal', () => {
  const mockHandleError = vi.fn();
  const mockHandleSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useErrorHandler).mockReturnValue({
      handleError: mockHandleError,
      handleSuccess: mockHandleSuccess,
    });
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useAddressModal());

      expect(result.current.addressQuery).toBe('');
      expect(result.current.searchResults).toEqual([]);
      expect(result.current.isSearching).toBe(false);
      expect(result.current.selectedAddress).toBe(null);
      expect(result.current.addressAlias).toBe('');
      expect(result.current.isSaving).toBe(false);
      expect(result.current.hasSearchedAddress).toBe(false);
    });
  });

  describe('handleSearch', () => {
    it('should not search when query is empty', async () => {
      const { result } = renderHook(() => useAddressModal());

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
      ];

      vi.mocked(userService.searchAddress).mockResolvedValue({
        meta: {
          total_count: 1,
          pageable_count: 1,
          is_end: true,
        },
        addresses: mockAddresses,
      });

      const { result } = renderHook(() => useAddressModal());

      act(() => {
        result.current.setAddressQuery('서울시 강남구');
      });

      await act(async () => {
        await result.current.handleSearch();
      });

      expect(userService.searchAddress).toHaveBeenCalledWith('서울시 강남구');
      expect(result.current.searchResults).toEqual(mockAddresses);
      expect(result.current.hasSearchedAddress).toBe(true);
      expect(result.current.isSearching).toBe(false);
    });

    it('should handle search error', async () => {
      const error = new Error('Search failed');
      vi.mocked(userService.searchAddress).mockRejectedValue(error);

      const { result } = renderHook(() => useAddressModal());

      act(() => {
        result.current.setAddressQuery('서울시 강남구');
      });

      await act(async () => {
        await result.current.handleSearch();
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, 'useAddressModal');
      expect(result.current.isSearching).toBe(false);
    });

    it('should trim whitespace from query', async () => {
      vi.mocked(userService.searchAddress).mockResolvedValue({
        meta: {
          total_count: 0,
          pageable_count: 0,
          is_end: true,
        },
        addresses: [],
      });

      const { result } = renderHook(() => useAddressModal());

      act(() => {
        result.current.setAddressQuery('   ');
      });

      await act(async () => {
        await result.current.handleSearch();
      });

      expect(userService.searchAddress).not.toHaveBeenCalled();
    });
  });

  describe('handleSelectAddress', () => {
    it('should select address and clear search', () => {
      const mockAddress: AddressSearchResult = {
        address: '서울시 강남구',
        roadAddress: '서울시 강남구 테헤란로',
        postalCode: '12345',
        latitude: '37.123',
        longitude: '127.456',
      };

      const { result } = renderHook(() => useAddressModal());

      act(() => {
        result.current.setAddressQuery('서울');
      });

      act(() => {
        result.current.handleSelectAddress(mockAddress);
      });

      const expectedSelected: SelectedAddress = {
        address: '서울시 강남구',
        roadAddress: '서울시 강남구 테헤란로',
        postalCode: '12345',
        latitude: '37.123',
        longitude: '127.456',
      };

      expect(result.current.selectedAddress).toEqual(expectedSelected);
      expect(result.current.addressQuery).toBe('');
      expect(result.current.searchResults).toEqual([]);
    });
  });

  describe('handleAddAddress', () => {
    it('should show error when no address is selected', async () => {
      const { result } = renderHook(() => useAddressModal());

      const success = await act(async () => {
        return await result.current.handleAddAddress();
      });

      expect(success).toBe(false);
      expect(mockHandleError).toHaveBeenCalledWith('주소를 선택해주세요.', 'useAddressModal');
    });

    it('should show error when maximum addresses limit is reached', async () => {
      const { result } = renderHook(() => useAddressModal({ addressesCount: 4 }));

      const mockAddress: AddressSearchResult = {
        address: '서울시 강남구',
        roadAddress: '서울시 강남구 테헤란로',
        postalCode: '12345',
        latitude: '37.123',
        longitude: '127.456',
      };

      act(() => {
        result.current.handleSelectAddress(mockAddress);
      });

      const success = await act(async () => {
        return await result.current.handleAddAddress();
      });

      expect(success).toBe(false);
      expect(mockHandleError).toHaveBeenCalledWith('최대 4개까지 주소를 등록할 수 있습니다.', 'useAddressModal');
    });

    it('should successfully add address without alias', async () => {
      vi.mocked(userService.createAddress).mockResolvedValue(
        createMockUserAddress({
          id: 1,
          roadAddress: '서울시 강남구 테헤란로',
          postalCode: '12345',
          latitude: 37.123,
          longitude: 127.456,
          isDefault: false,
          isSearchAddress: true,
          alias: null,
        })
      );

      const { result } = renderHook(() => useAddressModal({ addressesCount: 0 }));

      const mockAddress: AddressSearchResult = {
        address: '서울시 강남구',
        roadAddress: '서울시 강남구 테헤란로',
        postalCode: '12345',
        latitude: '37.123',
        longitude: '127.456',
      };

      act(() => {
        result.current.handleSelectAddress(mockAddress);
      });

      const success = await act(async () => {
        return await result.current.handleAddAddress();
      });

      expect(success).toBe(true);
      expect(userService.createAddress).toHaveBeenCalledWith({
        selectedAddress: mockAddress,
        alias: undefined,
      });
      expect(mockHandleSuccess).toHaveBeenCalledWith('주소가 추가되었습니다.');
      expect(result.current.selectedAddress).toBe(null);
      expect(result.current.addressAlias).toBe('');
      expect(result.current.hasSearchedAddress).toBe(false);
    });

    it('should successfully add address with alias', async () => {
      vi.mocked(userService.createAddress).mockResolvedValue(
        createMockUserAddress({
          id: 1,
          roadAddress: '서울시 강남구 테헤란로',
          postalCode: '12345',
          latitude: 37.123,
          longitude: 127.456,
          isDefault: false,
          isSearchAddress: true,
          alias: '집',
        })
      );

      const { result } = renderHook(() => useAddressModal({ addressesCount: 0 }));

      const mockAddress: AddressSearchResult = {
        address: '서울시 강남구',
        roadAddress: '서울시 강남구 테헤란로',
        postalCode: '12345',
        latitude: '37.123',
        longitude: '127.456',
      };

      act(() => {
        result.current.handleSelectAddress(mockAddress);
        result.current.setAddressAlias('집');
      });

      const success = await act(async () => {
        return await result.current.handleAddAddress();
      });

      expect(success).toBe(true);
      expect(userService.createAddress).toHaveBeenCalledWith({
        selectedAddress: mockAddress,
        alias: '집',
      });
    });

    it('should call onAddressAdded callback after success', async () => {
      const onAddressAdded = vi.fn().mockResolvedValue(undefined);

      vi.mocked(userService.createAddress).mockResolvedValue(
        createMockUserAddress({
          id: 1,
          roadAddress: '서울시 강남구 테헤란로',
          postalCode: '12345',
          latitude: 37.123,
          longitude: 127.456,
          isDefault: false,
          isSearchAddress: true,
          alias: null,
        })
      );

      const { result } = renderHook(() => useAddressModal({ addressesCount: 0, onAddressAdded }));

      const mockAddress: AddressSearchResult = {
        address: '서울시 강남구',
        roadAddress: '서울시 강남구 테헤란로',
        postalCode: '12345',
        latitude: '37.123',
        longitude: '127.456',
      };

      act(() => {
        result.current.handleSelectAddress(mockAddress);
      });

      await act(async () => {
        await result.current.handleAddAddress();
      });

      expect(onAddressAdded).toHaveBeenCalled();
    });

    it('should handle add address error', async () => {
      const error = new Error('Server error');
      vi.mocked(userService.createAddress).mockRejectedValue(error);

      const { result } = renderHook(() => useAddressModal({ addressesCount: 0 }));

      const mockAddress: AddressSearchResult = {
        address: '서울시 강남구',
        roadAddress: '서울시 강남구 테헤란로',
        postalCode: '12345',
        latitude: '37.123',
        longitude: '127.456',
      };

      act(() => {
        result.current.handleSelectAddress(mockAddress);
      });

      const success = await act(async () => {
        return await result.current.handleAddAddress();
      });

      expect(success).toBe(false);
      expect(mockHandleError).toHaveBeenCalledWith(error, 'useAddressModal');
      expect(result.current.isSaving).toBe(false);
    });

    it('should trim alias whitespace', async () => {
      vi.mocked(userService.createAddress).mockResolvedValue(
        createMockUserAddress({
          id: 1,
          roadAddress: '서울시 강남구 테헤란로',
          postalCode: '12345',
          latitude: 37.123,
          longitude: 127.456,
          isDefault: false,
          isSearchAddress: true,
          alias: '집',
        })
      );

      const { result } = renderHook(() => useAddressModal({ addressesCount: 0 }));

      const mockAddress: AddressSearchResult = {
        address: '서울시 강남구',
        roadAddress: '서울시 강남구 테헤란로',
        postalCode: '12345',
        latitude: '37.123',
        longitude: '127.456',
      };

      act(() => {
        result.current.handleSelectAddress(mockAddress);
        result.current.setAddressAlias('  집  ');
      });

      await act(async () => {
        await result.current.handleAddAddress();
      });

      expect(userService.createAddress).toHaveBeenCalledWith({
        selectedAddress: mockAddress,
        alias: '집',
      });
    });

    it('should treat empty alias as undefined', async () => {
      vi.mocked(userService.createAddress).mockResolvedValue(
        createMockUserAddress({
          id: 1,
          roadAddress: '서울시 강남구 테헤란로',
          postalCode: '12345',
          latitude: 37.123,
          longitude: 127.456,
          isDefault: false,
          isSearchAddress: true,
          alias: null,
        })
      );

      const { result } = renderHook(() => useAddressModal({ addressesCount: 0 }));

      const mockAddress: AddressSearchResult = {
        address: '서울시 강남구',
        roadAddress: '서울시 강남구 테헤란로',
        postalCode: '12345',
        latitude: '37.123',
        longitude: '127.456',
      };

      act(() => {
        result.current.handleSelectAddress(mockAddress);
        result.current.setAddressAlias('   ');
      });

      await act(async () => {
        await result.current.handleAddAddress();
      });

      expect(userService.createAddress).toHaveBeenCalledWith({
        selectedAddress: mockAddress,
        alias: undefined,
      });
    });
  });

  describe('resetAddressModal', () => {
    it('should reset all state', async () => {
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

      const { result } = renderHook(() => useAddressModal());

      act(() => {
        result.current.setAddressQuery('서울');
      });

      await act(async () => {
        await result.current.handleSearch();
      });

      act(() => {
        result.current.setAddressAlias('집');
      });

      act(() => {
        result.current.resetAddressModal();
      });

      expect(result.current.addressQuery).toBe('');
      expect(result.current.searchResults).toEqual([]);
      expect(result.current.selectedAddress).toBe(null);
      expect(result.current.addressAlias).toBe('');
      expect(result.current.hasSearchedAddress).toBe(false);
    });
  });

  describe('State setters', () => {
    it('should update addressQuery', () => {
      const { result } = renderHook(() => useAddressModal());

      act(() => {
        result.current.setAddressQuery('서울시');
      });

      expect(result.current.addressQuery).toBe('서울시');
    });

    it('should update selectedAddress', () => {
      const { result } = renderHook(() => useAddressModal());

      const mockSelected: SelectedAddress = {
        address: '서울시 강남구',
        roadAddress: '서울시 강남구 테헤란로',
        postalCode: '12345',
        latitude: '37.123',
        longitude: '127.456',
      };

      act(() => {
        result.current.setSelectedAddress(mockSelected);
      });

      expect(result.current.selectedAddress).toEqual(mockSelected);
    });

    it('should update addressAlias', () => {
      const { result } = renderHook(() => useAddressModal());

      act(() => {
        result.current.setAddressAlias('회사');
      });

      expect(result.current.addressAlias).toBe('회사');
    });
  });
});
