/**
 * Tests for useHistoryMenuActions hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useHistoryMenuActions } from '@/hooks/history/useHistoryMenuActions';
import { searchService } from '@/api/services/search';
import { createAuthenticatedState } from '@tests/factories/user';
import { setupStore, createWrapper as createTestWrapper } from '@tests/utils/renderWithProviders';
import { ToastProvider } from '@/components/common/ToastProvider';
import type { ReactNode } from 'react';
import type { Restaurant } from '@/types/search';

vi.mock('@/api/services/search');
vi.mock('@/hooks/map/useUserLocation', () => ({
  useUserLocation: vi.fn(() => ({
    latitude: 37.5172,
    longitude: 127.0473,
    address: '서울시 강남구 테헤란로 123',
    hasLocation: true,
  })),
}));

describe('useHistoryMenuActions', () => {
  const createWrapper = (isAuthenticated = true) => {
    const store = setupStore(
      isAuthenticated ? createAuthenticatedState() : { auth: { user: null, isAuthenticated: false, loading: false, error: null } }
    );

    return ({ children }: { children: ReactNode }) => (
      <ToastProvider>{createTestWrapper({ store })({ children })}</ToastProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('초기 상태', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useHistoryMenuActions(), {
        wrapper: createWrapper(),
      });

      expect(result.current.selectedMenu).toBeNull();
      expect(result.current.showConfirmCard).toBe(false);
      expect(result.current.restaurants).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('handleMenuClick', () => {
    it('should set selected menu and show confirm card', () => {
      const { result } = renderHook(() => useHistoryMenuActions(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.handleMenuClick('김치찌개');
      });

      expect(result.current.selectedMenu).toBe('김치찌개');
      expect(result.current.showConfirmCard).toBe(true);
    });

    it('should clear restaurants when selecting different menu', () => {
      const { result } = renderHook(() => useHistoryMenuActions(), {
        wrapper: createWrapper(),
      });

      // 첫 번째 메뉴 선택
      act(() => {
        result.current.handleMenuClick('김치찌개');
      });

      // 레스토랑 목록 설정 (내부 상태 시뮬레이션)
      // 실제로는 handleSearch를 통해 설정되지만, 여기서는 직접 확인

      // 다른 메뉴 선택
      act(() => {
        result.current.handleMenuClick('불고기');
      });

      expect(result.current.selectedMenu).toBe('불고기');
      expect(result.current.restaurants).toEqual([]);
    });

    it('should not clear restaurants when selecting same menu', async () => {
      const mockRestaurants: Restaurant[] = [
        {
          name: '명동 김치찌개',
          address: '서울시 중구 명동길 123',
          roadAddress: '서울시 중구 명동길 123',
          latitude: 37.5636,
          longitude: 126.9869,
          phone: '02-1234-5678',
          mapx: 1269869000,
          mapy: 375636000,
        },
      ];

      vi.mocked(searchService.restaurants).mockResolvedValue({
        restaurants: mockRestaurants,
      });

      const { result } = renderHook(() => useHistoryMenuActions(), {
        wrapper: createWrapper(),
      });

      // 메뉴 선택 후 검색
      act(() => {
        result.current.handleMenuClick('김치찌개');
      });

      await act(async () => {
        await result.current.handleSearch();
      });

      await waitFor(() => {
        expect(result.current.restaurants).toEqual(mockRestaurants);
      });

      // 같은 메뉴 다시 선택
      act(() => {
        result.current.handleMenuClick('김치찌개');
      });

      expect(result.current.restaurants).toEqual(mockRestaurants);
    });
  });

  describe('handleSearch', () => {
    it('should search restaurants successfully', async () => {
      const mockRestaurants: Restaurant[] = [
        {
          name: '명동 김치찌개',
          address: '서울시 중구 명동길 123',
          roadAddress: '서울시 중구 명동길 123',
          latitude: 37.5636,
          longitude: 126.9869,
          phone: '02-1234-5678',
          mapx: 1269869000,
          mapy: 375636000,
        },
      ];

      vi.mocked(searchService.restaurants).mockResolvedValue({
        restaurants: mockRestaurants,
      });

      const { result } = renderHook(() => useHistoryMenuActions(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.handleMenuClick('김치찌개');
      });

      await act(async () => {
        await result.current.handleSearch();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(searchService.restaurants).toHaveBeenCalledWith({
        menuName: '김치찌개',
        latitude: 37.5172,
        longitude: 127.0473,
        includeRoadAddress: false,
      });
      expect(result.current.restaurants).toEqual(mockRestaurants);
      expect(result.current.showConfirmCard).toBe(false);
    });

    it('should handle error when user is not authenticated', async () => {
      const { result } = renderHook(() => useHistoryMenuActions(), {
        wrapper: createWrapper(false),
      });

      act(() => {
        result.current.handleMenuClick('김치찌개');
      });

      await act(async () => {
        await result.current.handleSearch();
      });

      expect(searchService.restaurants).not.toHaveBeenCalled();
    });

    it('should handle error when location is not available', async () => {
      const { useUserLocation } = await import('@/hooks/map/useUserLocation');
      const originalMock = vi.mocked(useUserLocation).getMockImplementation();

      vi.mocked(useUserLocation).mockReturnValue({
        latitude: null,
        longitude: null,
        address: null,
        hasLocation: false,
      });

      const { result } = renderHook(() => useHistoryMenuActions(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.handleMenuClick('김치찌개');
      });

      await act(async () => {
        await result.current.handleSearch();
      });

      expect(searchService.restaurants).not.toHaveBeenCalled();

      // Restore original mock
      if (originalMock) {
        vi.mocked(useUserLocation).mockImplementation(originalMock);
      } else {
        vi.mocked(useUserLocation).mockReturnValue({
          latitude: 37.5172,
          longitude: 127.0473,
          address: '서울시 강남구 테헤란로 123',
          hasLocation: true,
        });
      }
    });

    it('should not search when no menu is selected', async () => {
      const { result } = renderHook(() => useHistoryMenuActions(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.handleSearch();
      });

      expect(searchService.restaurants).not.toHaveBeenCalled();
    });

    it('should handle API error', async () => {
      vi.mocked(searchService.restaurants).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useHistoryMenuActions(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.handleMenuClick('김치찌개');
      });

      await act(async () => {
        await result.current.handleSearch();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should set loading state correctly during search', async () => {
      const mockRestaurants: Restaurant[] = [
        {
          name: '명동 김치찌개',
          address: '서울시 중구 명동길 123',
          roadAddress: '서울시 중구 명동길 123',
          latitude: 37.5636,
          longitude: 126.9869,
          phone: '02-1234-5678',
          mapx: 1269869000,
          mapy: 375636000,
        },
      ];

      vi.mocked(searchService.restaurants).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ restaurants: mockRestaurants }), 100);
          })
      );

      const { result } = renderHook(() => useHistoryMenuActions(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.handleMenuClick('김치찌개');
      });

      // Start the search in an act block but don't await it yet
      let searchPromise: Promise<void>;
      act(() => {
        searchPromise = result.current.handleSearch();
      });

      // 로딩 중인 상태 확인
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      // Now await the search completion
      await act(async () => {
        await searchPromise!;
      });

      // 로딩 완료 후 상태 확인
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('handleCancel', () => {
    it('should hide confirm card', () => {
      const { result } = renderHook(() => useHistoryMenuActions(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.handleMenuClick('김치찌개');
      });

      expect(result.current.showConfirmCard).toBe(true);

      act(() => {
        result.current.handleCancel();
      });

      expect(result.current.showConfirmCard).toBe(false);
    });
  });

  describe('resetSearchResults', () => {
    it('should clear restaurants', async () => {
      const mockRestaurants: Restaurant[] = [
        {
          name: '명동 김치찌개',
          address: '서울시 중구 명동길 123',
          roadAddress: '서울시 중구 명동길 123',
          latitude: 37.5636,
          longitude: 126.9869,
          phone: '02-1234-5678',
          mapx: 1269869000,
          mapy: 375636000,
        },
      ];

      vi.mocked(searchService.restaurants).mockResolvedValue({
        restaurants: mockRestaurants,
      });

      const { result } = renderHook(() => useHistoryMenuActions(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.handleMenuClick('김치찌개');
      });

      await act(async () => {
        await result.current.handleSearch();
      });

      await waitFor(() => {
        expect(result.current.restaurants).toEqual(mockRestaurants);
      });

      act(() => {
        result.current.resetSearchResults();
      });

      expect(result.current.restaurants).toEqual([]);
    });
  });
});
