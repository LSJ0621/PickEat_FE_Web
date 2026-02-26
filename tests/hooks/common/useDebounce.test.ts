/**
 * useDebounce Hook 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@shared/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes with default delay (500ms)', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    // 값 변경
    rerender({ value: 'changed' });
    expect(result.current).toBe('initial'); // 아직 변경되지 않음

    // 500ms 경과
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('changed');
  });

  it('should debounce value changes with custom delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 1000 } }
    );

    expect(result.current).toBe('initial');

    // 값 변경
    rerender({ value: 'changed', delay: 1000 });
    expect(result.current).toBe('initial');

    // 500ms 경과 (아직 부족)
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('initial');

    // 추가 500ms 경과 (총 1000ms)
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('changed');
  });

  it('should reset timer on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    // 첫 번째 변경
    rerender({ value: 'change1' });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial');

    // 두 번째 변경 (타이머 리셋)
    rerender({ value: 'change2' });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial');

    // 세 번째 변경 (타이머 리셋)
    rerender({ value: 'change3' });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('change3');
  });

  it('should handle different data types - number', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 0 } }
    );

    expect(result.current).toBe(0);

    rerender({ value: 42 });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe(42);
  });

  it('should handle different data types - boolean', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: false } }
    );

    expect(result.current).toBe(false);

    rerender({ value: true });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe(true);
  });

  it('should handle different data types - object', () => {
    const initialObj = { name: 'initial' };
    const changedObj = { name: 'changed' };

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: initialObj } }
    );

    expect(result.current).toEqual(initialObj);

    rerender({ value: changedObj });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toEqual(changedObj);
  });

  it('should handle different data types - array', () => {
    const initialArr = [1, 2, 3];
    const changedArr = [4, 5, 6];

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: initialArr } }
    );

    expect(result.current).toEqual(initialArr);

    rerender({ value: changedArr });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toEqual(changedArr);
  });

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 0),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'changed' });
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(result.current).toBe('changed');
  });

  it('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const { unmount } = renderHook(() => useDebounce('test', 500));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('should update when delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // 값과 delay 동시 변경
    rerender({ value: 'changed', delay: 1000 });

    // 500ms로는 충분하지 않음
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('initial');

    // 추가 500ms (총 1000ms)
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('changed');
  });

  it('should handle null and undefined values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: null as string | null } }
    );

    expect(result.current).toBe(null);

    rerender({ value: undefined as string | null | undefined });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe(undefined);
  });

  it('should handle empty string', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'text' } }
    );

    rerender({ value: '' });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('');
  });
});
