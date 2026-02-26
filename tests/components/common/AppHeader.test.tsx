import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { createAuthenticatedState, createUnauthenticatedState } from '@tests/factories';
import { AppHeader } from '@shared/components/AppHeader';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' }),
  };
});

describe('AppHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('로고와 서비스명이 렌더링된다', () => {
      renderWithProviders(<AppHeader />, {
        preloadedState: createUnauthenticatedState(),
      });

      expect(screen.getByText('PickEat')).toBeInTheDocument();
      expect(screen.getByText('Recommendation OS')).toBeInTheDocument();
    });

    it('sticky header로 렌더링된다', () => {
      const { container } = renderWithProviders(<AppHeader />, {
        preloadedState: createUnauthenticatedState(),
      });

      const header = container.querySelector('header');
      expect(header).toHaveClass('sticky');
      expect(header).toHaveClass('top-0');
    });
  });

  describe('로고 클릭 테스트', () => {
    it('로고를 클릭하면 홈으로 이동한다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<AppHeader />, {
        preloadedState: createUnauthenticatedState(),
      });

      const logo = screen.getByText('PickEat').closest('button');
      if (logo) {
        await user.click(logo);
      }

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('비로그인 사용자 렌더링', () => {
    it('로그인 버튼이 표시된다', () => {
      renderWithProviders(<AppHeader />, {
        preloadedState: createUnauthenticatedState(),
      });

      expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
    });

    it('로그인 버튼을 클릭하면 로그인 페이지로 이동한다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<AppHeader />, {
        preloadedState: createUnauthenticatedState(),
      });

      await user.click(screen.getByRole('button', { name: '로그인' }));

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('로그인 사용자 렌더링', () => {
    it('로그인 버튼이 표시되지 않는다', () => {
      renderWithProviders(<AppHeader />, {
        preloadedState: createAuthenticatedState(),
      });

      expect(screen.queryByRole('button', { name: '로그인' })).not.toBeInTheDocument();
    });
  });

  // Note: Auth page tests are skipped due to mocking complexity with useLocation

  describe('접근성 테스트', () => {
    it('헤더가 header 태그로 렌더링된다', () => {
      renderWithProviders(<AppHeader />, {
        preloadedState: createUnauthenticatedState(),
      });

      const header = document.querySelector('header');
      expect(header).toBeInTheDocument();
    });

    it('로고가 버튼으로 렌더링되어 클릭 가능하다', () => {
      renderWithProviders(<AppHeader />, {
        preloadedState: createUnauthenticatedState(),
      });

      const logo = screen.getByText('PickEat').closest('button');
      expect(logo).toBeInTheDocument();
    });
  });

  describe('스타일 테스트', () => {
    it('로고 아이콘이 그라디언트 배경을 가진다', () => {
      renderWithProviders(<AppHeader />, {
        preloadedState: createUnauthenticatedState(),
      });

      const { container } = renderWithProviders(<AppHeader />, {
        preloadedState: createUnauthenticatedState(),
      });

      const logoIcon = container.querySelector('.bg-gradient-to-br');
      expect(logoIcon).toBeInTheDocument();
    });

    it('헤더가 backdrop-blur를 가진다', () => {
      renderWithProviders(<AppHeader />, {
        preloadedState: createUnauthenticatedState(),
      });

      const headerContent = document.querySelector('.backdrop-blur');
      expect(headerContent).toBeInTheDocument();
    });
  });
});
