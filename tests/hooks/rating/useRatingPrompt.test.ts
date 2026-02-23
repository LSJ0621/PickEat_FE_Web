/**
 * useRatingPrompt Hook 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRatingPrompt } from '@/hooks/rating/useRatingPrompt';
import { ratingService } from '@/api/services/rating';
import { STORAGE_KEYS } from '@/utils/constants';

vi.mock('@/api/services/rating');

describe('useRatingPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('초기 상태', () => {
    it('should initialize with null pendingRating', () => {
      const { result } = renderHook(() => useRatingPrompt());

      expect(result.current.pendingRating).toBeNull();
    });

    it('should initialize with isModalOpen false', () => {
      const { result } = renderHook(() => useRatingPrompt());

      expect(result.current.isModalOpen).toBe(false);
    });

    it('should initialize with isSubmitting false', () => {
      const { result } = renderHook(() => useRatingPrompt());

      expect(result.current.isSubmitting).toBe(false);
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useRatingPrompt());

      expect(typeof result.current.checkPendingRating).toBe('function');
      expect(typeof result.current.submitRating).toBe('function');
      expect(typeof result.current.skipPlace).toBe('function');
      expect(typeof result.current.dismissForSession).toBe('function');
    });
  });

  describe('checkPendingRating', () => {
    it('should not check if dismissed flag is set', async () => {
      sessionStorage.setItem(STORAGE_KEYS.RATING_PROMPT_DISMISSED, 'true');

      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.checkPendingRating();
      });

      expect(ratingService.getPendingRating).not.toHaveBeenCalled();
      expect(result.current.pendingRating).toBeNull();
      expect(result.current.isModalOpen).toBe(false);
    });

    it('should set pendingRating and open modal when rating exists', async () => {
      const mockPendingRating = {
        id: 1,
        placeName: 'Test Restaurant',
        visitedAt: '2025-01-01T12:00:00Z',
      };

      vi.mocked(ratingService.getPendingRating).mockResolvedValue(mockPendingRating);

      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.checkPendingRating();
      });

      await waitFor(() => {
        expect(result.current.pendingRating).toEqual(mockPendingRating);
        expect(result.current.isModalOpen).toBe(true);
      });
    });

    it('should not open modal when no pending rating', async () => {
      vi.mocked(ratingService.getPendingRating).mockResolvedValue(null);

      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.checkPendingRating();
      });

      await waitFor(() => {
        expect(result.current.pendingRating).toBeNull();
        expect(result.current.isModalOpen).toBe(false);
      });
    });

    it('should handle API error silently', async () => {
      vi.mocked(ratingService.getPendingRating).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.checkPendingRating();
      });

      await waitFor(() => {
        expect(result.current.pendingRating).toBeNull();
        expect(result.current.isModalOpen).toBe(false);
      });
    });
  });

  describe('submitRating', () => {
    it('should submit rating successfully', async () => {
      const mockPendingRating = {
        id: 1,
        placeName: 'Test Restaurant',
        visitedAt: '2025-01-01T12:00:00Z',
      };

      vi.mocked(ratingService.getPendingRating).mockResolvedValue(mockPendingRating);
      vi.mocked(ratingService.submitRating).mockResolvedValue(undefined);

      const { result } = renderHook(() => useRatingPrompt());

      // Set up pending rating through proper flow
      await act(async () => {
        await result.current.checkPendingRating();
      });

      let submitResult: boolean = false;

      await act(async () => {
        submitResult = await result.current.submitRating(5);
      });

      expect(submitResult).toBe(true);
      expect(ratingService.submitRating).toHaveBeenCalledWith({
        placeRatingId: 1,
        rating: 5,
      });
      expect(result.current.isModalOpen).toBe(false);
      expect(result.current.pendingRating).toBeNull();
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should return false when no pendingRating', async () => {
      const { result } = renderHook(() => useRatingPrompt());

      let submitResult: boolean = true;

      await act(async () => {
        submitResult = await result.current.submitRating(5);
      });

      expect(submitResult).toBe(false);
      expect(ratingService.submitRating).not.toHaveBeenCalled();
    });

    it('should return false on API error', async () => {
      const mockPendingRating = {
        id: 1,
        placeName: 'Test Restaurant',
        visitedAt: '2025-01-01T12:00:00Z',
      };

      vi.mocked(ratingService.getPendingRating).mockResolvedValue(mockPendingRating);
      vi.mocked(ratingService.submitRating).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.checkPendingRating();
      });

      let submitResult: boolean = true;

      await act(async () => {
        submitResult = await result.current.submitRating(5);
      });

      expect(submitResult).toBe(false);
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('skipPlace', () => {
    it('should skip place successfully', async () => {
      const mockPendingRating = {
        id: 1,
        placeName: 'Test Restaurant',
        visitedAt: '2025-01-01T12:00:00Z',
      };

      vi.mocked(ratingService.getPendingRating).mockResolvedValue(mockPendingRating);
      vi.mocked(ratingService.skipRating).mockResolvedValue(undefined);

      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.checkPendingRating();
      });

      await act(async () => {
        await result.current.skipPlace();
      });

      expect(ratingService.skipRating).toHaveBeenCalledWith({
        placeRatingId: 1,
      });
      expect(result.current.isModalOpen).toBe(false);
      expect(result.current.pendingRating).toBeNull();
    });

    it('should handle API error silently', async () => {
      const mockPendingRating = {
        id: 1,
        placeName: 'Test Restaurant',
        visitedAt: '2025-01-01T12:00:00Z',
      };

      vi.mocked(ratingService.getPendingRating).mockResolvedValue(mockPendingRating);
      vi.mocked(ratingService.skipRating).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.checkPendingRating();
      });

      await act(async () => {
        await result.current.skipPlace();
      });

      expect(result.current.isModalOpen).toBe(false);
      expect(result.current.pendingRating).toBeNull();
    });

    it('should do nothing when no pendingRating', async () => {
      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.skipPlace();
      });

      expect(ratingService.skipRating).not.toHaveBeenCalled();
    });
  });

  describe('dismissForSession', () => {
    it('should set dismissed flag in sessionStorage', () => {
      const { result } = renderHook(() => useRatingPrompt());

      act(() => {
        result.current.dismissForSession();
      });

      expect(sessionStorage.getItem(STORAGE_KEYS.RATING_PROMPT_DISMISSED)).toBe('true');
    });

    it('should close modal', async () => {
      const mockPendingRating = {
        id: 1,
        placeName: 'Test Restaurant',
        visitedAt: '2025-01-01T12:00:00Z',
      };

      vi.mocked(ratingService.getPendingRating).mockResolvedValue(mockPendingRating);

      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.checkPendingRating();
      });

      expect(result.current.isModalOpen).toBe(true);

      act(() => {
        result.current.dismissForSession();
      });

      expect(result.current.isModalOpen).toBe(false);
    });
  });

  describe('실제 사용 시나리오', () => {
    it('should handle complete rating flow', async () => {
      const mockPendingRating = {
        id: 1,
        placeName: 'Test Restaurant',
        visitedAt: '2025-01-01T12:00:00Z',
      };

      vi.mocked(ratingService.getPendingRating).mockResolvedValue(mockPendingRating);
      vi.mocked(ratingService.submitRating).mockResolvedValue(undefined);

      const { result } = renderHook(() => useRatingPrompt());

      // App loads, check for pending rating
      await act(async () => {
        await result.current.checkPendingRating();
      });

      await waitFor(() => {
        expect(result.current.pendingRating).toEqual(mockPendingRating);
        expect(result.current.isModalOpen).toBe(true);
      });

      // User submits rating
      await act(async () => {
        await result.current.submitRating(5);
      });

      await waitFor(() => {
        expect(result.current.isModalOpen).toBe(false);
        expect(result.current.pendingRating).toBeNull();
      });
    });

    it('should handle user skipping the place', async () => {
      const mockPendingRating = {
        id: 1,
        placeName: 'Test Restaurant',
        visitedAt: '2025-01-01T12:00:00Z',
      };

      vi.mocked(ratingService.getPendingRating).mockResolvedValue(mockPendingRating);
      vi.mocked(ratingService.skipRating).mockResolvedValue(undefined);

      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.checkPendingRating();
      });

      await waitFor(() => {
        expect(result.current.isModalOpen).toBe(true);
      });

      // User clicks "didn't visit"
      await act(async () => {
        await result.current.skipPlace();
      });

      await waitFor(() => {
        expect(result.current.isModalOpen).toBe(false);
        expect(result.current.pendingRating).toBeNull();
      });
    });

    it('should handle user dismissing for session', async () => {
      const mockPendingRating = {
        id: 1,
        placeName: 'Test Restaurant',
        visitedAt: '2025-01-01T12:00:00Z',
      };

      vi.mocked(ratingService.getPendingRating).mockResolvedValue(mockPendingRating);

      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.checkPendingRating();
      });

      await waitFor(() => {
        expect(result.current.isModalOpen).toBe(true);
      });

      // User dismisses modal
      act(() => {
        result.current.dismissForSession();
      });

      expect(result.current.isModalOpen).toBe(false);
      expect(sessionStorage.getItem(STORAGE_KEYS.RATING_PROMPT_DISMISSED)).toBe('true');

      // Should not check again in same session
      await act(async () => {
        await result.current.checkPendingRating();
      });

      expect(result.current.isModalOpen).toBe(false);
    });
  });

  describe('함수 안정성', () => {
    it('should maintain function references across re-renders', () => {
      const { result, rerender } = renderHook(() => useRatingPrompt());

      const checkPendingRatingRef = result.current.checkPendingRating;
      const dismissForSessionRef = result.current.dismissForSession;

      rerender();

      expect(result.current.checkPendingRating).toBe(checkPendingRatingRef);
      expect(result.current.dismissForSession).toBe(dismissForSessionRef);
    });
  });
});
