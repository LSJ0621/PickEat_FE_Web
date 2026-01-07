import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { ReRegisterFormSection } from '@/components/features/auth/ReRegisterFormSection';

describe('ReRegisterFormSection', () => {
  const defaultProps = {
    name: '',
    onNameChange: vi.fn(),
    onReRegister: vi.fn(),
    isLoading: false,
    isEmailVerified: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render name input field', () => {
      renderWithProviders(<ReRegisterFormSection {...defaultProps} />);

      expect(screen.getByLabelText('이름')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('이름을 입력하세요')).toBeInTheDocument();
    });

    it('should render re-register button', () => {
      renderWithProviders(<ReRegisterFormSection {...defaultProps} />);

      expect(screen.getByRole('button', { name: '재가입' })).toBeInTheDocument();
    });

    it('should not render back to login button by default', () => {
      renderWithProviders(<ReRegisterFormSection {...defaultProps} />);

      expect(screen.queryByRole('button', { name: '로그인으로 돌아가기' })).not.toBeInTheDocument();
    });

    it('should render back to login button when onBackToLogin is provided', () => {
      renderWithProviders(
        <ReRegisterFormSection {...defaultProps} onBackToLogin={vi.fn()} />
      );

      expect(screen.getByRole('button', { name: '로그인으로 돌아가기' })).toBeInTheDocument();
    });
  });

  describe('Name Input', () => {
    it('should call onNameChange when name input changes', async () => {
      const user = userEvent.setup();
      const onNameChange = vi.fn();

      renderWithProviders(
        <ReRegisterFormSection {...defaultProps} onNameChange={onNameChange} />
      );

      const nameInput = screen.getByLabelText('이름');
      await user.type(nameInput, '홍길동');

      expect(onNameChange).toHaveBeenCalled();
      expect(onNameChange).toHaveBeenCalledWith('홍');
    });

    it('should display name value', () => {
      renderWithProviders(<ReRegisterFormSection {...defaultProps} name="홍길동" />);

      expect(screen.getByLabelText('이름')).toHaveValue('홍길동');
    });

    it('should display name error message when provided', () => {
      const errorMessage = '이름을 입력하세요';
      renderWithProviders(<ReRegisterFormSection {...defaultProps} nameError={errorMessage} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should have proper styling', () => {
      renderWithProviders(<ReRegisterFormSection {...defaultProps} />);

      const nameInput = screen.getByLabelText('이름');
      expect(nameInput).toHaveClass(
        'w-full',
        'rounded-2xl',
        'border',
        'border-white/15',
        'bg-white/5',
        'px-4',
        'py-3',
        'text-white'
      );
    });
  });

  describe('Re-register Button', () => {
    it('should call onReRegister when clicked', async () => {
      const user = userEvent.setup();
      const onReRegister = vi.fn();

      renderWithProviders(
        <ReRegisterFormSection {...defaultProps} onReRegister={onReRegister} />
      );

      await user.click(screen.getByRole('button', { name: '재가입' }));
      expect(onReRegister).toHaveBeenCalledTimes(1);
    });

    it('should show loading text when isLoading is true', () => {
      renderWithProviders(<ReRegisterFormSection {...defaultProps} isLoading={true} />);

      expect(screen.getByText('로딩 중...')).toBeInTheDocument();
      expect(screen.queryByText('재가입')).not.toBeInTheDocument();
    });

    it('should be disabled when isLoading is true', () => {
      renderWithProviders(<ReRegisterFormSection {...defaultProps} isLoading={true} />);

      expect(screen.getByRole('button', { name: '로딩 중...' })).toBeDisabled();
    });

    it('should be disabled when email is not verified', () => {
      renderWithProviders(
        <ReRegisterFormSection {...defaultProps} isEmailVerified={false} />
      );

      expect(screen.getByRole('button', { name: '재가입' })).toBeDisabled();
    });

    it('should be enabled when email is verified and not loading', () => {
      renderWithProviders(
        <ReRegisterFormSection {...defaultProps} isEmailVerified={true} isLoading={false} />
      );

      expect(screen.getByRole('button', { name: '재가입' })).not.toBeDisabled();
    });

    it('should have gradient background styling', () => {
      renderWithProviders(<ReRegisterFormSection {...defaultProps} />);

      const button = screen.getByRole('button', { name: '재가입' });
      expect(button).toHaveClass(
        'bg-gradient-to-r',
        'from-orange-500',
        'to-rose-500',
        'text-white'
      );
    });

    it('should have proper size styling', () => {
      renderWithProviders(<ReRegisterFormSection {...defaultProps} />);

      const button = screen.getByRole('button', { name: '재가입' });
      expect(button).toHaveClass('w-full');
    });

    it('should not call onReRegister when disabled', async () => {
      const user = userEvent.setup();
      const onReRegister = vi.fn();

      renderWithProviders(
        <ReRegisterFormSection
          {...defaultProps}
          onReRegister={onReRegister}
          isEmailVerified={false}
        />
      );

      await user.click(screen.getByRole('button', { name: '재가입' }));
      expect(onReRegister).not.toHaveBeenCalled();
    });
  });

  describe('Back to Login Button', () => {
    it('should call onBackToLogin when clicked', async () => {
      const user = userEvent.setup();
      const onBackToLogin = vi.fn();

      renderWithProviders(
        <ReRegisterFormSection {...defaultProps} onBackToLogin={onBackToLogin} />
      );

      await user.click(screen.getByRole('button', { name: '로그인으로 돌아가기' }));
      expect(onBackToLogin).toHaveBeenCalledTimes(1);
    });

    it('should have proper styling', () => {
      renderWithProviders(
        <ReRegisterFormSection {...defaultProps} onBackToLogin={vi.fn()} />
      );

      const button = screen.getByRole('button', { name: '로그인으로 돌아가기' });
      expect(button).toHaveClass('text-sm', 'text-slate-400', 'hover:text-white', 'transition');
    });

    it('should be in a centered container', () => {
      renderWithProviders(
        <ReRegisterFormSection {...defaultProps} onBackToLogin={vi.fn()} />
      );

      const button = screen.getByRole('button', { name: '로그인으로 돌아가기' });
      const parentDiv = button.parentElement;
      expect(parentDiv).toHaveClass('text-center');
    });
  });

  describe('Combined States', () => {
    it('should handle all props correctly at once', () => {
      const props = {
        name: '홍길동',
        nameError: '이름이 너무 짧습니다',
        onNameChange: vi.fn(),
        onReRegister: vi.fn(),
        isLoading: false,
        isEmailVerified: true,
        onBackToLogin: vi.fn(),
      };

      renderWithProviders(<ReRegisterFormSection {...props} />);

      expect(screen.getByLabelText('이름')).toHaveValue('홍길동');
      expect(screen.getByText('이름이 너무 짧습니다')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '재가입' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '로그인으로 돌아가기' })).toBeInTheDocument();
    });

    it('should handle loading state with all other props', () => {
      const props = {
        name: '홍길동',
        onNameChange: vi.fn(),
        onReRegister: vi.fn(),
        isLoading: true,
        isEmailVerified: true,
        onBackToLogin: vi.fn(),
      };

      renderWithProviders(<ReRegisterFormSection {...props} />);

      expect(screen.getByText('로딩 중...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '로딩 중...' })).toBeDisabled();
      expect(screen.getByRole('button', { name: '로그인으로 돌아가기' })).toBeInTheDocument();
    });

    it('should handle unverified email state', () => {
      const props = {
        name: '홍길동',
        onNameChange: vi.fn(),
        onReRegister: vi.fn(),
        isLoading: false,
        isEmailVerified: false,
        onBackToLogin: vi.fn(),
      };

      renderWithProviders(<ReRegisterFormSection {...props} />);

      expect(screen.getByRole('button', { name: '재가입' })).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper label association for name input', () => {
      renderWithProviders(<ReRegisterFormSection {...defaultProps} />);

      const nameInput = screen.getByLabelText('이름');
      expect(nameInput).toHaveAttribute('id', 'name');
    });

    it('should have proper button types', () => {
      renderWithProviders(
        <ReRegisterFormSection {...defaultProps} onBackToLogin={vi.fn()} />
      );

      const reRegisterButton = screen.getByRole('button', { name: '재가입' });
      const backButton = screen.getByRole('button', { name: '로그인으로 돌아가기' });

      expect(reRegisterButton).toBeInTheDocument();
      expect(backButton).toBeInTheDocument();
    });

    it('should have focus styles on name input', () => {
      renderWithProviders(<ReRegisterFormSection {...defaultProps} />);

      const nameInput = screen.getByLabelText('이름');
      expect(nameInput).toHaveClass(
        'focus:border-orange-300/60',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-orange-400/60'
      );
    });
  });
});
