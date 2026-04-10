/**
 * useRatingPrompt 테스트
 * RATING_NEVER_SHOW 플래그 / pending rating 모달 오픈 / dismissPermanently 영구 숨김 검증
 */

import { renderHook, act } from '@testing-library/react';
import { useRatingPrompt } from '@features/rating/hooks/useRatingPrompt';
import * as ratingApi from '@features/rating/api';
import { STORAGE_KEYS } from '@shared/utils/constants';
import type { PendingRating } from '@features/rating/types';

vi.mock('@features/rating/api', () => ({
  ratingService: {
    getPendingRating: vi.fn(),
    skipRating: vi.fn(),
    dismissRating: vi.fn(),
  },
}));

const mockGetPendingRating = vi.mocked(ratingApi.ratingService.getPendingRating);
const mockSkipRating = vi.mocked(ratingApi.ratingService.skipRating);

const mockPendingRating: PendingRating = {
  id: 1,
  placeId: 'place-123',
  placeName: '맛있는 식당',
  createdAt: '2024-06-15T12:00:00Z',
};

describe('useRatingPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('RATING_NEVER_SHOW 플래그 확인', () => {
    it('localStorage에 RATING_NEVER_SHOW 있으면 API 호출 안 함', async () => {
      localStorage.setItem(STORAGE_KEYS.RATING_PROMPT_NEVER_SHOW, 'true');

      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.checkPendingRating();
      });

      // 플래그가 있으므로 API 요청 없음
      expect(mockGetPendingRating).not.toHaveBeenCalled();
      // 모달도 열리지 않음
      expect(result.current.isModalOpen).toBe(false);
      expect(result.current.pendingRating).toBeNull();
    });

    it('RATING_NEVER_SHOW 없으면 API 호출함', async () => {
      mockGetPendingRating.mockResolvedValue(null);

      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.checkPendingRating();
      });

      expect(mockGetPendingRating).toHaveBeenCalledTimes(1);
    });
  });

  describe('pending rating 존재 시 모달 오픈', () => {
    it('pending rating 있으면 pendingRating 설정 + 모달 오픈', async () => {
      mockGetPendingRating.mockResolvedValue(mockPendingRating);

      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.checkPendingRating();
      });

      expect(result.current.pendingRating).toEqual(mockPendingRating);
      expect(result.current.isModalOpen).toBe(true);
    });

    it('pending rating null이면 모달 안 열림', async () => {
      mockGetPendingRating.mockResolvedValue(null);

      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.checkPendingRating();
      });

      expect(result.current.pendingRating).toBeNull();
      expect(result.current.isModalOpen).toBe(false);
    });

    it('API 실패 시 조용히 처리 — 모달 안 열림', async () => {
      mockGetPendingRating.mockRejectedValue(new Error('Network Error'));

      const { result } = renderHook(() => useRatingPrompt());

      // 에러가 throw되지 않아야 함
      await act(async () => {
        await result.current.checkPendingRating();
      });

      expect(result.current.isModalOpen).toBe(false);
      expect(result.current.pendingRating).toBeNull();
    });
  });

  describe('dismissPermanently — 영구 숨김', () => {
    it('dismissPermanently 호출 → localStorage에 NEVER_SHOW 플래그 저장', async () => {
      mockGetPendingRating.mockResolvedValue(mockPendingRating);

      const { result } = renderHook(() => useRatingPrompt());

      // 먼저 모달 열기
      await act(async () => {
        await result.current.checkPendingRating();
      });
      expect(result.current.isModalOpen).toBe(true);

      // 영구 숨김 처리
      act(() => {
        result.current.dismissPermanently();
      });

      // localStorage에 플래그 저장
      expect(localStorage.getItem(STORAGE_KEYS.RATING_PROMPT_NEVER_SHOW)).toBe('true');
    });

    it('dismissPermanently 호출 → 모달 닫힘 + pendingRating 초기화', async () => {
      mockGetPendingRating.mockResolvedValue(mockPendingRating);

      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.checkPendingRating();
      });

      act(() => {
        result.current.dismissPermanently();
      });

      expect(result.current.isModalOpen).toBe(false);
      expect(result.current.pendingRating).toBeNull();
    });

    it('dismissPermanently 후 checkPendingRating 재호출 → API 호출 안 함', async () => {
      mockGetPendingRating.mockResolvedValue(mockPendingRating);

      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.checkPendingRating();
      });

      act(() => {
        result.current.dismissPermanently();
      });

      // 다시 체크 — NEVER_SHOW 플래그가 있으므로 API 호출 안 함
      await act(async () => {
        await result.current.checkPendingRating();
      });

      // 최초 1회만 호출됨
      expect(mockGetPendingRating).toHaveBeenCalledTimes(1);
    });
  });

  describe('skipPlace', () => {
    it('skipPlace 호출 → API 호출 + 모달 닫힘', async () => {
      mockGetPendingRating.mockResolvedValue(mockPendingRating);
      mockSkipRating.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.checkPendingRating();
      });

      await act(async () => {
        await result.current.skipPlace();
      });

      expect(mockSkipRating).toHaveBeenCalledWith({ placeRatingId: mockPendingRating.id });
      expect(result.current.isModalOpen).toBe(false);
      expect(result.current.pendingRating).toBeNull();
    });

    it('skipPlace API 실패 시 조용히 처리 — 모달 닫힘 + pendingRating 초기화', async () => {
      // skipPlace의 setIsModalOpen(false) / setPendingRating(null)은 try/catch 밖에 위치하므로
      // API 실패 여부와 무관하게 상태가 초기화됨
      mockGetPendingRating.mockResolvedValue(mockPendingRating);
      mockSkipRating.mockRejectedValue(new Error('Network Error'));

      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.checkPendingRating();
      });

      // 에러가 throw되지 않아야 함
      await act(async () => {
        await result.current.skipPlace();
      });

      expect(result.current.isModalOpen).toBe(false);
      expect(result.current.pendingRating).toBeNull();
    });
  });

  describe('초기 상태', () => {
    it('초기값 — pendingRating null, isModalOpen false, isSubmitting false', () => {
      const { result } = renderHook(() => useRatingPrompt());

      expect(result.current.pendingRating).toBeNull();
      expect(result.current.isModalOpen).toBe(false);
      expect(result.current.isSubmitting).toBe(false);
    });
  });
});
