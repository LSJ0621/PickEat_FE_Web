/**
 * useDebounce 테스트
 * 값 지연 업데이트, 연속 입력 시 마지막 값만 반영, 기본 delay 동작 검증
 */

import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@shared/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('delay 시간 전에는 이전 값 유지', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 300 });

    // delay 전 — 여전히 이전 값
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('initial');
  });

  it('delay 시간 경과 후 새 값으로 업데이트', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    rerender({ value: 'updated', delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });

  it('연속 입력 시 마지막 값만 반영 (중간 값 무시)', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    );

    // 빠른 연속 입력
    rerender({ value: 'ab', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: 'abc', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: 'abcd', delay: 300 });

    // 중간 값들은 반영되지 않음
    expect(result.current).toBe('a');

    // 마지막 입력 후 delay 경과
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('abcd');
  });

  it('delay 기본값(500ms) 동작', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    // 499ms — 아직 업데이트 안 됨
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe('initial');

    // 1ms 더 진행 → 총 500ms
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });

  describe('엣지 케이스', () => {
    it('delay 0ms → 즉시 업데이트 (setTimeout(fn, 0))', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 0 } }
      );

      rerender({ value: 'updated', delay: 0 });

      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(result.current).toBe('updated');
    });

    it('언마운트 시 pending 타이머 정리 (에러 없음)', () => {
      const { result, rerender, unmount } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 300 } }
      );

      rerender({ value: 'pending', delay: 300 });

      // 타이머가 아직 대기 중인 상태에서 언마운트
      unmount();

      // 타이머 경과 후 에러 없음 (클린업 확인)
      expect(() => {
        act(() => {
          vi.advanceTimersByTime(1000);
        });
      }).not.toThrow();

      // 마지막으로 접근 가능한 값은 초기값
      expect(result.current).toBe('initial');
    });

    it('delay 변경 시 새 delay 기준으로 타이머 재설정', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      rerender({ value: 'updated', delay: 500 });

      // 200ms 경과
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current).toBe('initial');

      // delay를 100ms로 변경 → 새 타이머 시작
      rerender({ value: 'updated', delay: 100 });

      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(result.current).toBe('updated');
    });

    it('연속 빠른 입력 (10회) → 마지막 값만 반영', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: '0', delay: 300 } }
      );

      for (let i = 1; i <= 10; i++) {
        rerender({ value: String(i), delay: 300 });
        act(() => {
          vi.advanceTimersByTime(50); // 각 입력 간격 50ms
        });
      }

      // 아직 debounce 중 — 마지막 입력 후 300ms 미경과
      expect(result.current).toBe('0');

      // 마지막 입력 후 300ms 경과
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(result.current).toBe('10');
    });
  });
});
