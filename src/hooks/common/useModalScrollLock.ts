/**
 * 모달 열림/닫힘 시 body 스크롤 방지 Hook
 * 모달이 열릴 때 body 스크롤을 방지하고, 닫힐 때 복원합니다.
 */

import { useEffect } from 'react';

/**
 * 모달의 열림 상태에 따라 body 스크롤을 제어하는 Hook
 * @param isOpen 모달이 열려있는지 여부
 */
export const useModalScrollLock = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      // 모달이 열릴 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
    } else {
      // 모달이 닫히면 스크롤 복원
      document.body.style.overflow = '';
    }

    return () => {
      // 컴포넌트 언마운트 시 스크롤 복원
      document.body.style.overflow = '';
    };
  }, [isOpen]);
};

