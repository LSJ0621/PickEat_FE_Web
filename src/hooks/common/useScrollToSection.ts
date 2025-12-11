/**
 * 섹션으로 스크롤하는 Hook
 * 특정 요소로 부드럽게 스크롤하는 기능을 제공합니다.
 */

import { useEffect, useRef } from 'react';

interface UseScrollToSectionOptions {
  /** 스크롤할 요소의 ref */
  elementRef: React.RefObject<HTMLElement | null>;
  /** 스크롤 트리거 조건 (true일 때 스크롤 실행) */
  shouldScroll: boolean;
  /** 스크롤 오프셋 (기본값: 80) */
  offset?: number;
}

/**
 * 섹션으로 스크롤하는 Hook
 * shouldScroll이 true가 되었을 때 해당 요소로 스크롤합니다.
 */
export const useScrollToSection = (
  options: UseScrollToSectionOptions
): void => {
  const { elementRef, shouldScroll, offset = 80 } = options;
  const prevShouldScrollRef = useRef(shouldScroll);

  useEffect(() => {
    const prev = prevShouldScrollRef.current;
    // 이전에는 false였고 지금 true가 되었을 때만 스크롤
    if (!prev && shouldScroll && elementRef.current) {
      const element = elementRef.current;
      const rect = element.getBoundingClientRect();
      const absoluteTop = window.scrollY + rect.top;
      const targetTop = Math.max(absoluteTop - offset, 0);
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
    prevShouldScrollRef.current = shouldScroll;
  }, [shouldScroll, elementRef, offset]);
};
