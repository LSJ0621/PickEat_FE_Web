/**
 * useLocalStorage Hook 테스트
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/common/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('should initialize with initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    expect(result.current[0]).toBe('initial');
  });

  it('should initialize with value from localStorage if it exists', () => {
    window.localStorage.setItem('test-key', JSON.stringify('stored-value'));

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    expect(result.current[0]).toBe('stored-value');
  });

  it('should update state and localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(JSON.parse(window.localStorage.getItem('test-key')!)).toBe('updated');
  });

  it('should handle function updates', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 10));

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(15);
    expect(JSON.parse(window.localStorage.getItem('test-key')!)).toBe(15);
  });

  it('should handle object values', () => {
    const initialObj = { name: 'John', age: 30 };
    const { result } = renderHook(() => useLocalStorage('test-key', initialObj));

    expect(result.current[0]).toEqual(initialObj);

    const updatedObj = { name: 'Jane', age: 25 };
    act(() => {
      result.current[1](updatedObj);
    });

    expect(result.current[0]).toEqual(updatedObj);
    expect(JSON.parse(window.localStorage.getItem('test-key')!)).toEqual(updatedObj);
  });

  it('should handle array values', () => {
    const initialArr = [1, 2, 3];
    const { result } = renderHook(() => useLocalStorage('test-key', initialArr));

    expect(result.current[0]).toEqual(initialArr);

    act(() => {
      result.current[1]([4, 5, 6]);
    });

    expect(result.current[0]).toEqual([4, 5, 6]);
  });

  it('should handle boolean values', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', false));

    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
    expect(JSON.parse(window.localStorage.getItem('test-key')!)).toBe(true);
  });

  it('should handle number values', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 0));

    act(() => {
      result.current[1](42);
    });

    expect(result.current[0]).toBe(42);
    expect(JSON.parse(window.localStorage.getItem('test-key')!)).toBe(42);
  });

  it('should handle null values', () => {
    const { result } = renderHook(() => useLocalStorage<string | null>('test-key', null));

    expect(result.current[0]).toBe(null);

    act(() => {
      result.current[1]('not-null');
    });

    expect(result.current[0]).toBe('not-null');
  });

  it('should return initial value when localStorage has invalid JSON', () => {
    window.localStorage.setItem('test-key', 'invalid-json{');

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    expect(result.current[0]).toBe('initial');
  });

  it('should silently fail when localStorage.setItem throws error', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    // localStorage.setItem이 에러를 던지도록 모킹
    const originalSetItem = window.localStorage.setItem;
    window.localStorage.setItem = () => {
      throw new Error('Storage quota exceeded');
    };

    // 에러가 발생해도 조용히 무시되어야 함
    expect(() => {
      act(() => {
        result.current[1]('updated');
      });
    }).not.toThrow();

    // 상태는 업데이트되지만 localStorage에는 저장되지 않음
    expect(result.current[0]).toBe('updated');

    // 원래 setItem 복원
    window.localStorage.setItem = originalSetItem;
  });

  it('should work with different keys independently', () => {
    const { result: result1 } = renderHook(() => useLocalStorage('key1', 'value1'));
    const { result: result2 } = renderHook(() => useLocalStorage('key2', 'value2'));

    expect(result1.current[0]).toBe('value1');
    expect(result2.current[0]).toBe('value2');

    act(() => {
      result1.current[1]('updated1');
    });

    expect(result1.current[0]).toBe('updated1');
    expect(result2.current[0]).toBe('value2'); // key2는 변경되지 않음
  });

  it('should persist value across re-renders', () => {
    const { result, rerender } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    rerender();

    expect(result.current[0]).toBe('updated');
  });

  it('should handle complex nested objects', () => {
    const complexObj = {
      user: {
        name: 'John',
        preferences: {
          theme: 'dark',
          notifications: true,
        },
        tags: ['developer', 'gamer'],
      },
    };

    const { result } = renderHook(() => useLocalStorage('test-key', complexObj));

    expect(result.current[0]).toEqual(complexObj);

    const updatedObj = {
      ...complexObj,
      user: {
        ...complexObj.user,
        preferences: {
          theme: 'light',
          notifications: false,
        },
      },
    };

    act(() => {
      result.current[1](updatedObj);
    });

    expect(result.current[0]).toEqual(updatedObj);
    expect(JSON.parse(window.localStorage.getItem('test-key')!)).toEqual(updatedObj);
  });

  it('should handle empty string as key', () => {
    const { result } = renderHook(() => useLocalStorage('', 'value'));

    expect(result.current[0]).toBe('value');

    act(() => {
      result.current[1]('updated');
    });

    expect(window.localStorage.getItem('')).toBe(JSON.stringify('updated'));
  });

  it('should handle empty string as value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', ''));

    expect(result.current[0]).toBe('');

    act(() => {
      result.current[1]('not-empty');
    });

    expect(result.current[0]).toBe('not-empty');
  });

  it('should return a stable setValue function reference', () => {
    const { result, rerender } = renderHook(() => useLocalStorage('test-key', 'initial'));

    const firstSetValue = result.current[1];
    rerender();
    const secondSetValue = result.current[1];

    // 함수 참조는 변경되지만 동작은 동일해야 함
    act(() => {
      firstSetValue('value1');
    });
    expect(result.current[0]).toBe('value1');

    act(() => {
      secondSetValue('value2');
    });
    expect(result.current[0]).toBe('value2');
  });
});
