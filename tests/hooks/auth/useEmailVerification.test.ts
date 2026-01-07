import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEmailVerification } from '@/hooks/auth/useEmailVerification';
import type { UseEmailVerificationOptions } from '@/hooks/auth/useEmailVerification';
import { authService } from '@/api/services/auth';
import { ERROR_MESSAGES } from '@/utils/constants';

vi.mock('@/api/services/auth');

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

      await act(async () => {
        await result.current.handleCheckEmail();
      });

      expect(result.current.emailError).toBe(ERROR_MESSAGES.EMAIL_REQUIRED);
    });

    it('should set error when email is invalid', async () => {
      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('invalid-email');
      });

      await act(async () => {
        await result.current.handleCheckEmail();
      });

      expect(result.current.emailError).toBe(ERROR_MESSAGES.INVALID_EMAIL);
      expect(result.current.emailAvailable).toBe(null);
      expect(result.current.emailChecked).toBe(false);
    });

    it('should successfully check available email', async () => {
      vi.mocked(authService.checkEmail).mockResolvedValue({
        available: true,
        message: '사용 가능한 이메일입니다.',
        canReRegister: false,
      });

      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleCheckEmail();
      });

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

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleCheckEmail();
      });

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

      const options: UseEmailVerificationOptions = { onReRegister };
      const { result } = renderHook(() => useEmailVerification(options));

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleCheckEmail();
      });

      expect(onReRegister).toHaveBeenCalledWith('test@example.com', '재가입 가능합니다.');
    });

    it('should handle check email error', async () => {
      vi.mocked(authService.checkEmail).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleCheckEmail();
      });

      expect(result.current.emailError).toBe('Network error');
      expect(result.current.emailAvailable).toBe(null);
      expect(result.current.emailChecked).toBe(false);
    });
  });

  describe('handleSendVerificationCode', () => {
    it('should set error when email is empty', async () => {
      const { result } = renderHook(() => useEmailVerification());

      await act(async () => {
        await result.current.handleSendVerificationCode();
      });

      expect(result.current.emailError).toBe(ERROR_MESSAGES.EMAIL_REQUIRED);
    });

    it('should set error when email is invalid', async () => {
      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('invalid-email');
      });

      await act(async () => {
        await result.current.handleSendVerificationCode();
      });

      expect(result.current.emailError).toBe(ERROR_MESSAGES.INVALID_EMAIL);
    });

    it('should require email check for SIGNUP type', async () => {
      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleSendVerificationCode();
      });

      expect(result.current.emailError).toBe(ERROR_MESSAGES.EMAIL_DUPLICATE_CHECK_REQUIRED);
    });

    it('should successfully send verification code for SIGNUP', async () => {
      vi.mocked(authService.checkEmail).mockResolvedValue({
        available: true,
        message: '사용 가능한 이메일입니다.',
        canReRegister: false,
      });
      vi.mocked(authService.sendEmailVerificationCode).mockResolvedValue({
        success: true,
        message: '인증 코드를 발송했습니다.',
      });

      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleCheckEmail();
      });

      await act(async () => {
        await result.current.handleSendVerificationCode();
      });

      expect(result.current.isCodeSent).toBe(true);
      expect(result.current.verificationMessage).toBe('인증 코드를 발송했습니다.');
      expect(result.current.verificationMessageVariant).toBe('success');
      expect(result.current.verificationRemaining).toBe(180);
    });

    it('should send verification code without email check for RE_REGISTER', async () => {
      vi.mocked(authService.sendEmailVerificationCode).mockResolvedValue({
        success: true,
        message: '인증 코드를 발송했습니다.',
      });

      const options: UseEmailVerificationOptions = { verificationType: 'RE_REGISTER' };
      const { result } = renderHook(() => useEmailVerification(options));

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleSendVerificationCode();
      });

      expect(result.current.isCodeSent).toBe(true);
      expect(authService.sendEmailVerificationCode).toHaveBeenCalledWith('test@example.com', 'RE_REGISTER');
    });

    it('should handle send code error', async () => {
      vi.mocked(authService.checkEmail).mockResolvedValue({
        available: true,
        message: '사용 가능한 이메일입니다.',
        canReRegister: false,
      });
      vi.mocked(authService.sendEmailVerificationCode).mockRejectedValue(new Error('Server error'));

      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleCheckEmail();
      });

      await act(async () => {
        await result.current.handleSendVerificationCode();
      });

      expect(result.current.verificationMessage).toBe('Server error');
      expect(result.current.verificationMessageVariant).toBe('error');
    });
  });

  describe('handleVerifyCode', () => {
    it('should set error when code is not sent', async () => {
      const { result } = renderHook(() => useEmailVerification());

      await act(async () => {
        await result.current.handleVerifyCode();
      });

      expect(result.current.verificationMessage).toBe('인증 코드를 먼저 발송해주세요.');
      expect(result.current.verificationMessageVariant).toBe('error');
    });

    it('should set error when verification code is empty', async () => {
      vi.mocked(authService.checkEmail).mockResolvedValue({
        available: true,
        message: '사용 가능한 이메일입니다.',
        canReRegister: false,
      });
      vi.mocked(authService.sendEmailVerificationCode).mockResolvedValue({
        success: true,
        message: '인증 코드를 발송했습니다.',
      });

      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleCheckEmail();
      });

      await act(async () => {
        await result.current.handleSendVerificationCode();
      });

      await act(async () => {
        await result.current.handleVerifyCode();
      });

      expect(result.current.verificationMessage).toBe(ERROR_MESSAGES.VERIFICATION_CODE_REQUIRED);
      expect(result.current.verificationMessageVariant).toBe('error');
    });

    it('should successfully verify code', async () => {
      vi.mocked(authService.checkEmail).mockResolvedValue({
        available: true,
        message: '사용 가능한 이메일입니다.',
        canReRegister: false,
      });
      vi.mocked(authService.sendEmailVerificationCode).mockResolvedValue({
        success: true,
        message: '인증 코드를 발송했습니다.',
      });
      vi.mocked(authService.verifyEmailCode).mockResolvedValue({
        success: true,
        message: '이메일 인증이 완료되었습니다.',
      });

      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleCheckEmail();
      });

      await act(async () => {
        await result.current.handleSendVerificationCode();
      });

      act(() => {
        result.current.setVerificationCode('123456');
      });

      await act(async () => {
        await result.current.handleVerifyCode();
      });

      expect(result.current.isEmailVerified).toBe(true);
      expect(result.current.verificationMessage).toBe('이메일 인증이 완료되었습니다.');
      expect(result.current.verificationMessageVariant).toBe('success');
      expect(result.current.verificationRemaining).toBe(0);
    });

    it('should handle verify code error', async () => {
      vi.mocked(authService.checkEmail).mockResolvedValue({
        available: true,
        message: '사용 가능한 이메일입니다.',
        canReRegister: false,
      });
      vi.mocked(authService.sendEmailVerificationCode).mockResolvedValue({
        success: true,
        message: '인증 코드를 발송했습니다.',
      });
      vi.mocked(authService.verifyEmailCode).mockRejectedValue(new Error('Invalid code'));

      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleCheckEmail();
      });

      await act(async () => {
        await result.current.handleSendVerificationCode();
      });

      act(() => {
        result.current.setVerificationCode('123456');
      });

      await act(async () => {
        await result.current.handleVerifyCode();
      });

      expect(result.current.isEmailVerified).toBe(false);
      expect(result.current.verificationMessage).toBe('Invalid code');
      expect(result.current.verificationMessageVariant).toBe('error');
    });
  });

  describe('Email Action Functions', () => {
    it('should return correct label for SIGNUP before email check', () => {
      const { result } = renderHook(() => useEmailVerification());

      expect(result.current.getEmailActionLabel()).toBe('중복 확인');
    });

    it('should return correct label for SIGNUP after email check', async () => {
      vi.mocked(authService.checkEmail).mockResolvedValue({
        available: true,
        message: '사용 가능한 이메일입니다.',
        canReRegister: false,
      });

      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleCheckEmail();
      });

      expect(result.current.getEmailActionLabel()).toBe('인증번호 발송');
    });

    it('should return correct label for RE_REGISTER', () => {
      const options: UseEmailVerificationOptions = { verificationType: 'RE_REGISTER' };
      const { result } = renderHook(() => useEmailVerification(options));

      expect(result.current.getEmailActionLabel()).toBe('인증번호 발송');
    });

    it('should handle email action for SIGNUP - check email first', async () => {
      vi.mocked(authService.checkEmail).mockResolvedValue({
        available: true,
        message: '사용 가능한 이메일입니다.',
        canReRegister: false,
      });

      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleEmailAction();
      });

      expect(result.current.emailChecked).toBe(true);
      expect(authService.checkEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should handle email action for RE_REGISTER - send code directly', async () => {
      vi.mocked(authService.sendEmailVerificationCode).mockResolvedValue({
        success: true,
        message: '인증 코드를 발송했습니다.',
      });

      const options: UseEmailVerificationOptions = { verificationType: 'RE_REGISTER' };
      const { result } = renderHook(() => useEmailVerification(options));

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleEmailAction();
      });

      expect(result.current.isCodeSent).toBe(true);
      expect(authService.sendEmailVerificationCode).toHaveBeenCalledWith('test@example.com', 'RE_REGISTER');
    });

    it('should disable action when email is empty', () => {
      const { result } = renderHook(() => useEmailVerification());

      expect(result.current.isEmailActionDisabled()).toBe(true);
    });

    it('should disable action when email is verified', async () => {
      vi.mocked(authService.checkEmail).mockResolvedValue({
        available: true,
        message: '사용 가능한 이메일입니다.',
        canReRegister: false,
      });
      vi.mocked(authService.sendEmailVerificationCode).mockResolvedValue({
        success: true,
        message: '인증 코드를 발송했습니다.',
      });
      vi.mocked(authService.verifyEmailCode).mockResolvedValue({
        success: true,
        message: '이메일 인증이 완료되었습니다.',
      });

      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleCheckEmail();
      });

      await act(async () => {
        await result.current.handleSendVerificationCode();
      });

      act(() => {
        result.current.setVerificationCode('123456');
      });

      await act(async () => {
        await result.current.handleVerifyCode();
      });

      expect(result.current.isEmailActionDisabled()).toBe(true);
    });
  });

  describe('Email Change', () => {
    it('should reset verification state when email changes', async () => {
      vi.mocked(authService.checkEmail).mockResolvedValue({
        available: true,
        message: '사용 가능한 이메일입니다.',
        canReRegister: false,
      });

      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleCheckEmail();
      });

      expect(result.current.emailChecked).toBe(true);

      act(() => {
        result.current.setEmail('new@example.com');
      });

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
      vi.mocked(authService.checkEmail).mockResolvedValue({
        available: true,
        message: '사용 가능한 이메일입니다.',
        canReRegister: false,
      });

      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleCheckEmail();
      });

      act(() => {
        result.current.resetEmailVerification();
      });

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
    it('should start timer when code is sent', async () => {
      vi.mocked(authService.checkEmail).mockResolvedValue({
        available: true,
        message: '사용 가능한 이메일입니다.',
        canReRegister: false,
      });
      vi.mocked(authService.sendEmailVerificationCode).mockResolvedValue({
        success: true,
        message: '인증 코드를 발송했습니다.',
      });

      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleCheckEmail();
      });

      await act(async () => {
        await result.current.handleSendVerificationCode();
      });

      expect(result.current.verificationRemaining).toBe(180);
    });

    it('should stop timer when code is verified', async () => {
      vi.mocked(authService.checkEmail).mockResolvedValue({
        available: true,
        message: '사용 가능한 이메일입니다.',
        canReRegister: false,
      });
      vi.mocked(authService.sendEmailVerificationCode).mockResolvedValue({
        success: true,
        message: '인증 코드를 발송했습니다.',
      });
      vi.mocked(authService.verifyEmailCode).mockResolvedValue({
        success: true,
        message: '이메일 인증이 완료되었습니다.',
      });

      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleCheckEmail();
      });

      await act(async () => {
        await result.current.handleSendVerificationCode();
      });

      act(() => {
        result.current.setVerificationCode('123456');
      });

      await act(async () => {
        await result.current.handleVerifyCode();
      });

      expect(result.current.verificationRemaining).toBe(0);
    });

    it('should countdown timer every second', async () => {
      vi.mocked(authService.checkEmail).mockResolvedValue({
        available: true,
        message: '사용 가능한 이메일입니다.',
        canReRegister: false,
      });
      vi.mocked(authService.sendEmailVerificationCode).mockResolvedValue({
        success: true,
        message: '인증 코드를 발송했습니다.',
      });

      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleCheckEmail();
      });

      await act(async () => {
        await result.current.handleSendVerificationCode();
      });

      expect(result.current.verificationRemaining).toBe(180);

      // Advance timer by 1 second
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.verificationRemaining).toBe(179);

      // Advance timer by 10 seconds
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.verificationRemaining).toBe(169);
    });

    it('timer should stop at 0 and not go negative', async () => {
      vi.mocked(authService.checkEmail).mockResolvedValue({
        available: true,
        message: '사용 가능한 이메일입니다.',
        canReRegister: false,
      });
      vi.mocked(authService.sendEmailVerificationCode).mockResolvedValue({
        success: true,
        message: '인증 코드를 발송했습니다.',
      });

      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleCheckEmail();
      });

      await act(async () => {
        await result.current.handleSendVerificationCode();
      });

      expect(result.current.verificationRemaining).toBe(180);

      // Advance timer beyond expiration
      act(() => {
        vi.advanceTimersByTime(190000); // 190 seconds
      });

      expect(result.current.verificationRemaining).toBe(0);

      // Further advancement should not make it negative
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.verificationRemaining).toBe(0);
    });
  });

  describe('Label Display Tests', () => {
    describe('SIGNUP type labels', () => {
      it('should show "중복 확인" before email check', () => {
        const { result } = renderHook(() => useEmailVerification());

        act(() => {
          result.current.setEmail('test@example.com');
        });

        expect(result.current.getEmailActionLabel()).toBe('중복 확인');
      });

      it('should show "인증번호 발송" after successful email check', async () => {
        vi.mocked(authService.checkEmail).mockResolvedValue({
          available: true,
          message: '사용 가능한 이메일입니다.',
          canReRegister: false,
        });

        const { result } = renderHook(() => useEmailVerification());

        act(() => {
          result.current.setEmail('test@example.com');
        });

        await act(async () => {
          await result.current.handleCheckEmail();
        });

        expect(result.current.getEmailActionLabel()).toBe('인증번호 발송');
      });

      it('should show "유효시간 MM:SS" when timer is running', async () => {
        vi.mocked(authService.checkEmail).mockResolvedValue({
          available: true,
          message: '사용 가능한 이메일입니다.',
          canReRegister: false,
        });
        vi.mocked(authService.sendEmailVerificationCode).mockResolvedValue({
          success: true,
          message: '인증 코드를 발송했습니다.',
        });

        const { result } = renderHook(() => useEmailVerification());

        act(() => {
          result.current.setEmail('test@example.com');
        });

        await act(async () => {
          await result.current.handleCheckEmail();
        });

        await act(async () => {
          await result.current.handleSendVerificationCode();
        });

        expect(result.current.getEmailActionLabel()).toContain('유효시간');
        expect(result.current.getEmailActionLabel()).toContain('03:00'); // 180 seconds = 3:00
      });

      it('should show "인증 완료" after successful verification', async () => {
        vi.mocked(authService.checkEmail).mockResolvedValue({
          available: true,
          message: '사용 가능한 이메일입니다.',
          canReRegister: false,
        });
        vi.mocked(authService.sendEmailVerificationCode).mockResolvedValue({
          success: true,
          message: '인증 코드를 발송했습니다.',
        });
        vi.mocked(authService.verifyEmailCode).mockResolvedValue({
          success: true,
          message: '이메일 인증이 완료되었습니다.',
        });

        const { result } = renderHook(() => useEmailVerification());

        act(() => {
          result.current.setEmail('test@example.com');
        });

        await act(async () => {
          await result.current.handleCheckEmail();
        });

        await act(async () => {
          await result.current.handleSendVerificationCode();
        });

        act(() => {
          result.current.setVerificationCode('123456');
        });

        await act(async () => {
          await result.current.handleVerifyCode();
        });

        expect(result.current.getEmailActionLabel()).toBe('인증 완료');
      });
    });

    describe('RE_REGISTER type labels', () => {
      it('should show "인증번호 발송" without email check', () => {
        const options: UseEmailVerificationOptions = { verificationType: 'RE_REGISTER' };
        const { result } = renderHook(() => useEmailVerification(options));

        act(() => {
          result.current.setEmail('test@example.com');
        });

        expect(result.current.getEmailActionLabel()).toBe('인증번호 발송');
      });

      it('should show "유효시간 MM:SS" when timer is running for RE_REGISTER', async () => {
        vi.mocked(authService.sendEmailVerificationCode).mockResolvedValue({
          success: true,
          message: '인증 코드를 발송했습니다.',
        });

        const options: UseEmailVerificationOptions = { verificationType: 'RE_REGISTER' };
        const { result } = renderHook(() => useEmailVerification(options));

        act(() => {
          result.current.setEmail('test@example.com');
        });

        await act(async () => {
          await result.current.handleSendVerificationCode();
        });

        expect(result.current.getEmailActionLabel()).toContain('유효시간');
      });

      it('should show "인증 완료" after verification for RE_REGISTER', async () => {
        vi.mocked(authService.sendEmailVerificationCode).mockResolvedValue({
          success: true,
          message: '인증 코드를 발송했습니다.',
        });
        vi.mocked(authService.verifyEmailCode).mockResolvedValue({
          success: true,
          message: '이메일 인증이 완료되었습니다.',
        });

        const options: UseEmailVerificationOptions = { verificationType: 'RE_REGISTER' };
        const { result } = renderHook(() => useEmailVerification(options));

        act(() => {
          result.current.setEmail('test@example.com');
        });

        await act(async () => {
          await result.current.handleSendVerificationCode();
        });

        act(() => {
          result.current.setVerificationCode('123456');
        });

        await act(async () => {
          await result.current.handleVerifyCode();
        });

        expect(result.current.getEmailActionLabel()).toBe('인증 완료');
      });
    });
  });

  describe('handleEmailAction Early Returns', () => {
    it('should return early if already verified (SIGNUP)', async () => {
      vi.mocked(authService.checkEmail).mockResolvedValue({
        available: true,
        message: '사용 가능한 이메일입니다.',
        canReRegister: false,
      });
      vi.mocked(authService.sendEmailVerificationCode).mockResolvedValue({
        success: true,
        message: '인증 코드를 발송했습니다.',
      });
      vi.mocked(authService.verifyEmailCode).mockResolvedValue({
        success: true,
        message: '이메일 인증이 완료되었습니다.',
      });

      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleCheckEmail();
      });

      await act(async () => {
        await result.current.handleSendVerificationCode();
      });

      act(() => {
        result.current.setVerificationCode('123456');
      });

      await act(async () => {
        await result.current.handleVerifyCode();
      });

      // Clear mocks to check if they're called again
      vi.clearAllMocks();

      // Try to send code again after verification
      await act(async () => {
        await result.current.handleEmailAction();
      });

      // Should not call any service
      expect(authService.checkEmail).not.toHaveBeenCalled();
      expect(authService.sendEmailVerificationCode).not.toHaveBeenCalled();
    });

    it('should return early if code sent and timer running (SIGNUP)', async () => {
      vi.mocked(authService.checkEmail).mockResolvedValue({
        available: true,
        message: '사용 가능한 이메일입니다.',
        canReRegister: false,
      });
      vi.mocked(authService.sendEmailVerificationCode).mockResolvedValue({
        success: true,
        message: '인증 코드를 발송했습니다.',
      });

      const { result } = renderHook(() => useEmailVerification());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleCheckEmail();
      });

      await act(async () => {
        await result.current.handleSendVerificationCode();
      });

      expect(result.current.verificationRemaining).toBe(180);

      // Clear mocks
      vi.clearAllMocks();

      // Try to call handleEmailAction again while timer is running
      await act(async () => {
        await result.current.handleEmailAction();
      });

      // Should not call send code again
      expect(authService.sendEmailVerificationCode).not.toHaveBeenCalled();
    });

    it('should return early if already verified (RE_REGISTER)', async () => {
      vi.mocked(authService.sendEmailVerificationCode).mockResolvedValue({
        success: true,
        message: '인증 코드를 발송했습니다.',
      });
      vi.mocked(authService.verifyEmailCode).mockResolvedValue({
        success: true,
        message: '이메일 인증이 완료되었습니다.',
      });

      const options: UseEmailVerificationOptions = { verificationType: 'RE_REGISTER' };
      const { result } = renderHook(() => useEmailVerification(options));

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleSendVerificationCode();
      });

      act(() => {
        result.current.setVerificationCode('123456');
      });

      await act(async () => {
        await result.current.handleVerifyCode();
      });

      vi.clearAllMocks();

      // Try to send code again
      await act(async () => {
        await result.current.handleEmailAction();
      });

      expect(authService.sendEmailVerificationCode).not.toHaveBeenCalled();
    });

    it('should return early if code sent and timer running (RE_REGISTER)', async () => {
      vi.mocked(authService.sendEmailVerificationCode).mockResolvedValue({
        success: true,
        message: '인증 코드를 발송했습니다.',
      });

      const options: UseEmailVerificationOptions = { verificationType: 'RE_REGISTER' };
      const { result } = renderHook(() => useEmailVerification(options));

      act(() => {
        result.current.setEmail('test@example.com');
      });

      await act(async () => {
        await result.current.handleSendVerificationCode();
      });

      expect(result.current.verificationRemaining).toBe(180);

      vi.clearAllMocks();

      // Try to call again while timer is running
      await act(async () => {
        await result.current.handleEmailAction();
      });

      expect(authService.sendEmailVerificationCode).not.toHaveBeenCalled();
    });
  });

});
