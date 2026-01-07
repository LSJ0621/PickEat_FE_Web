import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { createAuthenticatedState, createUnauthenticatedState } from '@tests/factories';
import { AppHeader } from '@/components/common/AppHeader';

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
      expect(screen.getByText('P')).toBeInTheDocument();
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

    it('사용자 이름이 표시되지 않는다', () => {
      renderWithProviders(<AppHeader />, {
        preloadedState: createUnauthenticatedState(),
      });

      expect(screen.queryByText(/님$/)).not.toBeInTheDocument();
    });

    it('주소가 표시되지 않는다', () => {
      const { container } = renderWithProviders(<AppHeader />, {
        preloadedState: createUnauthenticatedState(),
      });

      expect(container.textContent).not.toContain('📍');
    });
  });

  describe('로그인 사용자 렌더링', () => {
    it('사용자 이름이 표시된다', () => {
      renderWithProviders(<AppHeader />, {
        preloadedState: createAuthenticatedState({ name: '홍길동' }),
      });

      expect(screen.getByText('홍길동님')).toBeInTheDocument();
    });

    it('사용자 주소가 표시된다', () => {
      renderWithProviders(<AppHeader />, {
        preloadedState: createAuthenticatedState({ address: '서울시 강남구' }),
      });

      expect(screen.getByText(/📍 서울시 강남구/)).toBeInTheDocument();
    });

    it('로그인 버튼이 표시되지 않는다', () => {
      renderWithProviders(<AppHeader />, {
        preloadedState: createAuthenticatedState(),
      });

      expect(screen.queryByRole('button', { name: '로그인' })).not.toBeInTheDocument();
    });

    it('주소와 이름이 모두 표시된다', () => {
      renderWithProviders(<AppHeader />, {
        preloadedState: createAuthenticatedState({
          name: '홍길동',
          address: '서울시 강남구'
        }),
      });

      expect(screen.getByText('홍길동님')).toBeInTheDocument();
      expect(screen.getByText(/📍 서울시 강남구/)).toBeInTheDocument();
    });
  });

  // Note: Auth page tests are skipped due to mocking complexity with useLocation

  describe('주소 표시 반응형 테스트', () => {
    it('주소가 hidden 클래스를 가진다 (모바일에서 숨김)', () => {
      renderWithProviders(<AppHeader />, {
        preloadedState: createAuthenticatedState({ address: '서울시 강남구' }),
      });

      const addressElement = screen.getByText(/📍 서울시 강남구/);
      expect(addressElement).toHaveClass('hidden');
      expect(addressElement).toHaveClass('sm:inline-flex');
    });
  });

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
    it('로고가 그라디언트 배경을 가진다', () => {
      renderWithProviders(<AppHeader />, {
        preloadedState: createUnauthenticatedState(),
      });

      const logoIcon = screen.getByText('P');
      expect(logoIcon).toHaveClass('bg-gradient-to-br');
      expect(logoIcon).toHaveClass('from-orange-400');
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
