import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { createMockEmailVerification } from '@tests/factories';
import { EmailVerificationSection } from '@features/auth/components/EmailVerificationSection';

describe('EmailVerificationSection', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render email input field', () => {
      const mockEmailVerification = createMockEmailVerification();
      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      expect(screen.getByLabelText('이메일')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('이메일을 입력하세요')).toBeInTheDocument();
    });

    it('should render verification code input field', () => {
      const mockEmailVerification = createMockEmailVerification();
      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      expect(screen.getByText('이메일 인증')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('6자리 인증번호 입력')).toBeInTheDocument();
    });

    it('should render email action button with correct label', () => {
      const mockEmailVerification = createMockEmailVerification({
        getEmailActionLabel: vi.fn(() => '중복 확인'),
      });
      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      expect(screen.getByRole('button', { name: '중복 확인' })).toBeInTheDocument();
    });

    it('should render verify button', () => {
      const mockEmailVerification = createMockEmailVerification();
      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
    });
  });

  describe('Email Input', () => {
    it('should call setEmail and onEmailChange when email input changes', async () => {
      const user = userEvent.setup();
      const mockEmailVerification = createMockEmailVerification();
      const onEmailChange = vi.fn();

      renderWithProviders(
        <EmailVerificationSection
          emailVerification={mockEmailVerification}
          onEmailChange={onEmailChange}
        />
      );

      const emailInput = screen.getByLabelText('이메일');
      await user.type(emailInput, 'test@example.com');

      expect(mockEmailVerification.setEmail).toHaveBeenCalled();
      expect(onEmailChange).toHaveBeenCalled();
    });

    it('should display email value from emailVerification state', () => {
      const mockEmailVerification = createMockEmailVerification({
        email: 'test@example.com',
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      expect(screen.getByLabelText('이메일')).toHaveValue('test@example.com');
    });

    it('should show error border when emailError is present', () => {
      const mockEmailVerification = createMockEmailVerification({
        emailError: '이미 사용 중인 이메일입니다.',
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      const emailInput = screen.getByLabelText('이메일');
      expect(emailInput).toHaveClass('border-red-500/60');
    });

    it('should show success border when email is available', () => {
      const mockEmailVerification = createMockEmailVerification({
        emailAvailable: true,
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      const emailInput = screen.getByLabelText('이메일');
      expect(emailInput).toHaveClass('border-green-400');
    });

    it('should display email error message', () => {
      const errorMessage = '이미 사용 중인 이메일입니다.';
      const mockEmailVerification = createMockEmailVerification({
        emailError: errorMessage,
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should display emailError prop over emailVerification.emailError', () => {
      const mockEmailVerification = createMockEmailVerification({
        emailError: '내부 에러',
      });

      renderWithProviders(
        <EmailVerificationSection
          emailVerification={mockEmailVerification}
          emailError="외부 에러"
        />
      );

      expect(screen.getByText('외부 에러')).toBeInTheDocument();
      expect(screen.queryByText('내부 에러')).not.toBeInTheDocument();
    });

    it('should display success message when email is available', () => {
      const mockEmailVerification = createMockEmailVerification({
        emailAvailable: true,
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      expect(screen.getByText('사용 가능한 이메일입니다.')).toBeInTheDocument();
    });
  });

  describe('Email Action Button', () => {
    it('should call handleEmailAction when clicked', async () => {
      const user = userEvent.setup();
      const mockEmailVerification = createMockEmailVerification({
        handleEmailAction: vi.fn(),
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      await user.click(screen.getByRole('button', { name: '중복 확인' }));
      expect(mockEmailVerification.handleEmailAction).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when isEmailActionDisabled returns true', () => {
      const mockEmailVerification = createMockEmailVerification({
        isEmailActionDisabled: vi.fn(() => true),
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      expect(screen.getByRole('button', { name: '중복 확인' })).toBeDisabled();
    });

    it('should show gradient style when email is checked and available', () => {
      const mockEmailVerification = createMockEmailVerification({
        emailChecked: true,
        emailAvailable: true,
        getEmailActionLabel: vi.fn(() => '인증번호 발송'),
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      const button = screen.getByRole('button', { name: '인증번호 발송' });
      expect(button).toHaveClass('from-fuchsia-500', 'to-pink-500');
    });
  });

  describe('Verification Code Input', () => {
    it('should call setVerificationCode and onVerificationCodeChange when input changes', async () => {
      const user = userEvent.setup();
      const mockEmailVerification = createMockEmailVerification({
        isCodeSent: true,
      });
      const onVerificationCodeChange = vi.fn();

      renderWithProviders(
        <EmailVerificationSection
          emailVerification={mockEmailVerification}
          onVerificationCodeChange={onVerificationCodeChange}
        />
      );

      const codeInput = screen.getByPlaceholderText('6자리 인증번호 입력');
      await user.type(codeInput, '123456');

      expect(mockEmailVerification.setVerificationCode).toHaveBeenCalled();
      expect(onVerificationCodeChange).toHaveBeenCalled();
    });

    it('should display verification code value from state', () => {
      const mockEmailVerification = createMockEmailVerification({
        verificationCode: '123456',
        isCodeSent: true,
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      expect(screen.getByPlaceholderText('6자리 인증번호 입력')).toHaveValue('123456');
    });

    it('should be disabled when code is not sent', () => {
      const mockEmailVerification = createMockEmailVerification({
        isCodeSent: false,
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      expect(screen.getByPlaceholderText('6자리 인증번호 입력')).toBeDisabled();
    });

    it('should be disabled when email is already verified', () => {
      const mockEmailVerification = createMockEmailVerification({
        isCodeSent: true,
        isEmailVerified: true,
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      expect(screen.getByPlaceholderText('6자리 인증번호 입력')).toBeDisabled();
    });

    it('should have maxLength of 6', () => {
      const mockEmailVerification = createMockEmailVerification({
        isCodeSent: true,
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      expect(screen.getByPlaceholderText('6자리 인증번호 입력')).toHaveAttribute('maxLength', '6');
    });

    it('should have numeric input mode', () => {
      const mockEmailVerification = createMockEmailVerification({
        isCodeSent: true,
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      expect(screen.getByPlaceholderText('6자리 인증번호 입력')).toHaveAttribute('inputMode', 'numeric');
    });

    it('should show success border when email is verified', () => {
      const mockEmailVerification = createMockEmailVerification({
        isCodeSent: true,
        isEmailVerified: true,
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      expect(screen.getByPlaceholderText('6자리 인증번호 입력')).toHaveClass('border-green-400');
    });

    it('should show error border when verificationCodeError is present', () => {
      const mockEmailVerification = createMockEmailVerification({
        isCodeSent: true,
      });

      renderWithProviders(
        <EmailVerificationSection
          emailVerification={mockEmailVerification}
          verificationCodeError="잘못된 인증번호입니다."
        />
      );

      expect(screen.getByPlaceholderText('6자리 인증번호 입력')).toHaveClass('border-red-500/60');
    });
  });

  describe('Verify Button', () => {
    it('should call handleVerifyCode when clicked', async () => {
      const user = userEvent.setup();
      const mockEmailVerification = createMockEmailVerification({
        isCodeSent: true,
        verificationCode: '123456',
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      await user.click(screen.getByRole('button', { name: '확인' }));
      expect(mockEmailVerification.handleVerifyCode).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when verifyCodeLoading is true', () => {
      const mockEmailVerification = createMockEmailVerification({
        isCodeSent: true,
        verifyCodeLoading: true,
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      // Button shows loading text when verifyCodeLoading is true
      expect(screen.getByRole('button', { name: '로딩 중...' })).toBeDisabled();
    });

    it('should be disabled when code is not sent', () => {
      const mockEmailVerification = createMockEmailVerification({
        isCodeSent: false,
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      expect(screen.getByRole('button', { name: '확인' })).toBeDisabled();
    });

    it('should be disabled when email is already verified', () => {
      const mockEmailVerification = createMockEmailVerification({
        isCodeSent: true,
        isEmailVerified: true,
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      expect(screen.getByRole('button', { name: '확인' })).toBeDisabled();
    });

    it('should be disabled when verification code is empty', () => {
      const mockEmailVerification = createMockEmailVerification({
        isCodeSent: true,
        verificationCode: '',
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      expect(screen.getByRole('button', { name: '확인' })).toBeDisabled();
    });

    it('should show loading state when verifyCodeLoading is true', () => {
      const mockEmailVerification = createMockEmailVerification({
        isCodeSent: true,
        verificationCode: '123456',
        verifyCodeLoading: true,
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      expect(screen.getByRole('button', { name: '로딩 중...' })).toHaveClass('cursor-not-allowed');
    });
  });

  describe('Resend Code Button', () => {
    it('should show resend button when code is sent but not verified', () => {
      const mockEmailVerification = createMockEmailVerification({
        isCodeSent: true,
        isEmailVerified: false,
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      expect(screen.getByRole('button', { name: '재발송 받기' })).toBeInTheDocument();
    });

    it('should not show resend button when code is not sent', () => {
      const mockEmailVerification = createMockEmailVerification({
        isCodeSent: false,
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      expect(screen.queryByRole('button', { name: '재발송 받기' })).not.toBeInTheDocument();
    });

    it('should not show resend button when email is verified', () => {
      const mockEmailVerification = createMockEmailVerification({
        isCodeSent: true,
        isEmailVerified: true,
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      expect(screen.queryByRole('button', { name: '재발송 받기' })).not.toBeInTheDocument();
    });

    it('should call handleSendVerificationCode when clicked', async () => {
      const user = userEvent.setup();
      const mockEmailVerification = createMockEmailVerification({
        isCodeSent: true,
        isEmailVerified: false,
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      await user.click(screen.getByRole('button', { name: '재발송 받기' }));
      expect(mockEmailVerification.handleSendVerificationCode).toHaveBeenCalledTimes(1);
    });
  });

  describe('Verification Messages', () => {
    it('should display verification message with success variant', () => {
      const mockEmailVerification = createMockEmailVerification({
        verificationMessage: '인증이 완료되었습니다.',
        verificationMessageVariant: 'success',
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      const message = screen.getByText('인증이 완료되었습니다.');
      expect(message).toBeInTheDocument();
      expect(message).toHaveClass('text-green-400');
    });

    it('should display verification message with error variant', () => {
      const mockEmailVerification = createMockEmailVerification({
        verificationMessage: '인증에 실패했습니다.',
        verificationMessageVariant: 'error',
      });

      renderWithProviders(
        <EmailVerificationSection emailVerification={mockEmailVerification} />
      );

      const message = screen.getByText('인증에 실패했습니다.');
      expect(message).toBeInTheDocument();
      expect(message).toHaveClass('text-red-400');
    });

    it('should display verificationCodeError prop message', () => {
      const mockEmailVerification = createMockEmailVerification();

      renderWithProviders(
        <EmailVerificationSection
          emailVerification={mockEmailVerification}
          verificationCodeError="잘못된 인증번호입니다."
        />
      );

      expect(screen.getByText('잘못된 인증번호입니다.')).toBeInTheDocument();
    });
  });
});
