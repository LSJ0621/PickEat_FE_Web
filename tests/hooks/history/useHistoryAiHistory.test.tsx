/**
 * Tests for useHistoryAiHistory hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useHistoryAiHistory } from '@/hooks/history/useHistoryAiHistory';
import { menuService } from '@/api/services/menu';
import { createMockRecommendationHistory, createAuthenticatedState } from '@tests/factories/user';
import { createMockPlaceHistory } from '@tests/factories/menu';
import { setupStore, createWrapper as createTestWrapper } from '@tests/utils/renderWithProviders';
import { ToastProvider } from '@/components/common/ToastProvider';
import type { ReactNode } from 'react';
import type { PlaceHistoryResponse } from '@/types/menu';

vi.mock('@/api/services/menu');

describe('useHistoryAiHistory', () => {
  const mockHistoryItem = createMockRecommendationHistory();

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
      const { result } = renderHook(
        () => useHistoryAiHistory({ historyItem: mockHistoryItem }),
        { wrapper: createWrapper() }
      );

      expect(result.current.showAiHistory).toBe(false);
      expect(result.current.aiHistoryRecommendations).toEqual([]);
      expect(result.current.isAiHistoryLoading).toBe(false);
      expect(result.current.groupedAiHistory).toEqual([]);
    });
  });

  describe('handleShowAiHistory', () => {
    it('should handle error when user is not authenticated', async () => {
      const { result } = renderHook(
        () => useHistoryAiHistory({ historyItem: mockHistoryItem }),
        { wrapper: createWrapper(false) }
      );

      await waitFor(async () => {
        await result.current.handleShowAiHistory();
      });

      expect(result.current.showAiHistory).toBe(false);
      expect(menuService.getPlaceRecommendationsByHistoryId).not.toHaveBeenCalled();
    });

    it('should handle error when history item has no place recommendations', async () => {
      const itemWithoutRecommendations = createMockRecommendationHistory({
        hasPlaceRecommendations: false,
      });

      const { result } = renderHook(
        () => useHistoryAiHistory({ historyItem: itemWithoutRecommendations }),
        { wrapper: createWrapper() }
      );

      await waitFor(async () => {
        await result.current.handleShowAiHistory();
      });

      expect(result.current.showAiHistory).toBe(false);
      expect(menuService.getPlaceRecommendationsByHistoryId).not.toHaveBeenCalled();
    });

    it('should toggle AI history when already open', async () => {
      const mockResponse = createMockPlaceHistory(3);
      vi.mocked(menuService.getPlaceRecommendationsByHistoryId).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useHistoryAiHistory({ historyItem: mockHistoryItem }),
        { wrapper: createWrapper() }
      );

      // 첫 번째 호출: 열기
      await act(async () => {
        await result.current.handleShowAiHistory();
      });

      await waitFor(() => {
        expect(result.current.showAiHistory).toBe(true);
        expect(result.current.aiHistoryRecommendations.length).toBeGreaterThan(0);
      });

      // 두 번째 호출: 닫기 (토글)
      await act(async () => {
        await result.current.handleShowAiHistory();
      });

      expect(result.current.showAiHistory).toBe(false);
    });

    it('should fetch and normalize AI history recommendations', async () => {
      const mockResponse: PlaceHistoryResponse = {
        history: {
          id: 1,
          type: 'MENU',
          prompt: '점심 메뉴 추천해줘',
          reason: '한식 중심의 메뉴',
          recommendedAt: '2024-01-15T12:00:00.000Z',
          requestAddress: '서울시 강남구',
          hasPlaceRecommendations: true,
        },
        places: [
          {
            menuName: '김치찌개',
            placeId: 'places/ChIJ1234567890',
            reason: '맛집입니다',
            name: '명동 김치찌개',
            address: '서울시 중구',
            rating: 4.5,
            userRatingCount: 100,
            priceLevel: 'MODERATE',
            photos: [],
            openNow: true,
            reviews: [],
          },
        ],
      };

      vi.mocked(menuService.getPlaceRecommendationsByHistoryId).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useHistoryAiHistory({ historyItem: mockHistoryItem }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.handleShowAiHistory();
      });

      await waitFor(() => {
        expect(result.current.isAiHistoryLoading).toBe(false);
      });

      expect(menuService.getPlaceRecommendationsByHistoryId).toHaveBeenCalledWith(mockHistoryItem.id);
      expect(result.current.showAiHistory).toBe(true);
      expect(result.current.aiHistoryRecommendations).toHaveLength(1);
      expect(result.current.aiHistoryRecommendations[0]).toEqual({
        placeId: 'ChIJ1234567890',
        name: '명동 김치찌개',
        reason: '맛집입니다',
        menuName: '김치찌개',
      });
    });

    it('should handle placeId normalization without places/ prefix', async () => {
      const mockResponse: PlaceHistoryResponse = {
        history: {
          id: 1,
          type: 'MENU',
          prompt: '점심',
          reason: '한식',
          recommendedAt: '2024-01-15T12:00:00.000Z',
          requestAddress: '서울시',
          hasPlaceRecommendations: true,
        },
        places: [
          {
            menuName: '김치찌개',
            placeId: 'ChIJ1234567890',
            reason: '맛집',
            name: '맛집',
            address: '서울시',
            rating: 4.5,
            userRatingCount: 100,
            priceLevel: 'MODERATE',
            photos: [],
            openNow: true,
            reviews: [],
          },
        ],
      };

      vi.mocked(menuService.getPlaceRecommendationsByHistoryId).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useHistoryAiHistory({ historyItem: mockHistoryItem }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.handleShowAiHistory();
      });

      await waitFor(() => {
        expect(result.current.aiHistoryRecommendations[0]?.placeId).toBe('ChIJ1234567890');
      });
    });

    it('should handle missing name with default value', async () => {
      const mockResponse: PlaceHistoryResponse = {
        history: {
          id: 1,
          type: 'MENU',
          prompt: '점심',
          reason: '한식',
          recommendedAt: '2024-01-15T12:00:00.000Z',
          requestAddress: '서울시',
          hasPlaceRecommendations: true,
        },
        places: [
          {
            menuName: '김치찌개',
            placeId: 'ChIJ1234567890',
            reason: '맛집',
            name: null,
            address: '서울시',
            rating: 4.5,
            userRatingCount: 100,
            priceLevel: 'MODERATE',
            photos: [],
            openNow: true,
            reviews: [],
          },
        ],
      };

      vi.mocked(menuService.getPlaceRecommendationsByHistoryId).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useHistoryAiHistory({ historyItem: mockHistoryItem }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.handleShowAiHistory();
      });

      await waitFor(() => {
        expect(result.current.aiHistoryRecommendations[0]?.name).toBe('이름 없는 가게');
      });
    });

    it('should handle empty recommendations', async () => {
      const mockResponse: PlaceHistoryResponse = {
        history: {
          id: 1,
          type: 'MENU',
          prompt: '점심',
          reason: '한식',
          recommendedAt: '2024-01-15T12:00:00.000Z',
          requestAddress: '서울시',
          hasPlaceRecommendations: true,
        },
        places: [],
      };

      vi.mocked(menuService.getPlaceRecommendationsByHistoryId).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useHistoryAiHistory({ historyItem: mockHistoryItem }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.handleShowAiHistory();
      });

      await waitFor(() => {
        expect(result.current.isAiHistoryLoading).toBe(false);
      });

      expect(result.current.showAiHistory).toBe(false);
      expect(result.current.aiHistoryRecommendations).toEqual([]);
    });

    it('should handle API error', async () => {
      vi.mocked(menuService.getPlaceRecommendationsByHistoryId).mockRejectedValue(
        new Error('API Error')
      );

      const { result } = renderHook(
        () => useHistoryAiHistory({ historyItem: mockHistoryItem }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.handleShowAiHistory();
      });

      await waitFor(() => {
        expect(result.current.isAiHistoryLoading).toBe(false);
      });

      expect(result.current.showAiHistory).toBe(false);
    });

    it('should set loading state correctly during fetch', async () => {
      const mockResponse = createMockPlaceHistory(3);
      vi.mocked(menuService.getPlaceRecommendationsByHistoryId).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockResponse), 100);
          })
      );

      const { result } = renderHook(
        () => useHistoryAiHistory({ historyItem: mockHistoryItem }),
        { wrapper: createWrapper() }
      );

      // Start the fetch without awaiting it
      let fetchPromise: Promise<void>;
      act(() => {
        fetchPromise = result.current.handleShowAiHistory();
      });

      // 로딩 중인 상태 확인
      await waitFor(() => {
        expect(result.current.isAiHistoryLoading).toBe(true);
      });

      // Now await the completion
      await act(async () => {
        await fetchPromise!;
      });

      // 로딩 완료 후 상태 확인
      await waitFor(() => {
        expect(result.current.isAiHistoryLoading).toBe(false);
      });
    });
  });

  describe('groupedAiHistory', () => {
    it('should group recommendations by menu name', async () => {
      const mockResponse: PlaceHistoryResponse = {
        history: {
          id: 1,
          type: 'MENU',
          prompt: '점심',
          reason: '한식',
          recommendedAt: '2024-01-15T12:00:00.000Z',
          requestAddress: '서울시',
          hasPlaceRecommendations: true,
        },
        places: [
          {
            menuName: '김치찌개',
            placeId: 'places/ChIJ1',
            reason: '맛집1',
            name: '맛집1',
            address: '서울시',
            rating: 4.5,
            userRatingCount: 100,
            priceLevel: 'MODERATE',
            photos: [],
            openNow: true,
            reviews: [],
          },
          {
            menuName: '김치찌개',
            placeId: 'places/ChIJ2',
            reason: '맛집2',
            name: '맛집2',
            address: '서울시',
            rating: 4.5,
            userRatingCount: 100,
            priceLevel: 'MODERATE',
            photos: [],
            openNow: true,
            reviews: [],
          },
          {
            menuName: '불고기',
            placeId: 'places/ChIJ3',
            reason: '맛집3',
            name: '맛집3',
            address: '서울시',
            rating: 4.5,
            userRatingCount: 100,
            priceLevel: 'MODERATE',
            photos: [],
            openNow: true,
            reviews: [],
          },
        ],
      };

      vi.mocked(menuService.getPlaceRecommendationsByHistoryId).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useHistoryAiHistory({ historyItem: mockHistoryItem }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.handleShowAiHistory();
      });

      await waitFor(() => {
        expect(result.current.groupedAiHistory).toHaveLength(2);
      });

      expect(result.current.groupedAiHistory[0].menuName).toBe('김치찌개');
      expect(result.current.groupedAiHistory[0].recommendations).toHaveLength(2);
      expect(result.current.groupedAiHistory[1].menuName).toBe('불고기');
      expect(result.current.groupedAiHistory[1].recommendations).toHaveLength(1);
    });

    it('should use default menu name when menuName is missing', async () => {
      const mockResponse: PlaceHistoryResponse = {
        history: {
          id: 1,
          type: 'MENU',
          prompt: '점심',
          reason: '한식',
          recommendedAt: '2024-01-15T12:00:00.000Z',
          requestAddress: '서울시',
          hasPlaceRecommendations: true,
        },
        places: [
          {
            menuName: '',
            placeId: 'places/ChIJ1',
            reason: '맛집',
            name: '맛집',
            address: '서울시',
            rating: 4.5,
            userRatingCount: 100,
            priceLevel: 'MODERATE',
            photos: [],
            openNow: true,
            reviews: [],
          },
        ],
      };

      vi.mocked(menuService.getPlaceRecommendationsByHistoryId).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useHistoryAiHistory({ historyItem: mockHistoryItem }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.handleShowAiHistory();
      });

      await waitFor(() => {
        expect(result.current.groupedAiHistory[0]?.menuName).toBe('선택한 메뉴');
      });
    });

    it('should return empty array when no recommendations', () => {
      const { result } = renderHook(
        () => useHistoryAiHistory({ historyItem: mockHistoryItem }),
        { wrapper: createWrapper() }
      );

      expect(result.current.groupedAiHistory).toEqual([]);
    });
  });
});
