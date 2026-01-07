import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useHistoryAiRecommendations } from '@/hooks/history/useHistoryAiRecommendations';
import { menuService } from '@/api/services/menu';
import { useUserLocation } from '@/hooks/map/useUserLocation';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppSelector } from '@/store/hooks';
import type { RecommendationHistoryItem } from '@/types/user';
import { AxiosError } from 'axios';

vi.mock('@/api/services/menu');
vi.mock('@/hooks/map/useUserLocation');
vi.mock('@/hooks/useErrorHandler');
vi.mock('@/store/hooks');

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

  describe('handleAiRecommend', () => {
    it('should show error when not authenticated', async () => {
      vi.mocked(useAppSelector).mockReturnValue(false); // Not authenticated

      const { result } = renderHook(() =>
        useHistoryAiRecommendations({ historyItem: mockHistoryItem })
      );

      await act(async () => {
        await result.current.handleAiRecommend('피자');
      });

      expect(mockHandleError).toHaveBeenCalledWith('로그인이 필요합니다.', 'HistoryAiRecommendations');
    });

    it('should show error when no address or location is available', async () => {
      vi.mocked(useUserLocation).mockReturnValue({
        latitude: null,
        longitude: null,
        address: '',
        isLoading: false,
        error: null,
        retryLoadLocation: vi.fn(),
      });

      const historyItemWithoutAddress: RecommendationHistoryItem = {
        ...mockHistoryItem,
        requestAddress: '',
      };

      const { result } = renderHook(() =>
        useHistoryAiRecommendations({ historyItem: historyItemWithoutAddress })
      );

      await act(async () => {
        await result.current.handleAiRecommend('피자');
      });

      expect(mockHandleError).toHaveBeenCalledWith(
        'AI 추천을 사용하려면 주소 또는 위치 정보가 필요합니다.',
        'HistoryAiRecommendations'
      );
    });

    it('should successfully get AI recommendations with address', async () => {
      const mockRecommendations = [
        {
          placeId: 'places/abc123',
          name: '맛있는 피자집',
          reason: '리뷰가 좋습니다',
        },
        {
          placeId: 'places/def456',
          name: '유명한 피자집',
          reason: '인기가 많습니다',
        },
      ];

      vi.mocked(menuService.recommendPlaces).mockResolvedValue({
        recommendations: mockRecommendations,
      });

      const { result } = renderHook(() =>
        useHistoryAiRecommendations({ historyItem: mockHistoryItem })
      );

      await act(async () => {
        await result.current.handleAiRecommend('피자');
      });

      expect(menuService.recommendPlaces).toHaveBeenCalledWith({
        query: '서울시 강남구 피자',
        historyId: 1,
        menuName: '피자',
      });

      expect(result.current.aiRecommendations).toEqual([
        {
          placeId: 'abc123',
          name: '맛있는 피자집',
          reason: '리뷰가 좋습니다',
          menuName: '피자',
        },
        {
          placeId: 'def456',
          name: '유명한 피자집',
          reason: '인기가 많습니다',
          menuName: '피자',
        },
      ]);
      expect(result.current.isAiLoading).toBe(false);
    });

    it('should use latitude/longitude when address is not available', async () => {
      vi.mocked(useUserLocation).mockReturnValue({
        latitude: 37.123,
        longitude: 127.456,
        address: '', // No address
        isLoading: false,
        error: null,
        retryLoadLocation: vi.fn(),
      });

      const mockRecommendations = [
        {
          placeId: 'places/abc123',
          name: '맛있는 피자집',
          reason: '리뷰가 좋습니다',
        },
      ];

      vi.mocked(menuService.recommendPlaces).mockResolvedValue({
        recommendations: mockRecommendations,
      });

      const historyItemWithoutAddress: RecommendationHistoryItem = {
        ...mockHistoryItem,
        requestAddress: '',
      };

      const { result } = renderHook(() =>
        useHistoryAiRecommendations({ historyItem: historyItemWithoutAddress })
      );

      await act(async () => {
        await result.current.handleAiRecommend('피자');
      });

      expect(menuService.recommendPlaces).toHaveBeenCalledWith({
        query: '37.123,127.456 피자',
        historyId: 1,
        menuName: '피자',
      });
    });

    it('should show error when no recommendations are found', async () => {
      vi.mocked(menuService.recommendPlaces).mockResolvedValue({
        recommendations: [],
      });

      const { result } = renderHook(() =>
        useHistoryAiRecommendations({ historyItem: mockHistoryItem })
      );

      await act(async () => {
        await result.current.handleAiRecommend('피자');
      });

      expect(result.current.aiRecommendations).toEqual([]);
      expect(mockHandleError).toHaveBeenCalledWith('AI 추천 결과가 없습니다.', 'HistoryAiRecommendations');
    });

    it('should load stored recommendations when 400 error occurs', async () => {
      const axiosError = new AxiosError('Bad Request');
      axiosError.response = {
        status: 400,
        data: {},
        statusText: 'Bad Request',
        headers: {},
        config: {
          headers: {} as unknown,
        } as AxiosError['response']['config'],
      };

      vi.mocked(menuService.recommendPlaces).mockRejectedValue(axiosError);
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
        ],
      });

      const { result } = renderHook(() =>
        useHistoryAiRecommendations({ historyItem: mockHistoryItem })
      );

      await act(async () => {
        await result.current.handleAiRecommend('피자');
      });

      await waitFor(() => {
        expect(menuService.getPlaceRecommendationsByHistoryId).toHaveBeenCalledWith(1);
        expect(result.current.aiRecommendations).toEqual([
          {
            placeId: 'stored123',
            name: '저장된 피자집',
            reason: '이전에 추천받았습니다',
            menuName: '피자',
          },
        ]);
      });
    });

    it('should handle generic error', async () => {
      const error = new Error('Network error');
      vi.mocked(menuService.recommendPlaces).mockRejectedValue(error);

      const { result } = renderHook(() =>
        useHistoryAiRecommendations({ historyItem: mockHistoryItem })
      );

      await act(async () => {
        await result.current.handleAiRecommend('피자');
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, 'HistoryAiRecommendations');
      expect(result.current.isAiLoading).toBe(false);
    });

    it('should set loading state during recommendation', async () => {
      let resolveRecommendation: (value: { recommendations: unknown[] }) => void;
      const recommendationPromise = new Promise<{ recommendations: unknown[] }>((resolve) => {
        resolveRecommendation = resolve;
      });

      vi.mocked(menuService.recommendPlaces).mockReturnValue(recommendationPromise);

      const { result } = renderHook(() =>
        useHistoryAiRecommendations({ historyItem: mockHistoryItem })
      );

      act(() => {
        result.current.handleAiRecommend('피자');
      });

      expect(result.current.isAiLoading).toBe(true);
      expect(result.current.aiLoadingMenu).toBe('피자');

      await act(async () => {
        resolveRecommendation!({ recommendations: [] });
        await recommendationPromise;
      });

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
        {
          placeId: 'stored123',
          name: '저장된 피자집',
          reason: '이전에 추천받았습니다',
          menuName: '피자',
        },
      ]);
      expect(mockHandleSuccess).toHaveBeenCalledWith('이미 추천받은 메뉴입니다. 저장된 결과를 보여드렸어요.');
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
        {
          placeId: 'abc123',
          name: '이름 없는 가게',
          reason: '',
          menuName: '피자',
        },
      ]);
    });
  });

  describe('resetAiRecommendations', () => {
    it('should reset all AI recommendations state', async () => {
      vi.mocked(menuService.recommendPlaces).mockResolvedValue({
        recommendations: [
          {
            placeId: 'places/abc123',
            name: '맛있는 피자집',
            reason: '리뷰가 좋습니다',
          },
        ],
      });

      const { result } = renderHook(() =>
        useHistoryAiRecommendations({ historyItem: mockHistoryItem })
      );

      await act(async () => {
        await result.current.handleAiRecommend('피자');
      });

      expect(result.current.aiRecommendations.length).toBeGreaterThan(0);

      act(() => {
        result.current.resetAiRecommendations();
      });

      expect(result.current.aiRecommendations).toEqual([]);
      expect(result.current.aiLoadingMenu).toBe(null);
    });
  });
});
