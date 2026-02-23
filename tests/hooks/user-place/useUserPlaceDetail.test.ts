import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useUserPlaceDetail } from '@/hooks/user-place/useUserPlaceDetail';
import { userPlaceService } from '@/api/services/user-place';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import type { UserPlace } from '@/types/user-place';

vi.mock('@/api/services/user-place');
vi.mock('@/hooks/useErrorHandler');

describe('useUserPlaceDetail', () => {
  const mockHandleError = vi.fn();
  const mockHandleSuccess = vi.fn();

  const mockPlace: UserPlace = {
    id: 1,
    name: 'Test Place',
    category: 'RESTAURANT',
    placeId: 'google_place_123',
    address: '123 Main St',
    latitude: 37.5665,
    longitude: 126.9780,
    status: 'ACTIVE',
    visitCount: 5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useErrorHandler).mockReturnValue({
      handleError: mockHandleError,
      handleSuccess: mockHandleSuccess,
    });
  });

  describe('Initial State', () => {
    it('should initialize with correct default values when id is null', () => {
      const { result } = renderHook(() => useUserPlaceDetail(null));

      expect(result.current.place).toBe(null);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.refetch).toBeTypeOf('function');
    });

    it('should not load place when id is null', () => {
      renderHook(() => useUserPlaceDetail(null));

      expect(userPlaceService.getUserPlace).not.toHaveBeenCalled();
    });
  });

  describe('Load Place', () => {
    it('should load place on mount when id is provided', async () => {
      vi.mocked(userPlaceService.getUserPlace).mockResolvedValue(mockPlace);

      const { result } = renderHook(() => useUserPlaceDetail(1));

      // Wait for the effect to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(userPlaceService.getUserPlace).toHaveBeenCalledWith(1);
      expect(result.current.place).toEqual(mockPlace);
    });

    it('should set loading state during fetch', async () => {
      let resolveFetch: (value: UserPlace) => void;
      const fetchPromise = new Promise<UserPlace>((resolve) => {
        resolveFetch = resolve;
      });
      vi.mocked(userPlaceService.getUserPlace).mockReturnValue(fetchPromise);

      const { result } = renderHook(() => useUserPlaceDetail(1));

      // Should be loading initially
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Resolve the promise
      await act(async () => {
        resolveFetch!(mockPlace);
        await fetchPromise;
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.place).toEqual(mockPlace);
    });

    it('should handle fetch error', async () => {
      const error = new Error('Fetch failed');
      vi.mocked(userPlaceService.getUserPlace).mockRejectedValue(error);

      const { result } = renderHook(() => useUserPlaceDetail(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, 'useUserPlaceDetail');
      expect(result.current.place).toBe(null);
    });

    it('should clear place on error', async () => {
      vi.mocked(userPlaceService.getUserPlace)
        .mockResolvedValueOnce(mockPlace)
        .mockRejectedValueOnce(new Error('Failed'));

      const { result, rerender } = renderHook(
        ({ id }) => useUserPlaceDetail(id),
        { initialProps: { id: 1 } }
      );

      await waitFor(() => {
        expect(result.current.place).toEqual(mockPlace);
      });

      // Change id to trigger refetch
      rerender({ id: 2 });

      await waitFor(() => {
        expect(result.current.place).toBe(null);
      });
    });
  });

  describe('ID Changes', () => {
    it('should reload place when id changes', async () => {
      const mockPlace2: UserPlace = {
        ...mockPlace,
        id: 2,
        name: 'Second Place',
      };

      vi.mocked(userPlaceService.getUserPlace)
        .mockResolvedValueOnce(mockPlace)
        .mockResolvedValueOnce(mockPlace2);

      const { result, rerender } = renderHook(
        ({ id }) => useUserPlaceDetail(id),
        { initialProps: { id: 1 } }
      );

      await waitFor(() => {
        expect(result.current.place).toEqual(mockPlace);
      });

      expect(userPlaceService.getUserPlace).toHaveBeenCalledWith(1);

      // Change id
      rerender({ id: 2 });

      await waitFor(() => {
        expect(result.current.place).toEqual(mockPlace2);
      });

      expect(userPlaceService.getUserPlace).toHaveBeenCalledWith(2);
    });

    it('should clear place when id changes to null', async () => {
      vi.mocked(userPlaceService.getUserPlace).mockResolvedValue(mockPlace);

      const { result, rerender } = renderHook(
        ({ id }) => useUserPlaceDetail(id),
        { initialProps: { id: 1 } }
      );

      await waitFor(() => {
        expect(result.current.place).toEqual(mockPlace);
      });

      // Change id to null
      rerender({ id: null });

      await waitFor(() => {
        expect(result.current.place).toBe(null);
      });

      // Should not call service when id is null
      expect(userPlaceService.getUserPlace).toHaveBeenCalledTimes(1);
    });

    it('should load place when id changes from null to value', async () => {
      vi.mocked(userPlaceService.getUserPlace).mockResolvedValue(mockPlace);

      const { result, rerender } = renderHook(
        ({ id }) => useUserPlaceDetail(id),
        { initialProps: { id: null } }
      );

      expect(result.current.place).toBe(null);
      expect(userPlaceService.getUserPlace).not.toHaveBeenCalled();

      // Change id from null to 1
      rerender({ id: 1 });

      await waitFor(() => {
        expect(result.current.place).toEqual(mockPlace);
      });

      expect(userPlaceService.getUserPlace).toHaveBeenCalledWith(1);
    });
  });

  describe('refetch', () => {
    it('should manually reload place', async () => {
      vi.mocked(userPlaceService.getUserPlace).mockResolvedValue(mockPlace);

      const { result } = renderHook(() => useUserPlaceDetail(1));

      await waitFor(() => {
        expect(result.current.place).toEqual(mockPlace);
      });

      // Clear the mock to track new calls
      vi.mocked(userPlaceService.getUserPlace).mockClear();

      const updatedPlace: UserPlace = {
        ...mockPlace,
        visitCount: 10,
      };

      vi.mocked(userPlaceService.getUserPlace).mockResolvedValue(updatedPlace);

      // Manually refetch
      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.place).toEqual(updatedPlace);
      });

      expect(userPlaceService.getUserPlace).toHaveBeenCalledWith(1);
    });

    it('should handle refetch error', async () => {
      vi.mocked(userPlaceService.getUserPlace).mockResolvedValue(mockPlace);

      const { result } = renderHook(() => useUserPlaceDetail(1));

      await waitFor(() => {
        expect(result.current.place).toEqual(mockPlace);
      });

      // Mock error on refetch
      const error = new Error('Refetch failed');
      vi.mocked(userPlaceService.getUserPlace).mockRejectedValue(error);

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith(error, 'useUserPlaceDetail');
      });

      expect(result.current.place).toBe(null);
    });

    it('should not fetch when refetch called with null id', async () => {
      const { result } = renderHook(() => useUserPlaceDetail(null));

      act(() => {
        result.current.refetch();
      });

      expect(userPlaceService.getUserPlace).not.toHaveBeenCalled();
      expect(result.current.place).toBe(null);
    });
  });

  describe('Loading State Management', () => {
    it('should reset loading state after successful fetch', async () => {
      vi.mocked(userPlaceService.getUserPlace).mockResolvedValue(mockPlace);

      const { result } = renderHook(() => useUserPlaceDetail(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.place).toEqual(mockPlace);
    });

    it('should reset loading state after error', async () => {
      vi.mocked(userPlaceService.getUserPlace).mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useUserPlaceDetail(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.place).toBe(null);
    });

    it('should show loading during refetch', async () => {
      vi.mocked(userPlaceService.getUserPlace).mockResolvedValue(mockPlace);

      const { result } = renderHook(() => useUserPlaceDetail(1));

      await waitFor(() => {
        expect(result.current.place).toEqual(mockPlace);
      });

      let resolveRefetch: (value: UserPlace) => void;
      const refetchPromise = new Promise<UserPlace>((resolve) => {
        resolveRefetch = resolve;
      });
      vi.mocked(userPlaceService.getUserPlace).mockReturnValue(refetchPromise);

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await act(async () => {
        resolveRefetch!(mockPlace);
        await refetchPromise;
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });
});
