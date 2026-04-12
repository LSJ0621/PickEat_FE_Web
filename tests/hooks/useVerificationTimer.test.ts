/**
 * useVerificationTimer 테스트
 * 인증 코드 유효 시간 타이머 관련 동작 검증
 */

import { renderHook, act } from '@testing-library/react';
import { useVerificationTimer } from '@features/auth/hooks/useVerificationTimer';

describe('useVerificationTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('start — 타이머 시작 후 1초마다 remaining 감소', () => {
    const { result } = renderHook(() => useVerificationTimer());

    act(() => {
      result.current.start(5);
    });

    expect(result.current.remaining).toBe(5);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remaining).toBe(4);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.remaining).toBe(1);
  });

  it('타이머 만료 (remaining 0) → 재발송 가능 상태', () => {
    const { result } = renderHook(() => useVerificationTimer());

    act(() => {
      result.current.start(2);
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.remaining).toBe(0);
  });

  it('stop/reset — 타이머 정지 및 초기화', () => {
    const { result } = renderHook(() => useVerificationTimer());

    // 타이머 시작 후 일부 경과
    act(() => {
      result.current.start(60);
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.remaining).toBe(55);

    // stop으로 즉시 정지
    act(() => {
      result.current.stop();
    });
    expect(result.current.remaining).toBe(0);

    // 다시 시작 후 reset으로 초기화
    act(() => {
      result.current.start(30);
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.remaining).toBe(25);

    act(() => {
      result.current.reset();
    });
    expect(result.current.remaining).toBe(0);
  });

  describe('엣지 케이스', () => {
    it('0초로 start → remaining 즉시 0 (타이머 미작동)', () => {
      const { result } = renderHook(() => useVerificationTimer());

      act(() => {
        result.current.start(0);
      });

      expect(result.current.remaining).toBe(0);

      // 시간이 지나도 remaining은 0 유지
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(result.current.remaining).toBe(0);
    });

    it('음수로 start → remaining이 음수 설정 후 감소하지 않음', () => {
      const { result } = renderHook(() => useVerificationTimer());

      act(() => {
        result.current.start(-5);
      });

      // 음수는 isRunning = false이므로 타이머 미작동
      expect(result.current.remaining).toBe(-5);

      act(() => {
        vi.advanceTimersByTime(3000);
      });
      // remaining은 변경되지 않음 (인터벌 미시작)
      expect(result.current.remaining).toBe(-5);
    });

    it('실행 중 다시 start 호출 → 새 시간으로 재시작', () => {
      const { result } = renderHook(() => useVerificationTimer());

      act(() => {
        result.current.start(60);
      });
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(result.current.remaining).toBe(50);

      // 실행 중 다시 start
      act(() => {
        result.current.start(30);
      });
      expect(result.current.remaining).toBe(30);

      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(result.current.remaining).toBe(25);
    });

    it('stop 후 다시 start → 정상 동작', () => {
      const { result } = renderHook(() => useVerificationTimer());

      act(() => {
        result.current.start(10);
      });
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(result.current.remaining).toBe(7);

      act(() => {
        result.current.stop();
      });
      expect(result.current.remaining).toBe(0);

      // 다시 시작
      act(() => {
        result.current.start(20);
      });
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(result.current.remaining).toBe(15);
    });
  });
});
