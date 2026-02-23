import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { PasswordInputSection } from '@/components/features/auth/PasswordInputSection';
import { VALIDATION, ERROR_MESSAGES } from '@shared/utils/constants';

describe('PasswordInputSection', () => {
  const defaultProps = {
    password: '',
    confirmPassword: '',
    onPasswordChange: vi.fn(),
    onConfirmPasswordChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render password input field', () => {
      renderWithProviders(<PasswordInputSection {...defaultProps} />);

      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(`비밀번호를 입력하세요 (최소 ${VALIDATION.PASSWORD_MIN_LENGTH}자)`)).toBeInTheDocument();
    });

    it('should render confirm password input field', () => {
      renderWithProviders(<PasswordInputSection {...defaultProps} />);

      expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('비밀번호를 다시 입력하세요')).toBeInTheDocument();
    });

    it('should render both inputs as password type', () => {
      renderWithProviders(<PasswordInputSection {...defaultProps} />);

      expect(screen.getByLabelText('비밀번호')).toHaveAttribute('type', 'password');
      expect(screen.getByLabelText('비밀번호 확인')).toHaveAttribute('type', 'password');
    });
  });

  describe('Password Input', () => {
    it('should call onPasswordChange when password input changes', async () => {
      const user = userEvent.setup();
      const onPasswordChange = vi.fn();

      renderWithProviders(
        <PasswordInputSection {...defaultProps} onPasswordChange={onPasswordChange} />
      );

      const passwordInput = screen.getByLabelText('비밀번호');
      await user.type(passwordInput, 'password123');

      expect(onPasswordChange).toHaveBeenCalled();
      expect(onPasswordChange).toHaveBeenCalledWith('p');
    });

    it('should display password value', () => {
      renderWithProviders(
        <PasswordInputSection {...defaultProps} password="testpass123" />
      );

      expect(screen.getByLabelText('비밀번호')).toHaveValue('testpass123');
    });

    it('should show error border when passwordError is provided', () => {
      renderWithProviders(
        <PasswordInputSection {...defaultProps} passwordError="비밀번호를 입력하세요" />
      );

      const passwordInput = screen.getByLabelText('비밀번호');
      expect(passwordInput).toHaveClass('border-red-500/60');
    });

    it('should display password error message', () => {
      const errorMessage = '비밀번호를 입력하세요';
      renderWithProviders(
        <PasswordInputSection {...defaultProps} passwordError={errorMessage} />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should show validation hint when password is too short', () => {
      renderWithProviders(
        <PasswordInputSection {...defaultProps} password="short" />
      );

      expect(screen.getByText(`비밀번호는 최소 ${VALIDATION.PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`)).toBeInTheDocument();
    });

    it('should not show validation hint when password is valid length', () => {
      const validPassword = 'a'.repeat(VALIDATION.PASSWORD_MIN_LENGTH);
      renderWithProviders(
        <PasswordInputSection {...defaultProps} password={validPassword} />
      );

      expect(screen.queryByText(`비밀번호는 최소 ${VALIDATION.PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`)).not.toBeInTheDocument();
    });

    it('should not show validation hint when password is empty', () => {
      renderWithProviders(
        <PasswordInputSection {...defaultProps} password="" />
      );

      expect(screen.queryByText(`비밀번호는 최소 ${VALIDATION.PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`)).not.toBeInTheDocument();
    });
  });

  describe('Confirm Password Input', () => {
    it('should call onConfirmPasswordChange when confirm password input changes', async () => {
      const user = userEvent.setup();
      const onConfirmPasswordChange = vi.fn();

      renderWithProviders(
        <PasswordInputSection
          {...defaultProps}
          onConfirmPasswordChange={onConfirmPasswordChange}
        />
      );

      const confirmPasswordInput = screen.getByLabelText('비밀번호 확인');
      await user.type(confirmPasswordInput, 'password123');

      expect(onConfirmPasswordChange).toHaveBeenCalled();
      expect(onConfirmPasswordChange).toHaveBeenCalledWith('p');
    });

    it('should display confirm password value', () => {
      renderWithProviders(
        <PasswordInputSection {...defaultProps} confirmPassword="testpass123" />
      );

      expect(screen.getByLabelText('비밀번호 확인')).toHaveValue('testpass123');
    });

    it('should show error border when confirmPasswordError is provided', () => {
      renderWithProviders(
        <PasswordInputSection
          {...defaultProps}
          confirmPasswordError="비밀번호가 일치하지 않습니다"
        />
      );

      const confirmPasswordInput = screen.getByLabelText('비밀번호 확인');
      expect(confirmPasswordInput).toHaveClass('border-red-500/60');
    });

    it('should display confirm password error message', () => {
      const errorMessage = '비밀번호가 일치하지 않습니다';
      renderWithProviders(
        <PasswordInputSection {...defaultProps} confirmPasswordError={errorMessage} />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should show mismatch error when passwords do not match', () => {
      renderWithProviders(
        <PasswordInputSection
          {...defaultProps}
          password="password123"
          confirmPassword="different"
        />
      );

      expect(screen.getByText(ERROR_MESSAGES.PASSWORD_MISMATCH)).toBeInTheDocument();
    });

    it('should not show mismatch error when passwords match', () => {
      renderWithProviders(
        <PasswordInputSection
          {...defaultProps}
          password="password123"
          confirmPassword="password123"
        />
      );

      expect(screen.queryByText(ERROR_MESSAGES.PASSWORD_MISMATCH)).not.toBeInTheDocument();
    });

    it('should not show mismatch error when confirm password is empty', () => {
      renderWithProviders(
        <PasswordInputSection {...defaultProps} password="password123" confirmPassword="" />
      );

      expect(screen.queryByText(ERROR_MESSAGES.PASSWORD_MISMATCH)).not.toBeInTheDocument();
    });

    it('should call onKeyPress when key is pressed', async () => {
      const user = userEvent.setup();
      const onKeyPress = vi.fn();

      renderWithProviders(
        <PasswordInputSection {...defaultProps} onKeyPress={onKeyPress} />
      );

      const confirmPasswordInput = screen.getByLabelText('비밀번호 확인');
      await user.type(confirmPasswordInput, '{Enter}');

      expect(onKeyPress).toHaveBeenCalled();
    });
  });

  describe('Validation Logic', () => {
    it('should show both password too short hint and mismatch error if applicable', () => {
      renderWithProviders(
        <PasswordInputSection
          {...defaultProps}
          password="short"
          confirmPassword="different"
        />
      );

      expect(screen.getByText(`비밀번호는 최소 ${VALIDATION.PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`)).toBeInTheDocument();
      expect(screen.getByText(ERROR_MESSAGES.PASSWORD_MISMATCH)).toBeInTheDocument();
    });

    it('should only show mismatch error when password is valid but does not match', () => {
      const validPassword = 'a'.repeat(VALIDATION.PASSWORD_MIN_LENGTH);
      renderWithProviders(
        <PasswordInputSection
          {...defaultProps}
          password={validPassword}
          confirmPassword="different"
        />
      );

      expect(screen.queryByText(`비밀번호는 최소 ${VALIDATION.PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`)).not.toBeInTheDocument();
      expect(screen.getByText(ERROR_MESSAGES.PASSWORD_MISMATCH)).toBeInTheDocument();
    });
  });

  describe('Border Styling', () => {
    it('should have default border when no errors', () => {
      renderWithProviders(<PasswordInputSection {...defaultProps} />);

      expect(screen.getByLabelText('비밀번호')).toHaveClass('border-white/15');
      expect(screen.getByLabelText('비밀번호 확인')).toHaveClass('border-white/15');
    });

    it('should have error border on both inputs when both have errors', () => {
      renderWithProviders(
        <PasswordInputSection
          {...defaultProps}
          passwordError="비밀번호 에러"
          confirmPasswordError="확인 비밀번호 에러"
        />
      );

      expect(screen.getByLabelText('비밀번호')).toHaveClass('border-red-500/60');
      expect(screen.getByLabelText('비밀번호 확인')).toHaveClass('border-red-500/60');
    });
  });

  describe('Accessibility', () => {
    it('should have proper label associations', () => {
      renderWithProviders(<PasswordInputSection {...defaultProps} />);

      const passwordInput = screen.getByLabelText('비밀번호');
      const confirmPasswordInput = screen.getByLabelText('비밀번호 확인');

      expect(passwordInput).toHaveAttribute('id', 'password');
      expect(confirmPasswordInput).toHaveAttribute('id', 'confirmPassword');
    });

    it('should have focus styles', () => {
      renderWithProviders(<PasswordInputSection {...defaultProps} />);

      const passwordInput = screen.getByLabelText('비밀번호');
      expect(passwordInput).toHaveClass('focus:border-orange-300/60', 'focus:outline-none', 'focus:ring-2', 'focus:ring-orange-400/60');
    });
  });
});
