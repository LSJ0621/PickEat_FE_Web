/**
 * 이전 값 추적 Hook
 * 이전 렌더링의 값을 추적하는 Hook입니다.
 */

import { useEffect, useRef } from 'react';

/**
 * 이전 값을 추적하는 Hook
 * @param value 추적할 값
 * @returns 이전 값 (첫 렌더링 시에는 undefined)
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};
