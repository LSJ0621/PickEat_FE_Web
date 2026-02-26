import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEmailVerification } from '@features/auth/hooks/useEmailVerification';
import type { UseEmailVerificationOptions } from '@features/auth/hooks/useEmailVerification';
import { authService } from '@features/auth/api';
import { ERROR_MESSAGES } from '@shared/utils/constants';

vi.mock('@features/auth/api');

// --- Mock Helpers ---

function mockCheckEmailAvailable() {
  vi.mocked(authService.checkEmail).mockResolvedValue({
    available: true,
    message: '사용 가능한 이메일입니다.',
    canReRegister: false,
  });
}

function mockSendCodeSuccess() {
  vi.mocked(authService.sendEmailVerificationCode).mockResolvedValue({
    success: true,
    message: '인증 코드를 발송했습니다.',
  });
}

function mockVerifyCodeSuccess() {
  vi.mocked(authService.verifyEmailCode).mockResolvedValue({
    success: true,
    message: '이메일 인증이 완료되었습니다.',
  });
}

// --- Flow Helpers ---

async function setupSignupEmailChecked(result: ReturnType<typeof renderHook<ReturnType<typeof useEmailVerification>, UseEmailVerificationOptions | undefined>>['result']) {
  mockCheckEmailAvailable();
  act(() => { result.current.setEmail('test@example.com'); });
  await act(async () => { await result.current.handleCheckEmail(); });
}

async function setupSignupCodeSent(result: ReturnType<typeof renderHook<ReturnType<typeof useEmailVerification>, UseEmailVerificationOptions | undefined>>['result']) {
  await setupSignupEmailChecked(result);
  mockSendCodeSuccess();
  await act(async () => { await result.current.handleSendVerificationCode(); });
}

async function setupSignupFullyVerified(result: ReturnType<typeof renderHook<ReturnType<typeof useEmailVerification>, UseEmailVerificationOptions | undefined>>['result']) {
  await setupSignupCodeSent(result);
  mockVerifyCodeSuccess();
  act(() => { result.current.setVerificationCode('123456'); });
  await act(async () => { await result.current.handleVerifyCode(); });
}

async function setupReRegisterCodeSent(result: ReturnType<typeof renderHook<ReturnType<typeof useEmailVerification>, UseEmailVerificationOptions | undefined>>['result']) {
  mockSendCodeSuccess();
  act(() => { result.current.setEmail('test@example.com'); });
  await act(async () => { await result.current.handleSendVerificationCode(); });
}

async function setupReRegisterFullyVerified(result: ReturnType<typeof renderHook<ReturnType<typeof useEmailVerification>, UseEmailVerificationOptions | undefined>>['result']) {
  await setupReRegisterCodeSent(result);
  mockVerifyCodeSuccess();
  act(() => { result.current.setVerificationCode('123456'); });
  await act(async () => { await result.current.handleVerifyCode(); });
}

// ---

describe('useEmailVerification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useEmailVerification());

      expect(result.current.email).toBe('');
      expect(result.current.verificationCode).toBe('');
      expect(result.current.emailChecked).toBe(false);
      expect(result.current.emailAvailable).toBe(null);
      expect(result.current.emailCheckLoading).toBe(false);
      expect(result.current.sendCodeLoading).toBe(false);
      expect(result.current.verifyCodeLoading).toBe(false);
      expect(result.current.isCodeSent).toBe(false);
      expect(result.current.isEmailVerified).toBe(false);
      expect(result.current.verificationRemaining).toBe(0);
      expect(result.current.verificationMessage).toBe(null);
      expect(result.current.verificationMessageVariant).toBe(null);
      expect(result.current.emailError).toBe(undefined);
    });
  });

  describe('handleCheckEmail', () => {
    it('should set error when email is empty', async () => {
      const { result } = renderHook(() => useEmailVerification());
      await act(async () => { await result.current.handleCheckEmail(); });
      expect(result.current.emailError).toBe(ERROR_MESSAGES.EMAIL_REQUIRED);
    });

    it('should set error when email is invalid', async () => {
      const { result } = renderHook(() => useEmailVerification());
      act(() => { result.current.setEmail('invalid-email'); });
      await act(async () => { await result.current.handleCheckEmail(); });

      expect(result.current.emailError).toBe(ERROR_MESSAGES.INVALID_EMAIL);
      expect(result.current.emailAvailable).toBe(null);
      expect(result.current.emailChecked).toBe(false);
    });

    it('should successfully check available email', async () => {
      const { result } = renderHook(() => useEmailVerification());
      await setupSignupEmailChecked(result);

      expect(result.current.emailAvailable).toBe(true);
      expect(result.current.emailChecked).toBe(true);
      expect(result.current.emailError).toBe(undefined);
    });

    it('should handle unavailable email', async () => {
      vi.mocked(authService.checkEmail).mockResolvedValue({
        available: false,
        message: '이미 사용 중인 이메일입니다.',
        canReRegister: false,
      });

      const { result } = renderHook(() => useEmailVerification());
      act(() => { result.current.setEmail('test@example.com'); });
      await act(async () => { await result.current.handleCheckEmail(); });

      expect(result.current.emailAvailable).toBe(false);
      expect(result.current.emailChecked).toBe(true);
      expect(result.current.emailError).toBe('이미 사용 중인 이메일입니다.');
    });

    it('should call onReRegister when re-registration is possible', async () => {
      const onReRegister = vi.fn();
      vi.mocked(authService.checkEmail).mockResolvedValue({
        available: false,
        message: '재가입 가능합니다.',
        canReRegister: true,
      });

      const { result } = renderHook(() => useEmailVerification({ onReRegister }));
      act(() => { result.current.setEmail('test@example.com'); });
      await act(async () => { await result.current.handleCheckEmail(); });

      expect(onReRegister).toHaveBeenCalledWith('test@example.com', '재가입 가능합니다.');
    });

    it('should handle check email error', async () => {
      vi.mocked(authService.checkEmail).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useEmailVerification());
      act(() => { result.current.setEmail('test@example.com'); });
      await act(async () => { await result.current.handleCheckEmail(); });

      expect(result.current.emailError).toBe('Network error');
      expect(result.current.emailAvailable).toBe(null);
      expect(result.current.emailChecked).toBe(false);
    });
  });

  describe('handleSendVerificationCode', () => {
    it('should set error when email is empty', async () => {
      const { result } = renderHook(() => useEmailVerification());
      await act(async () => { await result.current.handleSendVerificationCode(); });
      expect(result.current.emailError).toBe(ERROR_MESSAGES.EMAIL_REQUIRED);
    });

    it('should set error when email is invalid', async () => {
      const { result } = renderHook(() => useEmailVerification());
      act(() => { result.current.setEmail('invalid-email'); });
      await act(async () => { await result.current.handleSendVerificationCode(); });
      expect(result.current.emailError).toBe(ERROR_MESSAGES.INVALID_EMAIL);
    });

    it('should require email check for SIGNUP type', async () => {
      const { result } = renderHook(() => useEmailVerification());
      act(() => { result.current.setEmail('test@example.com'); });
      await act(async () => { await result.current.handleSendVerificationCode(); });
      expect(result.current.emailError).toBe(ERROR_MESSAGES.EMAIL_DUPLICATE_CHECK_REQUIRED);
    });

    it('should successfully send verification code for SIGNUP', async () => {
      const { result } = renderHook(() => useEmailVerification());
      await setupSignupCodeSent(result);

      expect(result.current.isCodeSent).toBe(true);
      expect(result.current.verificationMessage).toBe('인증 코드를 발송했습니다.');
      expect(result.current.verificationMessageVariant).toBe('success');
      expect(result.current.verificationRemaining).toBe(180);
    });

    it('should send verification code without email check for RE_REGISTER', async () => {
      const { result } = renderHook(() =>
        useEmailVerification({ verificationType: 'RE_REGISTER' })
      );
      await setupReRegisterCodeSent(result);

      expect(result.current.isCodeSent).toBe(true);
      expect(authService.sendEmailVerificationCode).toHaveBeenCalledWith('test@example.com', 'RE_REGISTER');
    });

    it('should handle send code error', async () => {
      mockCheckEmailAvailable();
      vi.mocked(authService.sendEmailVerificationCode).mockRejectedValue(new Error('Server error'));

      const { result } = renderHook(() => useEmailVerification());
      act(() => { result.current.setEmail('test@example.com'); });
      await act(async () => { await result.current.handleCheckEmail(); });
      await act(async () => { await result.current.handleSendVerificationCode(); });

      expect(result.current.verificationMessage).toBe('인증 코드를 발송하지 못했습니다. 잠시 후 다시 시도해주세요.');
      expect(result.current.verificationMessageVariant).toBe('error');
    });
  });

  describe('handleVerifyCode', () => {
    it('should set error when code is not sent', async () => {
      const { result } = renderHook(() => useEmailVerification());
      await act(async () => { await result.current.handleVerifyCode(); });

      expect(result.current.verificationMessage).toBe('인증 코드를 먼저 발송해주세요.');
      expect(result.current.verificationMessageVariant).toBe('error');
    });

    it('should set error when verification code is empty', async () => {
      const { result } = renderHook(() => useEmailVerification());
      await setupSignupCodeSent(result);
      await act(async () => { await result.current.handleVerifyCode(); });

      expect(result.current.verificationMessage).toBe(ERROR_MESSAGES.VERIFICATION_CODE_REQUIRED);
      expect(result.current.verificationMessageVariant).toBe('error');
    });

    it('should successfully verify code', async () => {
      const { result } = renderHook(() => useEmailVerification());
      await setupSignupFullyVerified(result);

      expect(result.current.isEmailVerified).toBe(true);
      expect(result.current.verificationMessage).toBe('이메일 인증이 완료되었습니다.');
      expect(result.current.verificationMessageVariant).toBe('success');
      expect(result.current.verificationRemaining).toBe(0);
    });

    it('should handle verify code error', async () => {
      vi.mocked(authService.verifyEmailCode).mockRejectedValue(new Error('Invalid code'));

      const { result } = renderHook(() => useEmailVerification());
      await setupSignupCodeSent(result);
      act(() => { result.current.setVerificationCode('123456'); });
      await act(async () => { await result.current.handleVerifyCode(); });

      expect(result.current.isEmailVerified).toBe(false);
      expect(result.current.verificationMessage).toBe('인증에 실패했습니다. 코드를 확인해주세요.');
      expect(result.current.verificationMessageVariant).toBe('error');
    });
  });

  describe('Email Action Functions', () => {
    it('should return "중복 확인" for SIGNUP before email check', () => {
      const { result } = renderHook(() => useEmailVerification());
      expect(result.current.getEmailActionLabel()).toBe('중복 확인');
    });

    it('should return "인증번호 발송" for SIGNUP after email check', async () => {
      const { result } = renderHook(() => useEmailVerification());
      await setupSignupEmailChecked(result);
      expect(result.current.getEmailActionLabel()).toBe('인증번호 발송');
    });

    it('should return "인증번호 발송" for RE_REGISTER without email check', () => {
      const { result } = renderHook(() =>
        useEmailVerification({ verificationType: 'RE_REGISTER' })
      );
      expect(result.current.getEmailActionLabel()).toBe('인증번호 발송');
    });

    it('should show "유효시간 MM:SS" label when timer is running', async () => {
      const { result } = renderHook(() => useEmailVerification());
      await setupSignupCodeSent(result);

      expect(result.current.getEmailActionLabel()).toContain('유효시간');
      expect(result.current.getEmailActionLabel()).toContain('03:00');
    });

    it('should return "인증 완료" after successful verification', async () => {
      const { result } = renderHook(() => useEmailVerification());
      await setupSignupFullyVerified(result);
      expect(result.current.getEmailActionLabel()).toBe('인증 완료');
    });

    it('should call handleCheckEmail when handleEmailAction is called for SIGNUP', async () => {
      mockCheckEmailAvailable();
      const { result } = renderHook(() => useEmailVerification());
      act(() => { result.current.setEmail('test@example.com'); });
      await act(async () => { await result.current.handleEmailAction(); });

      expect(result.current.emailChecked).toBe(true);
      expect(authService.checkEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should call sendVerificationCode when handleEmailAction is called for RE_REGISTER', async () => {
      const { result } = renderHook(() =>
        useEmailVerification({ verificationType: 'RE_REGISTER' })
      );
      await setupReRegisterCodeSent(result);

      expect(result.current.isCodeSent).toBe(true);
      expect(authService.sendEmailVerificationCode).toHaveBeenCalledWith('test@example.com', 'RE_REGISTER');
    });

    it('should disable action when email is empty', () => {
      const { result } = renderHook(() => useEmailVerification());
      expect(result.current.isEmailActionDisabled()).toBe(true);
    });

    it('should disable action when email is verified', async () => {
      const { result } = renderHook(() => useEmailVerification());
      await setupSignupFullyVerified(result);
      expect(result.current.isEmailActionDisabled()).toBe(true);
    });
  });

  describe('Email Change', () => {
    it('should reset verification state when email changes', async () => {
      const { result } = renderHook(() => useEmailVerification());
      await setupSignupEmailChecked(result);
      expect(result.current.emailChecked).toBe(true);

      act(() => { result.current.setEmail('new@example.com'); });

      expect(result.current.email).toBe('new@example.com');
      expect(result.current.emailChecked).toBe(false);
      expect(result.current.emailAvailable).toBe(null);
      expect(result.current.isCodeSent).toBe(false);
      expect(result.current.isEmailVerified).toBe(false);
      expect(result.current.verificationCode).toBe('');
    });
  });

  describe('resetEmailVerification', () => {
    it('should reset all verification state', async () => {
      const { result } = renderHook(() => useEmailVerification());
      await setupSignupEmailChecked(result);

      act(() => { result.current.resetEmailVerification(); });

      expect(result.current.email).toBe('');
      expect(result.current.verificationCode).toBe('');
      expect(result.current.emailChecked).toBe(false);
      expect(result.current.emailAvailable).toBe(null);
      expect(result.current.isCodeSent).toBe(false);
      expect(result.current.isEmailVerified).toBe(false);
      expect(result.current.verificationMessage).toBe(null);
      expect(result.current.verificationMessageVariant).toBe(null);
      expect(result.current.emailError).toBe(undefined);
    });
  });

  describe('Timer Integration', () => {
    it('should start countdown timer when code is sent and stop at 0', async () => {
      const { result } = renderHook(() => useEmailVerification());
      await setupSignupCodeSent(result);

      expect(result.current.verificationRemaining).toBe(180);

      act(() => { vi.advanceTimersByTime(1000); });
      expect(result.current.verificationRemaining).toBe(179);

      act(() => { vi.advanceTimersByTime(10000); });
      expect(result.current.verificationRemaining).toBe(169);

      // Advance beyond expiration - should stop at 0, not go negative
      act(() => { vi.advanceTimersByTime(190000); });
      expect(result.current.verificationRemaining).toBe(0);

      act(() => { vi.advanceTimersByTime(10000); });
      expect(result.current.verificationRemaining).toBe(0);
    });

    it('should stop timer when code is verified', async () => {
      const { result } = renderHook(() => useEmailVerification());
      await setupSignupFullyVerified(result);
      expect(result.current.verificationRemaining).toBe(0);
    });
  });

  describe('handleEmailAction Early Returns', () => {
    it.each([
      ['SIGNUP', false],
      ['RE_REGISTER', true],
    ] as const)('should not call service when already verified (%s)', async (verificationType, isReRegister) => {
      const options: UseEmailVerificationOptions = isReRegister
        ? { verificationType: 'RE_REGISTER' }
        : {};
      const { result } = renderHook(() => useEmailVerification(options));

      if (isReRegister) {
        await setupReRegisterFullyVerified(result);
      } else {
        await setupSignupFullyVerified(result);
      }

      vi.clearAllMocks();
      await act(async () => { await result.current.handleEmailAction(); });

      expect(authService.checkEmail).not.toHaveBeenCalled();
      expect(authService.sendEmailVerificationCode).not.toHaveBeenCalled();
    });

    it.each([
      ['SIGNUP', false],
      ['RE_REGISTER', true],
    ] as const)('should not call send code again when timer is running (%s)', async (verificationType, isReRegister) => {
      const options: UseEmailVerificationOptions = isReRegister
        ? { verificationType: 'RE_REGISTER' }
        : {};
      const { result } = renderHook(() => useEmailVerification(options));

      if (isReRegister) {
        await setupReRegisterCodeSent(result);
      } else {
        await setupSignupCodeSent(result);
      }

      expect(result.current.verificationRemaining).toBe(180);
      vi.clearAllMocks();

      await act(async () => { await result.current.handleEmailAction(); });

      expect(authService.sendEmailVerificationCode).not.toHaveBeenCalled();
    });
  });
});
