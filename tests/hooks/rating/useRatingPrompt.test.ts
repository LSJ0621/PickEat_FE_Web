/**
 * useRatingPrompt Hook 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRatingPrompt } from '@features/rating/hooks/useRatingPrompt';
import { ratingService } from '@features/rating/api';
import { STORAGE_KEYS } from '@shared/utils/constants';

vi.mock('@features/rating/api');

describe('useRatingPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
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
      expect(typeof result.current.skipPlace).toBe('function');
      expect(typeof result.current.dismissRating).toBe('function');
      expect(typeof result.current.dismissPermanently).toBe('function');
      expect(typeof result.current.goToHistory).toBe('function');
    });
  });

  describe('checkPendingRating', () => {
    it('should not check if neverShow flag is set in localStorage', async () => {
      localStorage.setItem(STORAGE_KEYS.RATING_PROMPT_NEVER_SHOW, 'true');

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

    it('should handle API error silently and still close modal', async () => {
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

  describe('dismissRating', () => {
    it('should call dismissRating API and close modal', async () => {
      const mockPendingRating = {
        id: 1,
        placeName: 'Test Restaurant',
        visitedAt: '2025-01-01T12:00:00Z',
      };

      vi.mocked(ratingService.getPendingRating).mockResolvedValue(mockPendingRating);
      vi.mocked(ratingService.dismissRating).mockResolvedValue(undefined);

      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.checkPendingRating();
      });

      await act(async () => {
        await result.current.dismissRating();
      });

      expect(ratingService.dismissRating).toHaveBeenCalledWith({
        placeRatingId: 1,
      });
      expect(result.current.isModalOpen).toBe(false);
      expect(result.current.pendingRating).toBeNull();
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should do nothing when no pendingRating', async () => {
      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.dismissRating();
      });

      expect(ratingService.dismissRating).not.toHaveBeenCalled();
    });

    it('should handle API error silently', async () => {
      const mockPendingRating = {
        id: 1,
        placeName: 'Test Restaurant',
        visitedAt: '2025-01-01T12:00:00Z',
      };

      vi.mocked(ratingService.getPendingRating).mockResolvedValue(mockPendingRating);
      vi.mocked(ratingService.dismissRating).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.checkPendingRating();
      });

      await act(async () => {
        await result.current.dismissRating();
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('dismissPermanently', () => {
    it('should set neverShow flag in localStorage', () => {
      const { result } = renderHook(() => useRatingPrompt());

      act(() => {
        result.current.dismissPermanently();
      });

      expect(localStorage.getItem(STORAGE_KEYS.RATING_PROMPT_NEVER_SHOW)).toBe('true');
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
        result.current.dismissPermanently();
      });

      expect(result.current.isModalOpen).toBe(false);
    });

    it('should clear pendingRating', async () => {
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

      act(() => {
        result.current.dismissPermanently();
      });

      expect(result.current.pendingRating).toBeNull();
    });

    it('should prevent future checkPendingRating calls', async () => {
      vi.mocked(ratingService.getPendingRating).mockResolvedValue({
        id: 1,
        placeName: 'Test Restaurant',
        visitedAt: '2025-01-01T12:00:00Z',
      });

      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.checkPendingRating();
      });

      expect(result.current.isModalOpen).toBe(true);

      act(() => {
        result.current.dismissPermanently();
      });

      expect(result.current.isModalOpen).toBe(false);

      // Subsequent checks should be skipped
      await act(async () => {
        await result.current.checkPendingRating();
      });

      expect(result.current.isModalOpen).toBe(false);
    });
  });

  describe('goToHistory', () => {
    it('should close modal without API call', async () => {
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
        result.current.goToHistory();
      });

      expect(result.current.isModalOpen).toBe(false);
      // pendingRating should remain (not cleared)
      expect(result.current.pendingRating).toEqual(mockPendingRating);
    });
  });

  describe('실제 사용 시나리오', () => {
    it('should handle complete flow: check -> skip', async () => {
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
        expect(result.current.pendingRating).toEqual(mockPendingRating);
        expect(result.current.isModalOpen).toBe(true);
      });

      await act(async () => {
        await result.current.skipPlace();
      });

      await waitFor(() => {
        expect(result.current.isModalOpen).toBe(false);
        expect(result.current.pendingRating).toBeNull();
      });
    });

    it('should handle complete flow: check -> dismiss', async () => {
      const mockPendingRating = {
        id: 1,
        placeName: 'Test Restaurant',
        visitedAt: '2025-01-01T12:00:00Z',
      };

      vi.mocked(ratingService.getPendingRating).mockResolvedValue(mockPendingRating);
      vi.mocked(ratingService.dismissRating).mockResolvedValue(undefined);

      const { result } = renderHook(() => useRatingPrompt());

      await act(async () => {
        await result.current.checkPendingRating();
      });

      await waitFor(() => {
        expect(result.current.isModalOpen).toBe(true);
      });

      await act(async () => {
        await result.current.dismissRating();
      });

      await waitFor(() => {
        expect(result.current.isModalOpen).toBe(false);
        expect(result.current.pendingRating).toBeNull();
      });
    });
  });

  describe('함수 안정성', () => {
    it('should maintain function references across re-renders', () => {
      const { result, rerender } = renderHook(() => useRatingPrompt());

      const checkPendingRatingRef = result.current.checkPendingRating;
      const dismissPermanentlyRef = result.current.dismissPermanently;

      rerender();

      expect(result.current.checkPendingRating).toBe(checkPendingRatingRef);
      expect(result.current.dismissPermanently).toBe(dismissPermanentlyRef);
    });
  });
});
