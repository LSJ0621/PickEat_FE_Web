/**
 * 이메일 인증 관련 Custom Hook
 * 이메일 중복 확인, 인증번호 발송, 검증 로직을 관리합니다.
 */

import { authService } from '@/api/services/auth';
import { useVerificationTimer } from '@/hooks/auth/useVerificationTimer';
import { ERROR_MESSAGES } from '@/utils/constants';
import { extractErrorMessage } from '@/utils/error';
import { formatSeconds } from '@/utils/format';
import { getApiSuccessMessage, getApiErrorMessage } from '@/utils/translateMessage';
import { isEmpty, isValidEmail } from '@/utils/validation';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type VerificationType = 'SIGNUP' | 'RE_REGISTER';

export interface UseEmailVerificationOptions {
  verificationType?: VerificationType;
  onReRegister?: (email: string, message: string) => void;
}

export interface UseEmailVerificationReturn {
  // 상태
  email: string;
  verificationCode: string;
  emailChecked: boolean;
  emailAvailable: boolean | null;
  emailCheckLoading: boolean;
  sendCodeLoading: boolean;
  verifyCodeLoading: boolean;
  isCodeSent: boolean;
  isEmailVerified: boolean;
  verificationRemaining: number;
  verificationMessage: string | null;
  verificationMessageVariant: 'success' | 'error' | null;
  emailError: string | undefined;

  // 상태 설정 함수
  setEmail: (email: string) => void;
  setVerificationCode: (code: string) => void;

  // 함수
  handleCheckEmail: () => Promise<void>;
  handleSendVerificationCode: () => Promise<void>;
  handleVerifyCode: () => Promise<void>;
  handleEmailAction: () => Promise<void>;
  getEmailActionLabel: () => string;
  isEmailActionDisabled: () => boolean;
  formatSeconds: (seconds: number) => string;
  resetEmailVerification: () => void;
}

/**
 * 이메일 인증 관련 로직을 관리하는 Custom Hook
 */
export const useEmailVerification = (
  options?: UseEmailVerificationOptions
): UseEmailVerificationReturn => {
  const { t } = useTranslation();
  const verificationType = options?.verificationType || 'SIGNUP';
  const isReRegister = verificationType === 'RE_REGISTER';
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [sendCodeLoading, setSendCodeLoading] = useState(false);
  const [verifyCodeLoading, setVerifyCodeLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [verificationMessageVariant, setVerificationMessageVariant] = useState<
    'success' | 'error' | null
  >(null);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);

  // 인증 타이머
  const verificationTimer = useVerificationTimer();

  // 이메일 중복 확인
  const handleCheckEmail = useCallback(async () => {
    if (isEmpty(email)) {
      setEmailError(ERROR_MESSAGES.EMAIL_REQUIRED);
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError(ERROR_MESSAGES.INVALID_EMAIL);
      setEmailAvailable(null);
      setEmailChecked(false);
      return;
    }

    setEmailCheckLoading(true);
    setEmailError(undefined);
    try {
      const result = await authService.checkEmail(email);
      setEmailAvailable(result.available);
      setEmailChecked(true);
      setVerificationMessage(null);
      setVerificationMessageVariant(null);

      // 재가입 가능한 경우 재가입 안내 모달 표시
      if (!result.available && result.canReRegister && options?.onReRegister) {
        options.onReRegister(email, result.message || t('emailVerification.reRegisterPrompt'));
        return;
      }

      if (!result.available) {
        setEmailError(result.message);
      }
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, t('emailVerification.checkEmailFailed'));
      setEmailError(errorMessage);
      setEmailAvailable(null);
      setEmailChecked(false);
    } finally {
      setEmailCheckLoading(false);
    }
  }, [email, options, t]);

  // 인증 코드 발송
  const handleSendVerificationCode = useCallback(async () => {
    if (isEmpty(email)) {
      setEmailError(ERROR_MESSAGES.EMAIL_REQUIRED);
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError(ERROR_MESSAGES.INVALID_EMAIL);
      return;
    }

    // 재가입이 아닌 경우에만 이메일 중복 확인 필요
    if (!isReRegister && (!emailChecked || !emailAvailable)) {
      setEmailError(ERROR_MESSAGES.EMAIL_DUPLICATE_CHECK_REQUIRED);
      return;
    }

    setSendCodeLoading(true);
    setVerificationMessage(null);
    setVerificationMessageVariant(null);
    setEmailError(undefined);
    try {
      const response = await authService.sendEmailVerificationCode(email, verificationType);
      const serverMessage = getApiSuccessMessage(
        response,
        response.remainCount !== undefined ? { count: response.remainCount } : undefined
      );
      setIsCodeSent(true);
      setIsEmailVerified(false);
      setVerificationCode('');
      verificationTimer.start(180);
      setVerificationMessage(serverMessage || t('emailVerification.codeSent'));
      setVerificationMessageVariant('success');
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(error, t('emailVerification.sendFailed'));

      setVerificationMessage(errorMessage);
      setVerificationMessageVariant('error');
      setEmailError(errorMessage);
    } finally {
      setSendCodeLoading(false);
    }
  }, [email, emailChecked, emailAvailable, verificationType, isReRegister, verificationTimer, t]);

  // 인증 코드 검증
  const handleVerifyCode = useCallback(async () => {
    if (!isCodeSent) {
      setVerificationMessage(t('emailVerification.sendCodeFirst'));
      setVerificationMessageVariant('error');
      return;
    }

    if (isEmpty(verificationCode)) {
      setVerificationMessage(ERROR_MESSAGES.VERIFICATION_CODE_REQUIRED);
      setVerificationMessageVariant('error');
      return;
    }

    setVerifyCodeLoading(true);
    setVerificationMessage(null);
    setVerificationMessageVariant(null);
    setEmailError(undefined);
    try {
      const response = await authService.verifyEmailCode(email, verificationCode.trim(), verificationType);
      const serverMessage = getApiSuccessMessage(response);
      setIsEmailVerified(true);
      verificationTimer.stop();
      setVerificationMessage(serverMessage || t('emailVerification.verifySuccess'));
      setVerificationMessageVariant('success');
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(error, t('emailVerification.verifyFailed'));

      setVerificationMessage(errorMessage);
      setVerificationMessageVariant('error');
      setIsEmailVerified(false);
    } finally {
      setVerifyCodeLoading(false);
    }
  }, [email, verificationCode, isCodeSent, verificationType, verificationTimer, t]);

  // 이메일 액션 버튼 라벨
  const getEmailActionLabel = useCallback(() => {
    // 재가입의 경우 중복 확인 없이 바로 인증번호 발송
    if (isReRegister) {
      if (isEmailVerified) {
        return t('emailVerification.verified');
      }
      if (isCodeSent && verificationTimer.remaining > 0) {
        return `${t('emailVerification.timeRemaining')} ${formatSeconds(verificationTimer.remaining)}`;
      }
      return sendCodeLoading ? t('emailVerification.sending') : t('emailVerification.sendCode');
    }

    // 회원가입의 경우 중복 확인 필요
    if (!emailChecked || emailAvailable !== true) {
      return emailCheckLoading ? t('emailVerification.checking') : t('emailVerification.checkDuplicate');
    }
    if (isEmailVerified) {
      return t('emailVerification.verified');
    }
    if (isCodeSent && verificationTimer.remaining > 0) {
      return `${t('emailVerification.timeRemaining')} ${formatSeconds(verificationTimer.remaining)}`;
    }
    return sendCodeLoading ? t('emailVerification.sending') : t('emailVerification.sendCode');
  }, [isReRegister, emailChecked, emailAvailable, emailCheckLoading, isEmailVerified, isCodeSent, verificationTimer.remaining, sendCodeLoading, t]);

  // 이메일 액션 버튼 비활성화 여부
  const isEmailActionDisabled = useCallback(() => {
    // 재가입의 경우 중복 확인 없이 바로 인증번호 발송 가능
    if (isReRegister) {
      if (isEmailVerified) {
        return true;
      }
      if (isCodeSent && verificationTimer.remaining > 0) {
        return true;
      }
      return sendCodeLoading || !email.trim();
    }
    
    // 회원가입의 경우 중복 확인 필요
    if (!emailChecked || emailAvailable !== true) {
      return emailCheckLoading || !email.trim();
    }
    if (isEmailVerified) {
      return true;
    }
    if (isCodeSent && verificationTimer.remaining > 0) {
      return true;
    }
    return sendCodeLoading;
  }, [isReRegister, emailChecked, emailAvailable, emailCheckLoading, email, isEmailVerified, isCodeSent, verificationTimer.remaining, sendCodeLoading]);

  // 이메일 변경 시 인증 상태 초기화
  const handleEmailChange = useCallback((newEmail: string) => {
    setEmail(newEmail);
    setEmailChecked(false);
    setEmailAvailable(null);
    setIsCodeSent(false);
    setIsEmailVerified(false);
    setVerificationCode('');
    verificationTimer.reset();
    setVerificationMessage(null);
    setVerificationMessageVariant(null);
    setEmailError(undefined);
  }, [verificationTimer]);

  // 이메일 액션 처리 (중복 확인 또는 인증번호 발송)
  const handleEmailAction = useCallback(async () => {
    // 재가입의 경우 중복 확인 없이 바로 인증번호 발송
    if (isReRegister) {
      if (isEmailVerified) {
        return;
      }
      if (isCodeSent && verificationTimer.remaining > 0) {
        return;
      }
      await handleSendVerificationCode();
      return;
    }
    
    // 회원가입의 경우 중복 확인 필요
    if (!emailChecked || emailAvailable !== true) {
      await handleCheckEmail();
      return;
    }

    if (isEmailVerified) {
      return;
    }

    if (isCodeSent && verificationTimer.remaining > 0) {
      return;
    }

    await handleSendVerificationCode();
  }, [isReRegister, emailChecked, emailAvailable, isEmailVerified, isCodeSent, verificationTimer.remaining, handleCheckEmail, handleSendVerificationCode]);

  // 인증 상태 초기화
  const resetEmailVerification = useCallback(() => {
    setEmail('');
    setVerificationCode('');
    setEmailChecked(false);
    setEmailAvailable(null);
    setIsCodeSent(false);
    setIsEmailVerified(false);
    verificationTimer.reset();
    setVerificationMessage(null);
    setVerificationMessageVariant(null);
    setEmailError(undefined);
  }, [verificationTimer]);

  return {
    // 상태
    email,
    verificationCode,
    emailChecked,
    emailAvailable,
    emailCheckLoading,
    sendCodeLoading,
    verifyCodeLoading,
    isCodeSent,
    isEmailVerified,
    verificationRemaining: verificationTimer.remaining,
    verificationMessage,
    verificationMessageVariant,
    emailError,

    // 상태 설정 함수
    setEmail: handleEmailChange,
    setVerificationCode,

    // 함수
    handleCheckEmail,
    handleSendVerificationCode,
    handleVerifyCode,
    getEmailActionLabel,
    isEmailActionDisabled,
    formatSeconds,
    handleEmailAction,
    resetEmailVerification,
  };
};

