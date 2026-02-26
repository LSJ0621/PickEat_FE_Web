import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistoryAiRecommendations } from '@features/history/hooks/useHistoryAiRecommendations';
import { menuService } from '@features/agent/api';
import { useUserLocation } from '@features/map/hooks/useUserLocation';
import { useErrorHandler } from '@shared/hooks/useErrorHandler';
import { useAppSelector } from '@app/store/hooks';
import type { RecommendationHistoryItem } from '@features/user/types';

vi.mock('@features/agent/api');
vi.mock('@features/map/hooks/useUserLocation');
vi.mock('@shared/hooks/useErrorHandler');
vi.mock('@app/store/hooks');

describe('useHistoryAiRecommendations', () => {
  const mockHistoryItem: RecommendationHistoryItem = {
    id: 1,
    recommendations: ['치킨'],
    prompt: '치킨 추천해줘',
    reason: '한식',
    recommendedAt: '2024-01-01T00:00:00.000Z',
    requestAddress: '서울시 강남구',
    hasPlaceRecommendations: true,
  };

  const mockHandleError = vi.fn();
  const mockHandleSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useUserLocation).mockReturnValue({
      latitude: 37.123,
      longitude: 127.456,
      address: '서울시 강남구',
      isLoading: false,
      error: null,
      retryLoadLocation: vi.fn(),
    });

    vi.mocked(useErrorHandler).mockReturnValue({
      handleError: mockHandleError,
      handleSuccess: mockHandleSuccess,
    });

    vi.mocked(useAppSelector).mockReturnValue(true); // isAuthenticated
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() =>
        useHistoryAiRecommendations({ historyItem: mockHistoryItem })
      );

      expect(result.current.aiRecommendations).toEqual([]);
      expect(result.current.isAiLoading).toBe(false);
      expect(result.current.aiLoadingMenu).toBe(null);
    });
  });

  describe('loadStoredAiRecommendations', () => {
    it('should load stored recommendations successfully', async () => {
      vi.mocked(menuService.getPlaceRecommendationsByHistoryId).mockResolvedValue({
        history: {
          id: 1,
          type: 'MENU',
          prompt: '치킨 추천해줘',
          reason: '한식',
          recommendedAt: '2024-01-01T00:00:00.000Z',
          requestAddress: '서울시 강남구',
          hasPlaceRecommendations: true,
        },
        places: [
          {
            menuName: '피자',
            placeId: 'places/stored123',
            reason: '이전에 추천받았습니다',
            name: '저장된 피자집',
            address: '서울시 강남구',
            rating: 4.5,
            userRatingCount: 100,
            priceLevel: 'MODERATE',
            photos: null,
            openNow: true,
            reviews: null,
          },
          {
            menuName: '치킨',
            placeId: 'places/stored456',
            reason: '다른 메뉴',
            name: '저장된 치킨집',
            address: '서울시 강남구',
            rating: 4.3,
            userRatingCount: 80,
            priceLevel: 'MODERATE',
            photos: null,
            openNow: true,
            reviews: null,
          },
        ],
      });

      const { result } = renderHook(() =>
        useHistoryAiRecommendations({ historyItem: mockHistoryItem })
      );

      await act(async () => {
        await result.current.loadStoredAiRecommendations('피자');
      });

      expect(result.current.aiRecommendations).toEqual([
        expect.objectContaining({
          placeId: 'stored123',
          name: '저장된 피자집',
          reason: '이전에 추천받았습니다',
          menuName: '피자',
        }),
      ]);
      expect(mockHandleSuccess).toHaveBeenCalledWith('toast.ai.showingSavedRecommendation');
    });

    it('should show error when no stored recommendations are found', async () => {
      vi.mocked(menuService.getPlaceRecommendationsByHistoryId).mockResolvedValue({
        history: {
          id: 1,
          type: 'MENU',
          prompt: '치킨 추천해줘',
          reason: '한식',
          recommendedAt: '2024-01-01T00:00:00.000Z',
          requestAddress: '서울시 강남구',
          hasPlaceRecommendations: false,
        },
        places: [],
      });

      const { result } = renderHook(() =>
        useHistoryAiRecommendations({ historyItem: mockHistoryItem })
      );

      await act(async () => {
        await result.current.loadStoredAiRecommendations('피자');
      });

      expect(result.current.aiRecommendations).toEqual([]);
      expect(mockHandleError).toHaveBeenCalledWith('저장된 AI 추천 결과가 없습니다.', 'HistoryAiRecommendations');
    });

    it('should handle silent mode without showing messages', async () => {
      vi.mocked(menuService.getPlaceRecommendationsByHistoryId).mockResolvedValue({
        history: {
          id: 1,
          type: 'MENU',
          prompt: '치킨 추천해줘',
          reason: '한식',
          recommendedAt: '2024-01-01T00:00:00.000Z',
          requestAddress: '서울시 강남구',
          hasPlaceRecommendations: false,
        },
        places: [],
      });

      const { result } = renderHook(() =>
        useHistoryAiRecommendations({ historyItem: mockHistoryItem })
      );

      await act(async () => {
        await result.current.loadStoredAiRecommendations('피자', { silent: true });
      });

      expect(mockHandleError).not.toHaveBeenCalled();
      expect(mockHandleSuccess).not.toHaveBeenCalled();
    });

    it('should handle error in silent mode', async () => {
      const error = new Error('Database error');
      vi.mocked(menuService.getPlaceRecommendationsByHistoryId).mockRejectedValue(error);

      const { result } = renderHook(() =>
        useHistoryAiRecommendations({ historyItem: mockHistoryItem })
      );

      await act(async () => {
        await result.current.loadStoredAiRecommendations('피자', { silent: true });
      });

      expect(mockHandleError).not.toHaveBeenCalled();
    });

    it('should handle error in non-silent mode', async () => {
      const error = new Error('Database error');
      vi.mocked(menuService.getPlaceRecommendationsByHistoryId).mockRejectedValue(error);

      const { result } = renderHook(() =>
        useHistoryAiRecommendations({ historyItem: mockHistoryItem })
      );

      await act(async () => {
        await result.current.loadStoredAiRecommendations('피자');
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, 'HistoryAiRecommendations');
    });

    it('should normalize place names when null', async () => {
      vi.mocked(menuService.getPlaceRecommendationsByHistoryId).mockResolvedValue({
        history: {
          id: 1,
          type: 'MENU',
          prompt: '치킨 추천해줘',
          reason: '한식',
          recommendedAt: '2024-01-01T00:00:00.000Z',
          requestAddress: '서울시 강남구',
          hasPlaceRecommendations: true,
        },
        places: [
          {
            menuName: '피자',
            placeId: 'places/abc123',
            reason: null,
            name: null,
            address: null,
            rating: null,
            userRatingCount: null,
            priceLevel: null,
            photos: null,
            openNow: null,
            reviews: null,
          },
        ],
      });

      const { result } = renderHook(() =>
        useHistoryAiRecommendations({ historyItem: mockHistoryItem })
      );

      await act(async () => {
        await result.current.loadStoredAiRecommendations('피자');
      });

      expect(result.current.aiRecommendations).toEqual([
        expect.objectContaining({
          placeId: 'abc123',
          name: '이름 없는 가게',
          reason: '',
          menuName: '피자',
        }),
      ]);
    });
  });

});
