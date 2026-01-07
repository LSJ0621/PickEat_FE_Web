import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePrevious } from '@/hooks/common/usePrevious';

describe('usePrevious', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return undefined on first render', () => {
    const { result } = renderHook(() => usePrevious('initial'));

    expect(result.current).toBeUndefined();
  });

  it('should return previous value after rerender', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 'first' },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: 'second' });
    expect(result.current).toBe('first');

    rerender({ value: 'third' });
    expect(result.current).toBe('second');
  });

  it('should work with numbers', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 1 },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: 2 });
    expect(result.current).toBe(1);

    rerender({ value: 3 });
    expect(result.current).toBe(2);
  });

  it('should work with objects', () => {
    const obj1 = { name: 'first' };
    const obj2 = { name: 'second' };
    const obj3 = { name: 'third' };

    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: obj1 },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: obj2 });
    expect(result.current).toBe(obj1);

    rerender({ value: obj3 });
    expect(result.current).toBe(obj2);
  });

  it('should work with arrays', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [4, 5, 6];

    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: arr1 },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: arr2 });
    expect(result.current).toBe(arr1);
  });

  it('should work with null and undefined', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: null as unknown },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: undefined });
    expect(result.current).toBe(null);

    rerender({ value: 'value' });
    expect(result.current).toBe(undefined);
  });

  it('should not update if value stays the same', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 'same' },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: 'same' });
    expect(result.current).toBeUndefined();
  });

  it('should handle boolean values', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: true },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: false });
    expect(result.current).toBe(true);

    rerender({ value: true });
    expect(result.current).toBe(false);
  });
});
