/**
 * useVerificationTimer Hook 테스트
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVerificationTimer } from '@/hooks/auth/useVerificationTimer';

describe('useVerificationTimer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('초기 상태', () => {
    it('should initialize with remaining 0', () => {
      const { result } = renderHook(() => useVerificationTimer());

      expect(result.current.remaining).toBe(0);
    });

    it('should provide start, stop, and reset functions', () => {
      const { result } = renderHook(() => useVerificationTimer());

      expect(typeof result.current.start).toBe('function');
      expect(typeof result.current.stop).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('start', () => {
    it('should set remaining time when start is called', () => {
      const { result } = renderHook(() => useVerificationTimer());

      act(() => {
        result.current.start(180);
      });

      expect(result.current.remaining).toBe(180);
    });

    it('should start timer countdown', () => {
      const { result } = renderHook(() => useVerificationTimer());

      act(() => {
        result.current.start(10);
      });

      expect(result.current.remaining).toBe(10);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.remaining).toBe(9);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.remaining).toBe(8);
    });

    it('should countdown every second', () => {
      const { result } = renderHook(() => useVerificationTimer());

      act(() => {
        result.current.start(5);
      });

      expect(result.current.remaining).toBe(5);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.remaining).toBe(2);
    });

    it('should stop at 0 and not go negative', () => {
      const { result } = renderHook(() => useVerificationTimer());

      act(() => {
        result.current.start(3);
      });

      expect(result.current.remaining).toBe(3);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.remaining).toBe(0);
    });

    it('should handle restart with new time', () => {
      const { result } = renderHook(() => useVerificationTimer());

      act(() => {
        result.current.start(10);
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.remaining).toBe(7);

      act(() => {
        result.current.start(20);
      });

      expect(result.current.remaining).toBe(20);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.remaining).toBe(19);
    });
  });

  describe('stop', () => {
    it('should set remaining to 0 when stop is called', () => {
      const { result } = renderHook(() => useVerificationTimer());

      act(() => {
        result.current.start(180);
      });

      expect(result.current.remaining).toBe(180);

      act(() => {
        result.current.stop();
      });

      expect(result.current.remaining).toBe(0);
    });

    it('should stop the countdown', () => {
      const { result } = renderHook(() => useVerificationTimer());

      act(() => {
        result.current.start(10);
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.remaining).toBe(8);

      act(() => {
        result.current.stop();
      });

      expect(result.current.remaining).toBe(0);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.remaining).toBe(0);
    });
  });

  describe('reset', () => {
    it('should set remaining to 0 when reset is called', () => {
      const { result } = renderHook(() => useVerificationTimer());

      act(() => {
        result.current.start(180);
      });

      expect(result.current.remaining).toBe(180);

      act(() => {
        result.current.reset();
      });

      expect(result.current.remaining).toBe(0);
    });

    it('should stop the countdown when reset is called', () => {
      const { result } = renderHook(() => useVerificationTimer());

      act(() => {
        result.current.start(10);
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.remaining).toBe(7);

      act(() => {
        result.current.reset();
      });

      expect(result.current.remaining).toBe(0);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.remaining).toBe(0);
    });
  });

  describe('타이머 정리', () => {
    it('should cleanup timer on unmount', () => {
      const { result, unmount } = renderHook(() => useVerificationTimer());

      act(() => {
        result.current.start(10);
      });

      expect(result.current.remaining).toBe(10);

      unmount();

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // After unmount, timer should not affect anything
      // No errors should be thrown
    });

    it('should cleanup previous timer when starting new one', () => {
      const { result } = renderHook(() => useVerificationTimer());

      act(() => {
        result.current.start(10);
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.remaining).toBe(8);

      // Start new timer
      act(() => {
        result.current.start(15);
      });

      expect(result.current.remaining).toBe(15);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should follow new timer
      expect(result.current.remaining).toBe(14);
    });
  });

  describe('엣지 케이스', () => {
    it('should handle start with 0 seconds', () => {
      const { result } = renderHook(() => useVerificationTimer());

      act(() => {
        result.current.start(0);
      });

      expect(result.current.remaining).toBe(0);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.remaining).toBe(0);
    });

    it('should handle start with 1 second', () => {
      const { result } = renderHook(() => useVerificationTimer());

      act(() => {
        result.current.start(1);
      });

      expect(result.current.remaining).toBe(1);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.remaining).toBe(0);
    });

    it('should handle multiple start calls rapidly', () => {
      const { result } = renderHook(() => useVerificationTimer());

      act(() => {
        result.current.start(10);
        result.current.start(5);
        result.current.start(15);
      });

      expect(result.current.remaining).toBe(15);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.remaining).toBe(14);
    });

    it('should handle stop when timer is not running', () => {
      const { result } = renderHook(() => useVerificationTimer());

      act(() => {
        result.current.stop();
      });

      expect(result.current.remaining).toBe(0);
    });

    it('should handle reset when timer is not running', () => {
      const { result } = renderHook(() => useVerificationTimer());

      act(() => {
        result.current.reset();
      });

      expect(result.current.remaining).toBe(0);
    });
  });

  describe('실제 사용 시나리오', () => {
    it('should handle typical email verification flow (3 minutes)', () => {
      const { result } = renderHook(() => useVerificationTimer());

      // Start 3-minute timer
      act(() => {
        result.current.start(180);
      });

      expect(result.current.remaining).toBe(180);

      // After 1 minute
      act(() => {
        vi.advanceTimersByTime(60000);
      });

      expect(result.current.remaining).toBe(120);

      // After another minute
      act(() => {
        vi.advanceTimersByTime(60000);
      });

      expect(result.current.remaining).toBe(60);

      // User verifies successfully, stop timer
      act(() => {
        result.current.stop();
      });

      expect(result.current.remaining).toBe(0);
    });

    it('should handle resending verification code', () => {
      const { result } = renderHook(() => useVerificationTimer());

      // First code sent
      act(() => {
        result.current.start(180);
      });

      // User waits 30 seconds
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      expect(result.current.remaining).toBe(150);

      // User requests to resend code
      act(() => {
        result.current.start(180);
      });

      expect(result.current.remaining).toBe(180);
    });

    it('should handle timer expiration', () => {
      const { result } = renderHook(() => useVerificationTimer());

      act(() => {
        result.current.start(5);
      });

      // Wait for timer to expire
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.remaining).toBe(0);

      // Timer should stay at 0
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.remaining).toBe(0);
    });
  });
});
