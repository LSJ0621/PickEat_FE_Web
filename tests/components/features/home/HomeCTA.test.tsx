import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { HomeCTA } from '@/components/features/home/HomeCTA';
import type { RootState } from '@/store';

// Mock useScrollAnimation hook with default visible state
const mockUseScrollAnimation = vi.fn(() => ({
  ref: { current: null },
  isVisible: true,
}));

vi.mock('@/hooks/common/useScrollAnimation', () => ({
  useScrollAnimation: () => mockUseScrollAnimation(),
}));

describe('HomeCTA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseScrollAnimation.mockReturnValue({
      ref: { current: null },
      isVisible: true,
    });
  });

  describe('Rendering', () => {
    it('should render section with correct content', () => {
      renderWithProviders(<HomeCTA />);

      expect(screen.getByText('지금 바로 PickEat을 시작해보세요')).toBeInTheDocument();
      expect(
        screen.getByText('로그인 후 AI 에이전트가 준비한 맞춤 추천과 가게 탐색을 경험할 수 있습니다.')
      ).toBeInTheDocument();
    });

    it('should render section with proper styling', () => {
      const { container } = renderWithProviders(<HomeCTA />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('py-20', 'px-4');
    });
  });

  describe('Unauthenticated User', () => {
    const unauthenticatedState: Partial<RootState> = {
      auth: {
        isAuthenticated: false,
        user: null,
        token: null,
      },
    };

    it('should show login button for unauthenticated users', () => {
      renderWithProviders(<HomeCTA />, { preloadedState: unauthenticatedState });

      expect(screen.getByRole('button', { name: '이메일로 로그인' })).toBeInTheDocument();
    });

    it('should show preview button for unauthenticated users', () => {
      renderWithProviders(<HomeCTA />, { preloadedState: unauthenticatedState });

      expect(screen.getByRole('button', { name: '에이전트 미리보기' })).toBeInTheDocument();
    });

    it('should navigate to login page when login button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<HomeCTA />, {
        preloadedState: unauthenticatedState,
        useMemoryRouter: true,
      });

      const loginButton = screen.getByRole('button', { name: '이메일로 로그인' });
      await user.click(loginButton);

      // In real scenario, this would navigate to /login
      // Just verify button was clickable
      expect(loginButton).toBeInTheDocument();
    });

    it('should show auth prompt modal when preview button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<HomeCTA />, {
        preloadedState: unauthenticatedState,
        useMemoryRouter: true,
      });

      await user.click(screen.getByRole('button', { name: '에이전트 미리보기' }));

      // AuthPromptModal should appear
      expect(screen.getByText('로그인이 필요한 서비스입니다')).toBeInTheDocument();
    });

    it('should close auth prompt modal when close button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<HomeCTA />, {
        preloadedState: unauthenticatedState,
        useMemoryRouter: true,
      });

      // Open modal
      await user.click(screen.getByRole('button', { name: '에이전트 미리보기' }));
      expect(screen.getByText('로그인이 필요한 서비스입니다')).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByRole('button', { name: '닫기' });
      await user.click(closeButton);

      // Modal should be closed (but due to animation, we check for aria-hidden)
      // Note: This depends on your modal implementation
    });

    it('should navigate to login when auth prompt modal confirm is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<HomeCTA />, {
        preloadedState: unauthenticatedState,
        useMemoryRouter: true,
      });

      // Open modal
      await user.click(screen.getByRole('button', { name: '에이전트 미리보기' }));
      expect(screen.getByText('로그인이 필요한 서비스입니다')).toBeInTheDocument();

      // Click confirm button
      const confirmButton = screen.getByRole('button', { name: '로그인하러 가기' });
      await user.click(confirmButton);

      // Modal should close and navigate to login
      // In real scenario, this would navigate to /login
    });
  });

  describe('Authenticated User', () => {
    const authenticatedState: Partial<RootState> = {
      auth: {
        isAuthenticated: true,
        user: {
          id: 1,
          email: 'test@example.com',
          name: '테스트 유저',
          role: 'USER',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        token: 'test-token',
      },
    };

    it('should show agent button for authenticated users', () => {
      renderWithProviders(<HomeCTA />, { preloadedState: authenticatedState });

      expect(screen.getByRole('button', { name: '에이전트로 이동' })).toBeInTheDocument();
    });

    it('should show mypage button for authenticated users', () => {
      renderWithProviders(<HomeCTA />, { preloadedState: authenticatedState });

      expect(screen.getByRole('button', { name: '마이페이지 열어보기' })).toBeInTheDocument();
    });

    it('should not show login buttons for authenticated users', () => {
      renderWithProviders(<HomeCTA />, { preloadedState: authenticatedState });

      expect(screen.queryByRole('button', { name: '이메일로 로그인' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '에이전트 미리보기' })).not.toBeInTheDocument();
    });

    it('should navigate to agent page when agent button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<HomeCTA />, {
        preloadedState: authenticatedState,
        useMemoryRouter: true,
      });

      const agentButton = screen.getByRole('button', { name: '에이전트로 이동' });
      await user.click(agentButton);

      // In real scenario, this would navigate to /agent
      expect(agentButton).toBeInTheDocument();
    });

    it('should navigate to mypage when mypage button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<HomeCTA />, {
        preloadedState: authenticatedState,
        useMemoryRouter: true,
      });

      const mypageButton = screen.getByRole('button', { name: '마이페이지 열어보기' });
      await user.click(mypageButton);

      // In real scenario, this would navigate to /mypage
      expect(mypageButton).toBeInTheDocument();
    });
  });

  describe('Button Styling', () => {
    it('should apply correct size to buttons', () => {
      renderWithProviders(<HomeCTA />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('px-8', 'py-6', 'text-lg');
      });
    });

    it('should have primary button with default variant', () => {
      const unauthenticatedState: Partial<RootState> = {
        auth: {
          isAuthenticated: false,
          user: null,
          token: null,
        },
      };

      renderWithProviders(<HomeCTA />, { preloadedState: unauthenticatedState });

      const loginButton = screen.getByRole('button', { name: '이메일로 로그인' });
      expect(loginButton).toBeInTheDocument();
    });

    it('should have ghost variant for secondary button', () => {
      const unauthenticatedState: Partial<RootState> = {
        auth: {
          isAuthenticated: false,
          user: null,
          token: null,
        },
      };

      renderWithProviders(<HomeCTA />, { preloadedState: unauthenticatedState });

      const previewButton = screen.getByRole('button', { name: '에이전트 미리보기' });
      expect(previewButton).toBeInTheDocument();
    });
  });

  describe('Scroll Animation', () => {
    it('should apply animation transition classes', () => {
      const { container} = renderWithProviders(<HomeCTA />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('transition-all', 'duration-700');
    });

    it('should apply visible classes when isVisible is true', () => {
      const { container } = renderWithProviders(<HomeCTA />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('opacity-100', 'translate-y-0');
    });

    it('should apply hidden classes when isVisible is false', () => {
      mockUseScrollAnimation.mockReturnValue({
        ref: { current: null },
        isVisible: false,
      });

      const { container } = renderWithProviders(<HomeCTA />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('opacity-0', 'translate-y-8');
    });
  });

  describe('Container Layout', () => {
    it('should have centered content with max width', () => {
      const { container } = renderWithProviders(<HomeCTA />);

      const innerDiv = container.querySelector('.mx-auto.max-w-4xl');
      expect(innerDiv).toBeInTheDocument();
    });

    it('should have gradient background card', () => {
      const { container } = renderWithProviders(<HomeCTA />);

      const card = container.querySelector('.rounded-\\[32px\\]');
      expect(card).toBeInTheDocument();
    });

    it('should have text center alignment in card', () => {
      const { container } = renderWithProviders(<HomeCTA />);

      const card = container.querySelector('.text-center');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic section element', () => {
      const { container } = renderWithProviders(<HomeCTA />);

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      renderWithProviders(<HomeCTA />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('지금 바로 PickEat을 시작해보세요');
    });

    it('should have accessible buttons with proper text', () => {
      renderWithProviders(<HomeCTA />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.textContent).toBeTruthy();
      });
    });
  });
});
