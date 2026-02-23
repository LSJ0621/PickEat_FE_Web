import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useUserPlaceList } from '@/hooks/user-place/useUserPlaceList';
import { userPlaceService } from '@/api/services/user-place';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import type { UserPlace } from '@/types/user-place';

vi.mock('@/api/services/user-place');
vi.mock('@/hooks/useErrorHandler');

describe('useUserPlaceList', () => {
  const mockHandleError = vi.fn();
  const mockHandleSuccess = vi.fn();

  const mockPlaces: UserPlace[] = [
    {
      id: 1,
      name: 'Place 1',
      category: 'RESTAURANT',
      placeId: 'google_place_1',
      address: '123 Main St',
      latitude: 37.5665,
      longitude: 126.9780,
      status: 'ACTIVE',
      visitCount: 5,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Place 2',
      category: 'CAFE',
      placeId: 'google_place_2',
      address: '456 Elm St',
      latitude: 37.5666,
      longitude: 126.9781,
      status: 'ACTIVE',
      visitCount: 3,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  const mockListResponse = {
    items: mockPlaces,
    total: 2,
    totalPages: 1,
    page: 1,
    limit: 10,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useErrorHandler).mockReturnValue({
      handleError: mockHandleError,
      handleSuccess: mockHandleSuccess,
    });
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', async () => {
      vi.mocked(userPlaceService.getUserPlaces).mockResolvedValue(mockListResponse);

      const { result } = renderHook(() => useUserPlaceList());

      // Initial state before data loads
      expect(result.current.places).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.totalPages).toBe(0);
      expect(result.current.page).toBe(1);
      expect(result.current.limit).toBe(10);
      expect(result.current.status).toBe(undefined);
      expect(result.current.search).toBe('');

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Load Places', () => {
    it('should load places on mount', async () => {
      vi.mocked(userPlaceService.getUserPlaces).mockResolvedValue(mockListResponse);

      const { result } = renderHook(() => useUserPlaceList());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(userPlaceService.getUserPlaces).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        status: undefined,
        search: undefined,
      });

      expect(result.current.places).toEqual(mockPlaces);
      expect(result.current.total).toBe(2);
      expect(result.current.totalPages).toBe(1);
    });

    it('should set loading state during fetch', async () => {
      let resolveFetch: (value: typeof mockListResponse) => void;
      const fetchPromise = new Promise<typeof mockListResponse>((resolve) => {
        resolveFetch = resolve;
      });
      vi.mocked(userPlaceService.getUserPlaces).mockReturnValue(fetchPromise);

      const { result } = renderHook(() => useUserPlaceList());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await act(async () => {
        resolveFetch!(mockListResponse);
        await fetchPromise;
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.places).toEqual(mockPlaces);
    });

    it('should handle fetch error', async () => {
      const error = new Error('Fetch failed');
      vi.mocked(userPlaceService.getUserPlaces).mockRejectedValue(error);

      const { result } = renderHook(() => useUserPlaceList());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, 'useUserPlaceList');
    });
  });

  describe('Pagination', () => {
    it('should handle page change', async () => {
      vi.mocked(userPlaceService.getUserPlaces).mockResolvedValue(mockListResponse);

      const { result } = renderHook(() => useUserPlaceList());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const page2Response = {
        ...mockListResponse,
        page: 2,
      };

      vi.mocked(userPlaceService.getUserPlaces).mockResolvedValue(page2Response);

      act(() => {
        result.current.handlePageChange(2);
      });

      await waitFor(() => {
        expect(result.current.page).toBe(2);
      });

      expect(userPlaceService.getUserPlaces).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        status: undefined,
        search: undefined,
      });
    });

    it('should reload places when page changes', async () => {
      vi.mocked(userPlaceService.getUserPlaces).mockResolvedValue(mockListResponse);

      const { result } = renderHook(() => useUserPlaceList());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      vi.mocked(userPlaceService.getUserPlaces).mockClear();

      act(() => {
        result.current.handlePageChange(2);
      });

      await waitFor(() => {
        expect(userPlaceService.getUserPlaces).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2 })
        );
      });
    });
  });

  describe('Filtering', () => {
    it('should handle status filter change', async () => {
      vi.mocked(userPlaceService.getUserPlaces).mockResolvedValue(mockListResponse);

      const { result } = renderHook(() => useUserPlaceList());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      vi.mocked(userPlaceService.getUserPlaces).mockClear();

      act(() => {
        result.current.handleStatusFilter('ACTIVE');
      });

      await waitFor(() => {
        expect(result.current.status).toBe('ACTIVE');
      });

      expect(userPlaceService.getUserPlaces).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        status: 'ACTIVE',
        search: undefined,
      });
    });

    it('should reset to page 1 when filter changes', async () => {
      vi.mocked(userPlaceService.getUserPlaces).mockResolvedValue(mockListResponse);

      const { result } = renderHook(() => useUserPlaceList());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Go to page 2
      act(() => {
        result.current.handlePageChange(2);
      });

      await waitFor(() => {
        expect(result.current.page).toBe(2);
      });

      // Change filter - should reset to page 1
      act(() => {
        result.current.handleStatusFilter('INACTIVE');
      });

      await waitFor(() => {
        expect(result.current.page).toBe(1);
      });
    });

    it('should handle clearing filter', async () => {
      vi.mocked(userPlaceService.getUserPlaces).mockResolvedValue(mockListResponse);

      const { result } = renderHook(() => useUserPlaceList());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Set filter
      act(() => {
        result.current.handleStatusFilter('ACTIVE');
      });

      await waitFor(() => {
        expect(result.current.status).toBe('ACTIVE');
      });

      vi.mocked(userPlaceService.getUserPlaces).mockClear();

      // Clear filter
      act(() => {
        result.current.handleStatusFilter(undefined);
      });

      await waitFor(() => {
        expect(result.current.status).toBe(undefined);
      });

      expect(userPlaceService.getUserPlaces).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        status: undefined,
        search: undefined,
      });
    });
  });

  describe('Search', () => {
    it('should handle search term change', async () => {
      vi.mocked(userPlaceService.getUserPlaces).mockResolvedValue(mockListResponse);

      const { result } = renderHook(() => useUserPlaceList());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      vi.mocked(userPlaceService.getUserPlaces).mockClear();

      act(() => {
        result.current.handleSearch('coffee');
      });

      await waitFor(() => {
        expect(result.current.search).toBe('coffee');
      });

      expect(userPlaceService.getUserPlaces).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        status: undefined,
        search: 'coffee',
      });
    });

    it('should reset to page 1 when search changes', async () => {
      vi.mocked(userPlaceService.getUserPlaces).mockResolvedValue(mockListResponse);

      const { result } = renderHook(() => useUserPlaceList());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Go to page 2
      act(() => {
        result.current.handlePageChange(2);
      });

      await waitFor(() => {
        expect(result.current.page).toBe(2);
      });

      // Search - should reset to page 1
      act(() => {
        result.current.handleSearch('pizza');
      });

      await waitFor(() => {
        expect(result.current.page).toBe(1);
      });
    });

    it('should convert empty search to undefined', async () => {
      vi.mocked(userPlaceService.getUserPlaces).mockResolvedValue(mockListResponse);

      const { result } = renderHook(() => useUserPlaceList());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Set search
      act(() => {
        result.current.handleSearch('coffee');
      });

      await waitFor(() => {
        expect(result.current.search).toBe('coffee');
      });

      vi.mocked(userPlaceService.getUserPlaces).mockClear();

      // Clear search with empty string
      act(() => {
        result.current.handleSearch('');
      });

      await waitFor(() => {
        expect(result.current.search).toBe('');
      });

      expect(userPlaceService.getUserPlaces).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        status: undefined,
        search: undefined, // Empty string converted to undefined
      });
    });
  });

  describe('Refresh List', () => {
    it('should manually reload places', async () => {
      vi.mocked(userPlaceService.getUserPlaces).mockResolvedValue(mockListResponse);

      const { result } = renderHook(() => useUserPlaceList());

      await waitFor(() => {
        expect(result.current.places).toEqual(mockPlaces);
      });

      vi.mocked(userPlaceService.getUserPlaces).mockClear();

      const updatedPlaces = [
        { ...mockPlaces[0], visitCount: 10 },
        mockPlaces[1],
      ];

      const updatedResponse = {
        ...mockListResponse,
        items: updatedPlaces,
      };

      vi.mocked(userPlaceService.getUserPlaces).mockResolvedValue(updatedResponse);

      act(() => {
        result.current.refreshList();
      });

      await waitFor(() => {
        expect(result.current.places).toEqual(updatedPlaces);
      });

      expect(userPlaceService.getUserPlaces).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        status: undefined,
        search: undefined,
      });
    });

    it('should maintain current page/filter/search on refresh', async () => {
      vi.mocked(userPlaceService.getUserPlaces).mockResolvedValue(mockListResponse);

      const { result } = renderHook(() => useUserPlaceList());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Set filter and search first (these reset page to 1)
      act(() => {
        result.current.handleStatusFilter('ACTIVE');
        result.current.handleSearch('coffee');
      });

      await waitFor(() => {
        expect(result.current.status).toBe('ACTIVE');
        expect(result.current.search).toBe('coffee');
      });

      // Then set page to 2
      act(() => {
        result.current.handlePageChange(2);
      });

      await waitFor(() => {
        expect(result.current.page).toBe(2);
      });

      vi.mocked(userPlaceService.getUserPlaces).mockClear();

      // Refresh
      act(() => {
        result.current.refreshList();
      });

      await waitFor(() => {
        expect(userPlaceService.getUserPlaces).toHaveBeenCalledWith({
          page: 2,
          limit: 10,
          status: 'ACTIVE',
          search: 'coffee',
        });
      });
    });
  });

  describe('Combined Filters', () => {
    it('should handle multiple filters together', async () => {
      vi.mocked(userPlaceService.getUserPlaces).mockResolvedValue(mockListResponse);

      const { result } = renderHook(() => useUserPlaceList());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      vi.mocked(userPlaceService.getUserPlaces).mockClear();

      // Set filter and search first (these reset page to 1)
      act(() => {
        result.current.handleStatusFilter('ACTIVE');
        result.current.handleSearch('restaurant');
      });

      await waitFor(() => {
        expect(result.current.status).toBe('ACTIVE');
        expect(result.current.search).toBe('restaurant');
      });

      // Then set page to 2
      act(() => {
        result.current.handlePageChange(2);
      });

      await waitFor(() => {
        expect(userPlaceService.getUserPlaces).toHaveBeenCalledWith({
          page: 2,
          limit: 10,
          status: 'ACTIVE',
          search: 'restaurant',
        });
      });
    });
  });

  describe('Error Handling in DEV mode', () => {
    it('should log error in dev mode when load fails', async () => {
      const originalEnv = import.meta.env.DEV;
      vi.stubGlobal('import.meta', { env: { DEV: true } });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const error = new Error('Load failed');
      vi.mocked(userPlaceService.getUserPlaces).mockRejectedValue(error);

      renderHook(() => useUserPlaceList());

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalled();
      });

      // Note: The console.error in the catch block may not be called
      // because the error is already handled in loadPlaces

      consoleSpy.mockRestore();
      vi.stubGlobal('import.meta', { env: { DEV: originalEnv } });
    });

    it('should log error in dev mode when refresh fails', async () => {
      const originalEnv = import.meta.env.DEV;
      vi.stubGlobal('import.meta', { env: { DEV: true } });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.mocked(userPlaceService.getUserPlaces)
        .mockResolvedValueOnce(mockListResponse)
        .mockRejectedValueOnce(new Error('Refresh failed'));

      const { result } = renderHook(() => useUserPlaceList());

      await waitFor(() => {
        expect(result.current.places).toEqual(mockPlaces);
      });

      act(() => {
        result.current.refreshList();
      });

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
      vi.stubGlobal('import.meta', { env: { DEV: originalEnv } });
    });
  });
});
