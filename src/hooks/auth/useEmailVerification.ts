/**
 * 이메일 인증 관련 Custom Hook
 * 이메일 중복 확인, 인증번호 발송, 검증 로직을 관리합니다.
 */

import { authService } from '@/api/services/auth';
import { ERROR_MESSAGES } from '@/utils/constants';
import { extractErrorMessage } from '@/utils/error';
import { isEmpty, isValidEmail } from '@/utils/validation';
import { useCallback, useEffect, useState } from 'react';

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
  const [verificationRemaining, setVerificationRemaining] = useState(0);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [verificationMessageVariant, setVerificationMessageVariant] = useState<
    'success' | 'error' | null
  >(null);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);

  // 인증 만료 타이머
  useEffect(() => {
    if (verificationRemaining <= 0) return;
    const timer = setInterval(() => {
      setVerificationRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [verificationRemaining]);

  // 인증 타이머 포맷
  const formatSeconds = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
  }, []);

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
        options.onReRegister(email, result.message || '기존에 탈퇴 이력이 있습니다. 재가입하시겠습니까?');
        return;
      }

      if (!result.available) {
        setEmailError(result.message);
      }
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, '이메일 확인에 실패했습니다.');
      setEmailError(errorMessage);
      setEmailAvailable(null);
      setEmailChecked(false);
    } finally {
      setEmailCheckLoading(false);
    }
  }, [email, options]);

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
      const serverMessage =
        response?.message || '인증 코드를 발송했습니다. 3분 이내에 입력해주세요.';
      setIsCodeSent(true);
      setIsEmailVerified(false);
      setVerificationCode('');
      setVerificationRemaining(180);
      setVerificationMessage(serverMessage);
      setVerificationMessageVariant('success');
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(
        error,
        '인증 코드를 발송하지 못했습니다. 잠시 후 다시 시도해주세요.'
      );

      setVerificationMessage(errorMessage);
      setVerificationMessageVariant('error');
      setEmailError(errorMessage);
    } finally {
      setSendCodeLoading(false);
    }
  }, [email, emailChecked, emailAvailable, verificationType, isReRegister]);

  // 인증 코드 검증
  const handleVerifyCode = useCallback(async () => {
    if (!isCodeSent) {
      setVerificationMessage('인증 코드를 먼저 발송해주세요.');
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
      const serverMessage = response?.message || '이메일 인증이 완료되었습니다.';
      setIsEmailVerified(true);
      setVerificationRemaining(0);
      setVerificationMessage(serverMessage);
      setVerificationMessageVariant('success');
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(
        error,
        '인증에 실패했습니다. 코드를 확인해주세요.'
      );

      setVerificationMessage(errorMessage);
      setVerificationMessageVariant('error');
      setIsEmailVerified(false);
    } finally {
      setVerifyCodeLoading(false);
    }
  }, [email, verificationCode, isCodeSent, verificationType]);

  // 이메일 액션 버튼 라벨
  const getEmailActionLabel = useCallback(() => {
    // 재가입의 경우 중복 확인 없이 바로 인증번호 발송
    if (isReRegister) {
      if (isEmailVerified) {
        return '인증 완료';
      }
      if (isCodeSent && verificationRemaining > 0) {
        return `유효시간 ${formatSeconds(verificationRemaining)}`;
      }
      return sendCodeLoading ? '발송 중...' : '인증번호 발송';
    }
    
    // 회원가입의 경우 중복 확인 필요
    if (!emailChecked || emailAvailable !== true) {
      return emailCheckLoading ? '확인 중...' : '중복 확인';
    }
    if (isEmailVerified) {
      return '인증 완료';
    }
    if (isCodeSent && verificationRemaining > 0) {
      return `유효시간 ${formatSeconds(verificationRemaining)}`;
    }
    return sendCodeLoading ? '발송 중...' : '인증번호 발송';
  }, [isReRegister, emailChecked, emailAvailable, emailCheckLoading, isEmailVerified, isCodeSent, verificationRemaining, formatSeconds, sendCodeLoading]);

  // 이메일 액션 버튼 비활성화 여부
  const isEmailActionDisabled = useCallback(() => {
    // 재가입의 경우 중복 확인 없이 바로 인증번호 발송 가능
    if (isReRegister) {
      if (isEmailVerified) {
        return true;
      }
      if (isCodeSent && verificationRemaining > 0) {
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
    if (isCodeSent && verificationRemaining > 0) {
      return true;
    }
    return sendCodeLoading;
  }, [isReRegister, emailChecked, emailAvailable, emailCheckLoading, email, isEmailVerified, isCodeSent, verificationRemaining, sendCodeLoading]);

  // 이메일 변경 시 인증 상태 초기화
  const handleEmailChange = useCallback((newEmail: string) => {
    setEmail(newEmail);
    setEmailChecked(false);
    setEmailAvailable(null);
    setIsCodeSent(false);
    setIsEmailVerified(false);
    setVerificationCode('');
    setVerificationRemaining(0);
    setVerificationMessage(null);
    setVerificationMessageVariant(null);
    setEmailError(undefined);
  }, []);

  // 이메일 액션 처리 (중복 확인 또는 인증번호 발송)
  const handleEmailAction = useCallback(async () => {
    // 재가입의 경우 중복 확인 없이 바로 인증번호 발송
    if (isReRegister) {
      if (isEmailVerified) {
        return;
      }
      if (isCodeSent && verificationRemaining > 0) {
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

    if (isCodeSent && verificationRemaining > 0) {
      return;
    }

    await handleSendVerificationCode();
  }, [isReRegister, emailChecked, emailAvailable, isEmailVerified, isCodeSent, verificationRemaining, handleCheckEmail, handleSendVerificationCode]);

  // 인증 상태 초기화
  const resetEmailVerification = useCallback(() => {
    setEmail('');
    setVerificationCode('');
    setEmailChecked(false);
    setEmailAvailable(null);
    setIsCodeSent(false);
    setIsEmailVerified(false);
    setVerificationRemaining(0);
    setVerificationMessage(null);
    setVerificationMessageVariant(null);
    setEmailError(undefined);
  }, []);

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
    verificationRemaining,
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

