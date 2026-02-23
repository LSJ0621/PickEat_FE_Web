/**
 * OAuth 리다이렉트 공통 훅
 * RE_REGISTER_REQUIRED 에러 처리, handleReRegister, 관련 상태를 캡슐화
 */

import { authService } from '@features/auth/api';
import { useErrorHandler } from '@shared/hooks/useErrorHandler';
import { useAppDispatch } from '@app/store/hooks';
import { getApiErrorMessage } from '@shared/utils/translateMessage';
import { isAxiosError } from 'axios';
import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ReRegisterErrorData {
  error?: string;
  message?: string;
  email?: string;
  name?: string;
  data?: { email?: string; name?: string };
}

interface UseOAuthRedirectOptions {
  /** handleError 로그 컨텍스트 레이블 */
  contextLabel: string;
}

interface UseOAuthRedirectReturn {
  loading: boolean;
  error: string | null;
  showReRegisterModal: boolean;
  pendingEmail: string | null;
  reRegisterMessage: string;
  isReRegistering: boolean;
  hasProcessed: React.MutableRefObject<boolean>;
  dispatch: ReturnType<typeof useAppDispatch>;
  navigate: ReturnType<typeof useNavigate>;
  handleError: ReturnType<typeof useErrorHandler>['handleError'];
  handleSuccess: ReturnType<typeof useErrorHandler>['handleSuccess'];
  t: ReturnType<typeof useTranslation>['t'];
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  handleReRegisterError: (err: unknown) => boolean;
  handleGenericError: (err: unknown) => void;
  handleReRegister: () => Promise<void>;
}

export const useOAuthRedirect = ({ contextLabel }: UseOAuthRedirectOptions): UseOAuthRedirectReturn => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReRegisterModal, setShowReRegisterModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [reRegisterMessage, setReRegisterMessage] = useState(t('oauth.reRegister.message'));
  const [isReRegistering, setIsReRegistering] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const hasProcessed = useRef(false);
  const { handleError, handleSuccess } = useErrorHandler();

  /**
   * RE_REGISTER_REQUIRED 에러를 처리한다.
   * @returns 해당 에러였으면 true, 아니면 false
   */
  const handleReRegisterError = useCallback(
    (err: unknown): boolean => {
      if (isAxiosError(err) && err.response?.status === 400) {
        const errorData = err.response.data as ReRegisterErrorData;
        if (errorData?.error === 'RE_REGISTER_REQUIRED') {
          const emailFromServer = errorData.email ?? errorData.data?.email ?? null;
          setPendingEmail(emailFromServer);
          setReRegisterMessage(errorData.message || t('oauth.reRegister.message'));
          setShowReRegisterModal(true);
          setLoading(false);
          return true;
        }
      }
      return false;
    },
    [t],
  );

  /**
   * RE_REGISTER_REQUIRED 이외의 일반 OAuth 에러를 처리한다.
   */
  const handleGenericError = useCallback(
    (err: unknown): void => {
      handleError(err, contextLabel);
      const errorMessage = getApiErrorMessage(err, t('oauth.error.loginFailed'));
      const statusCode = isAxiosError(err) ? err.response?.status : undefined;
      setError(`${errorMessage}${statusCode ? ` (${t('oauth.error.statusCode')}: ${statusCode})` : ''}`);
      setLoading(false);
    },
    [handleError, contextLabel, t],
  );

  /**
   * 재가입 처리 (두 provider에서 동일한 로직)
   */
  const handleReRegister = useCallback(async (): Promise<void> => {
    if (!pendingEmail) {
      handleError(t('oauth.reRegister.noEmail'), contextLabel);
      return;
    }

    setIsReRegistering(true);
    try {
      await authService.reRegisterSocial({ email: pendingEmail });
      handleSuccess(t('oauth.reRegister.success'));
      navigate('/login');
    } catch (err: unknown) {
      handleError(err, contextLabel);
      setIsReRegistering(false);
    }
  }, [pendingEmail, handleError, handleSuccess, navigate, contextLabel, t]);

  return {
    loading,
    error,
    showReRegisterModal,
    pendingEmail,
    reRegisterMessage,
    isReRegistering,
    hasProcessed,
    dispatch,
    navigate,
    handleError,
    handleSuccess,
    t,
    setLoading,
    setError,
    handleReRegisterError,
    handleGenericError,
    handleReRegister,
  };
};
