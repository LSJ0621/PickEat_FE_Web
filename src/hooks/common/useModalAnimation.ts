/**
 * 모달 애니메이션 관리 Hook
 * 모달의 열림/닫힘 애니메이션을 관리합니다.
 */

import { useEffect, useState } from 'react';

interface UseModalAnimationReturn {
  isAnimating: boolean;
  shouldRender: boolean;
}

/**
 * 모달 애니메이션을 관리하는 Hook
 * @param isOpen 모달이 열려있는지 여부
 * @returns 애니메이션 상태와 렌더링 여부
 */
export const useModalAnimation = (isOpen: boolean): UseModalAnimationReturn => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return {
    isAnimating,
    shouldRender,
  };
};
