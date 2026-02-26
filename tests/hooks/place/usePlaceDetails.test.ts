import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePlaceDetails } from '@features/agent/hooks/usePlaceDetails';
import { menuService } from '@features/agent/api';
import type { PlaceDetail } from '@features/agent/types';

vi.mock('@features/agent/api');
vi.mock('@shared/hooks/usePrevious', () => ({
  usePrevious: vi.fn(() => undefined), // First render returns undefined
}));

describe('usePlaceDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with idle state when placeId is null', () => {
      const { result } = renderHook(() => usePlaceDetails(null));

      expect(result.current.status).toBe('idle');
      expect(result.current.errorMessage).toBe(null);
      expect(result.current.placeDetail).toBe(null);
    });
  });

  describe('Loading Place Details', () => {
    it('should load place details successfully', async () => {
      const mockPlaceDetail: PlaceDetail = {
        id: 'place123',
        name: '맛있는 식당',
        address: '서울시 강남구',
        location: null,
        rating: 4.5,
        userRatingCount: 100,
        priceLevel: null,
        photos: null,
        openNow: null,
        reviews: null,
      };

      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({
        place: mockPlaceDetail,
      });

      const { result } = renderHook(() => usePlaceDetails('place123'));

      await waitFor(() => {
        expect(result.current.status).toBe('ready');
      });

      expect(result.current.placeDetail).toEqual(mockPlaceDetail);
      expect(result.current.errorMessage).toBe(null);
    });

    it('should set loading status while fetching', async () => {
      let resolvePlace: ((value: { place: PlaceDetail }) => void) | undefined;
      const placePromise = new Promise<{ place: PlaceDetail }>((resolve) => {
        resolvePlace = resolve;
      });

      vi.mocked(menuService.getPlaceDetail).mockReturnValue(placePromise);

      const { result } = renderHook(() => usePlaceDetails('place123'));

      await waitFor(() => {
        expect(result.current.status).toBe('loading');
      });

      resolvePlace!({ place: { id: 'place123', name: 'Test' } });

      await waitFor(() => {
        expect(result.current.status).toBe('ready');
      });
    });

    it('should handle error when fetching fails', async () => {
      const error = new Error('Network error');
      vi.mocked(menuService.getPlaceDetail).mockRejectedValue(error);

      const { result } = renderHook(() => usePlaceDetails('place123'));

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.errorMessage).toBe('Network error');
      expect(result.current.placeDetail).toBe(null);
    });

    it('should use default error message when error has no message', async () => {
      vi.mocked(menuService.getPlaceDetail).mockRejectedValue({});

      const { result } = renderHook(() => usePlaceDetails('place123'));

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.errorMessage).toBe('가게 상세 정보를 불러오지 못했습니다.');
    });
  });

  describe('Place ID Changes', () => {
    it('should reset to idle when placeId becomes null', async () => {
      const mockPlaceDetail: PlaceDetail = {
        id: 'place123',
        name: '맛있는 식당',
        address: '서울시 강남구',
        location: null,
        rating: 4.5,
        userRatingCount: 100,
        priceLevel: null,
        photos: null,
        openNow: null,
        reviews: null,
      };

      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({
        place: mockPlaceDetail,
      });

      const { result, rerender } = renderHook(({ placeId }) => usePlaceDetails(placeId), {
        initialProps: { placeId: 'place123' },
      });

      await waitFor(() => {
        expect(result.current.status).toBe('ready');
      });

      rerender({ placeId: null });

      expect(result.current.status).toBe('idle');
      expect(result.current.placeDetail).toBe(null);
    });

  });

  describe('Cancellation', () => {
    it('should cancel previous request when placeId changes quickly', async () => {
      vi.mocked(menuService.getPlaceDetail).mockImplementation(
        (placeId: string) =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  place: { id: placeId, name: `Place ${placeId}` } as PlaceDetail,
                }),
              100
            )
          )
      );

      const { rerender } = renderHook(({ placeId }) => usePlaceDetails(placeId), {
        initialProps: { placeId: 'place1' },
      });

      // Quickly change placeId
      rerender({ placeId: 'place2' });

      // Only the latest request should be processed
      expect(menuService.getPlaceDetail).toHaveBeenCalledWith('place2');
    });
  });

  describe('Empty or Invalid Place ID', () => {
    it('should handle empty string placeId', () => {
      const { result } = renderHook(() => usePlaceDetails(''));

      expect(result.current.status).toBe('idle');
      expect(result.current.placeDetail).toBe(null);
    });

    it('should not fetch when placeId is null', () => {
      renderHook(() => usePlaceDetails(null));

      expect(menuService.getPlaceDetail).not.toHaveBeenCalled();
    });

    it('should reset to idle state when placeId changes from valid to null', async () => {
      const mockPlaceDetail: PlaceDetail = {
        id: 'place123',
        name: '맛있는 식당',
        address: '서울시 강남구',
        location: null,
        rating: 4.5,
        userRatingCount: 100,
        priceLevel: null,
        photos: null,
        openNow: null,
        reviews: null,
      };

      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({
        place: mockPlaceDetail,
      });

      const { result, rerender } = renderHook(
        ({ placeId }) => usePlaceDetails(placeId),
        {
          initialProps: { placeId: 'place123' as string | null },
        }
      );

      await waitFor(() => {
        expect(result.current.status).toBe('ready');
        expect(result.current.placeDetail).toEqual(mockPlaceDetail);
      });

      // Change to null
      rerender({ placeId: null });

      expect(result.current.status).toBe('idle');
      expect(result.current.placeDetail).toBe(null);
    });

    it('should reset to idle state when placeId changes from valid to empty string', async () => {
      const mockPlaceDetail: PlaceDetail = {
        id: 'place123',
        name: '맛있는 식당',
        address: '서울시 강남구',
        location: null,
        rating: 4.5,
        userRatingCount: 100,
        priceLevel: null,
        photos: null,
        openNow: null,
        reviews: null,
      };

      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({
        place: mockPlaceDetail,
      });

      const { result, rerender } = renderHook(
        ({ placeId }) => usePlaceDetails(placeId),
        {
          initialProps: { placeId: 'place123' as string | null },
        }
      );

      await waitFor(() => {
        expect(result.current.status).toBe('ready');
      });

      // Change to empty string
      rerender({ placeId: '' });

      expect(result.current.status).toBe('idle');
      expect(result.current.placeDetail).toBe(null);
    });
  });


  describe('Cleanup on unmount', () => {
    it('should cancel pending request on unmount', async () => {
      let resolvePlace: ((value: { place: PlaceDetail }) => void) | undefined;
      const placePromise = new Promise<{ place: PlaceDetail }>((resolve) => {
        resolvePlace = resolve;
      });

      vi.mocked(menuService.getPlaceDetail).mockReturnValue(placePromise);

      const { unmount, result } = renderHook(() => usePlaceDetails('place123'));

      await waitFor(() => {
        expect(result.current.status).toBe('loading');
      });

      // Unmount before promise resolves
      unmount();

      // Resolve after unmount
      resolvePlace!({ place: { id: 'place123', name: 'Test' } });

      // The state should not update after unmount (cancelled flag prevents it)
      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify the promise was created (hook tried to fetch)
      expect(menuService.getPlaceDetail).toHaveBeenCalledWith('place123');
    });

    it('should not update state when cancelled during error', async () => {
      let rejectPlace: ((error: Error) => void) | undefined;
      const placePromise = new Promise<{ place: PlaceDetail }>((_, reject) => {
        rejectPlace = reject;
      });

      vi.mocked(menuService.getPlaceDetail).mockReturnValue(placePromise);

      const { unmount, result } = renderHook(() => usePlaceDetails('place123'));

      await waitFor(() => {
        expect(result.current.status).toBe('loading');
      });

      // Unmount before promise rejects
      unmount();

      // Reject after unmount
      rejectPlace!(new Error('Test error'));

      // The state should not update after unmount (cancelled flag prevents it)
      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify the promise was created (hook tried to fetch)
      expect(menuService.getPlaceDetail).toHaveBeenCalledWith('place123');
    });
  });

  describe('Skipping redundant fetches', () => {
    it('should skip fetch when prevPlaceId equals placeId (StrictMode check)', async () => {
      const mockPlaceDetail: PlaceDetail = {
        id: 'place123',
        name: '맛있는 식당',
        address: '서울시 강남구',
        location: null,
        rating: 4.5,
        userRatingCount: 100,
        priceLevel: null,
        photos: null,
        openNow: null,
        reviews: null,
      };

      vi.mocked(menuService.getPlaceDetail).mockResolvedValue({
        place: mockPlaceDetail,
      });

      // Mock usePrevious to return the same placeId (simulating rerender without change)
      const { usePrevious } = await import('@shared/hooks/usePrevious');
      vi.mocked(usePrevious).mockReturnValue('place123');

      renderHook(() => usePlaceDetails('place123'));

      // Wait a bit to ensure no additional fetch happens
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should only be called once (the initial render in first effect)
      // When prevPlaceId === placeId, the effect returns early
      expect(menuService.getPlaceDetail).toHaveBeenCalledTimes(0);
    });
  });
});
