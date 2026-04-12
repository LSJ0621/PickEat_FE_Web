/**
 * useStreamingRequest 테스트
 * SSE 스트리밍 이벤트 처리, 800ms 최소 표시 시간, 언마운트 클린업 검증
 */

import { renderHook, act } from '@testing-library/react';
import { useStreamingRequest } from '@shared/hooks/useStreamingRequest';

describe('useStreamingRequest', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('SSE 이벤트 수신 → 800ms 최소 표시 시간 적용', () => {
    const { result } = renderHook(() => useStreamingRequest());

    // 첫 번째 status 이벤트 — delay=0 (초기 상태, lastShownAt=0)
    act(() => {
      result.current.handleStreamEvent({ type: 'status', status: '요청 분석 중' });
    });
    act(() => {
      vi.advanceTimersByTime(10); // setTimeout(fn, 0) 발화
    });
    expect(result.current.currentStatus).toBe('요청 분석 중');

    // 100ms 경과 후 두 번째 status 이벤트 큐잉
    act(() => {
      vi.advanceTimersByTime(100);
    });
    act(() => {
      result.current.handleStreamEvent({ type: 'status', status: '결과 생성 중' });
    });

    // 800ms 미경과 → 첫 번째 상태 유지
    expect(result.current.currentStatus).toBe('요청 분석 중');

    // 남은 700ms 경과 (첫 표시 후 총 800ms)
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(result.current.currentStatus).toBe('결과 생성 중');
  });

  it('status/retrying/result/error 이벤트 타입별 처리', () => {
    const { result } = renderHook(() => useStreamingRequest());

    // status 이벤트 → currentStatus 설정 + isRetrying false
    act(() => {
      result.current.handleStreamEvent({ type: 'status', status: '처리 중' });
    });
    act(() => {
      vi.advanceTimersByTime(10);
    });
    expect(result.current.currentStatus).toBe('처리 중');
    expect(result.current.isRetrying).toBe(false);

    // retrying 이벤트 → isRetrying true (동기적으로 반영)
    act(() => {
      result.current.handleStreamEvent({ type: 'retrying' });
    });
    expect(result.current.isRetrying).toBe(true);

    // status 이벤트 → isRetrying false로 초기화
    act(() => {
      vi.advanceTimersByTime(800); // 800ms 최소 표시 후 다음 큐 처리 가능
      result.current.handleStreamEvent({ type: 'status', status: '재처리 중' });
    });
    act(() => {
      vi.advanceTimersByTime(10);
    });
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.currentStatus).toBe('재처리 중');

    // result 이벤트 → currentStatus null 큐잉, isRetrying false
    act(() => {
      vi.advanceTimersByTime(800);
      result.current.handleStreamEvent({ type: 'result', data: {} });
    });
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(result.current.currentStatus).toBeNull();
    expect(result.current.isRetrying).toBe(false);

    // error 이벤트 → currentStatus null 큐잉
    act(() => {
      result.current.handleStreamEvent({ type: 'status', status: '다시 처리 중' });
    });
    act(() => {
      vi.advanceTimersByTime(800);
      result.current.handleStreamEvent({ type: 'error', message: '에러 발생' });
    });
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(result.current.currentStatus).toBeNull();
  });

  it('컴포넌트 언마운트 시 타이머 클린업', () => {
    const { result, unmount } = renderHook(() => useStreamingRequest());

    // 첫 번째 status 설정
    act(() => {
      result.current.handleStreamEvent({ type: 'status', status: '처리 중' });
    });
    act(() => {
      vi.advanceTimersByTime(10);
    });

    // 두 번째 status 큐잉 (800ms 타이머 대기 중)
    act(() => {
      result.current.handleStreamEvent({ type: 'status', status: '대기 중인 상태' });
    });

    // 언마운트 — timerRef.current 가 정리됨
    unmount();

    // 타이머 경과 후 에러 없음 (클린업 확인)
    expect(() => {
      act(() => {
        vi.advanceTimersByTime(2000);
      });
    }).not.toThrow();
  });

  describe('에러 시나리오', () => {
    it('error 이벤트 수신 → currentStatus null + isRetrying false로 초기화', () => {
      const { result } = renderHook(() => useStreamingRequest());

      // status 설정
      act(() => {
        result.current.handleStreamEvent({ type: 'status', status: '처리 중' });
      });
      act(() => {
        vi.advanceTimersByTime(10);
      });
      expect(result.current.currentStatus).toBe('처리 중');

      // retrying 상태로 변경
      act(() => {
        result.current.handleStreamEvent({ type: 'retrying', attempt: 1 });
      });
      expect(result.current.isRetrying).toBe(true);

      // error 이벤트 수신
      act(() => {
        vi.advanceTimersByTime(800);
        result.current.handleStreamEvent({ type: 'error', message: '서버 오류 발생', errorCode: 'INTERNAL_ERROR' });
      });
      act(() => {
        vi.advanceTimersByTime(800);
      });

      expect(result.current.currentStatus).toBeNull();
      expect(result.current.isRetrying).toBe(false);
    });

    it('resetStreamState — 큐 처리 중 호출 시 모든 상태 초기화', () => {
      const { result } = renderHook(() => useStreamingRequest());

      // 여러 status 이벤트 큐잉
      act(() => {
        result.current.handleStreamEvent({ type: 'status', status: '1단계' });
      });
      act(() => {
        vi.advanceTimersByTime(10);
      });
      act(() => {
        result.current.handleStreamEvent({ type: 'status', status: '2단계' });
        result.current.handleStreamEvent({ type: 'status', status: '3단계' });
      });

      // 큐에 아이템이 대기 중인 상태에서 reset
      act(() => {
        result.current.resetStreamState();
      });

      expect(result.current.currentStatus).toBeNull();
      expect(result.current.isRetrying).toBe(false);

      // reset 후 시간이 지나도 큐에서 추가 처리 없음
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(result.current.currentStatus).toBeNull();
    });

    it('연속 error 이벤트 수신 시 안정적 처리', () => {
      const { result } = renderHook(() => useStreamingRequest());

      // error 이벤트를 연속으로 수신
      act(() => {
        result.current.handleStreamEvent({ type: 'error', message: '첫 번째 에러' });
        result.current.handleStreamEvent({ type: 'error', message: '두 번째 에러' });
      });
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.currentStatus).toBeNull();
      expect(result.current.isRetrying).toBe(false);
    });

    it('status 없는 status 이벤트 (undefined) → null로 처리', () => {
      const { result } = renderHook(() => useStreamingRequest());

      act(() => {
        result.current.handleStreamEvent({ type: 'status' });
      });
      act(() => {
        vi.advanceTimersByTime(10);
      });

      // status가 undefined이면 null로 변환됨
      expect(result.current.currentStatus).toBeNull();
    });
  });
});
