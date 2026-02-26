import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { createAuthenticatedState, createUnauthenticatedState } from '@tests/factories';
import { AppFooter } from '@shared/components/AppFooter';

// Mock useNavigate and useLocation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' }),
  };
});

describe('AppFooter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('모든 네비게이션 아이템이 렌더링된다', () => {
      renderWithProviders(<AppFooter />, {
        preloadedState: createUnauthenticatedState(),
      });

      expect(screen.getByText('홈')).toBeInTheDocument();
      expect(screen.getByText('에이전트')).toBeInTheDocument();
      expect(screen.getByText('추천 이력')).toBeInTheDocument();
      expect(screen.getByText('마이페이지')).toBeInTheDocument();
    });

    it('footer가 fixed 위치에 렌더링된다', () => {
      const { container } = renderWithProviders(<AppFooter />, {
        preloadedState: createUnauthenticatedState(),
      });

      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('fixed');
      expect(footer).toHaveClass('bottom-0');
    });
  });

  describe('네비게이션 테스트 - 비로그인 사용자', () => {
    it('홈 버튼을 클릭하면 홈으로 이동한다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<AppFooter />, {
        preloadedState: createUnauthenticatedState(),
      });

      await user.click(screen.getByText('홈'));

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('에이전트 버튼을 클릭하면 인증 프롬프트가 표시된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<AppFooter />, {
        preloadedState: createUnauthenticatedState(),
      });

      await user.click(screen.getByText('에이전트'));

      await waitFor(() => {
        expect(screen.getByText('로그인이 필요한 서비스입니다')).toBeInTheDocument();
      });
    });

    it('추천 이력 버튼을 클릭하면 인증 프롬프트가 표시된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<AppFooter />, {
        preloadedState: createUnauthenticatedState(),
      });

      await user.click(screen.getByText('추천 이력'));

      await waitFor(() => {
        expect(screen.getByText('로그인이 필요한 서비스입니다')).toBeInTheDocument();
      });
    });

    it('마이페이지 버튼을 클릭하면 인증 프롬프트가 표시된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<AppFooter />, {
        preloadedState: createUnauthenticatedState(),
      });

      await user.click(screen.getByText('마이페이지'));

      await waitFor(() => {
        expect(screen.getByText('로그인이 필요한 서비스입니다')).toBeInTheDocument();
      });
    });
  });

  describe('네비게이션 테스트 - 로그인 사용자', () => {
    it('에이전트 버튼을 클릭하면 에이전트 페이지로 이동한다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<AppFooter />, {
        preloadedState: createAuthenticatedState(),
      });

      await user.click(screen.getByText('에이전트'));

      expect(mockNavigate).toHaveBeenCalledWith('/agent');
    });

    it('추천 이력 버튼을 클릭하면 추천 이력 페이지로 이동한다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<AppFooter />, {
        preloadedState: createAuthenticatedState(),
      });

      await user.click(screen.getByText('추천 이력'));

      expect(mockNavigate).toHaveBeenCalledWith('/recommendations/history');
    });

    it('마이페이지 버튼을 클릭하면 마이페이지로 이동한다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<AppFooter />, {
        preloadedState: createAuthenticatedState(),
      });

      await user.click(screen.getByText('마이페이지'));

      expect(mockNavigate).toHaveBeenCalledWith('/mypage');
    });
  });

  describe('인증 프롬프트 모달 테스트', () => {
    it('인증 프롬프트에서 로그인하러 가기를 클릭하면 로그인 페이지로 이동한다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<AppFooter />, {
        preloadedState: createUnauthenticatedState(),
      });

      await user.click(screen.getByText('에이전트'));

      await waitFor(() => {
        expect(screen.getByText('로그인이 필요한 서비스입니다')).toBeInTheDocument();
      });

      await user.click(screen.getByText('로그인하러 가기'));

      expect(mockNavigate).toHaveBeenCalledWith('/login', { state: { redirectTo: '/agent' } });
    });

    it('인증 프롬프트에서 닫기를 클릭하면 모달이 닫힌다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<AppFooter />, {
        preloadedState: createUnauthenticatedState(),
      });

      await user.click(screen.getByText('에이전트'));

      await waitFor(() => {
        expect(screen.getByText('로그인이 필요한 서비스입니다')).toBeInTheDocument();
      });

      await user.click(screen.getByText('닫기'));

      await waitFor(() => {
        expect(screen.queryByText('로그인이 필요한 서비스입니다')).not.toBeInTheDocument();
      });
    });
  });

  // Note: Active state tests are skipped due to mocking complexity with useLocation

  describe('접근성 테스트', () => {
    it('모든 네비게이션 아이템이 버튼으로 렌더링된다', () => {
      renderWithProviders(<AppFooter />, {
        preloadedState: createAuthenticatedState(),
      });

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(4);
    });

    it('aria-hidden 속성이 있는 요소가 렌더링된다', () => {
      const { container } = renderWithProviders(<AppFooter />, {
        preloadedState: createAuthenticatedState(),
      });

      const ariaHidden = container.querySelector('[aria-hidden]');
      expect(ariaHidden).toBeInTheDocument();
    });
  });
});
