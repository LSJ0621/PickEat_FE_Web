import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { userService } from '@/api/services/user';
import { useToast } from '@/hooks/common/useToast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setLanguage } from '@/store/slices/authSlice';
import { extractErrorMessage } from '@/utils/error';
import type { Language } from '@/types/common';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { error: showErrorToast } = useToast();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const currentLanguage = i18n.language as Language;

  const changeLanguage = useCallback(
    async (lang: Language) => {
      // 1. UI 언어 변경 (LocalStorage + Redux)
      await i18n.changeLanguage(lang);
      dispatch(setLanguage(lang));

      // 2. 인증된 사용자인 경우 서버에 언어 설정 저장
      if (isAuthenticated) {
        try {
          await userService.updateUserLanguage(lang);
        } catch (error: unknown) {
          // API 호출 실패해도 UI 언어는 이미 변경됨 (UX 우선)
          const message = extractErrorMessage(error, '언어 설정 동기화에 실패했습니다.');
          showErrorToast(message);
        }
      }
    },
    [i18n, dispatch, isAuthenticated, showErrorToast]
  );

  return {
    currentLanguage,
    changeLanguage,
    isKorean: currentLanguage === 'ko',
    isEnglish: currentLanguage === 'en',
  };
};

// Re-export Language type for backward compatibility
export type { Language } from '@/types/common';
