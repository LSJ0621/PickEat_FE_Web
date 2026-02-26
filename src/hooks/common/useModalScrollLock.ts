/**
 * 모달 열림/닫힘 시 body 스크롤 방지 Hook
 * 모달이 열릴 때 body 스크롤을 방지하고, 닫힐 때 복원합니다.
 *
 * position: fixed 접근 방식을 사용하여 모달 내부 스크롤과 충돌하지 않습니다.
 */

import { useEffect } from 'react';

/**
 * 모달의 열림 상태에 따라 body 스크롤을 제어하는 Hook
 * @param isOpen 모달이 열려있는지 여부
 */
export const useModalScrollLock = (isOpen: boolean) => {
  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const body = document.body;

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    return () => {
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);
};

