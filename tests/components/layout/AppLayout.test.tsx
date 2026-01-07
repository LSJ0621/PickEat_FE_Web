import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { createUnauthenticatedState, createAuthenticatedState } from '@tests/factories';
import { AppLayout } from '@/components/layout/AppLayout';

// Mock the useNavigate and useLocation from react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' }),
  };
});

describe('AppLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('자식 컴포넌트가 렌더링된다', () => {
      renderWithProviders(
        <AppLayout>
          <div data-testid="test-child">테스트 자식 컴포넌트</div>
        </AppLayout>,
        {
          preloadedState: createUnauthenticatedState(),
        }
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('테스트 자식 컴포넌트')).toBeInTheDocument();
    });

    it('기본적으로 헤더가 렌더링된다', () => {
      renderWithProviders(
        <AppLayout>
          <div>콘텐츠</div>
        </AppLayout>,
        {
          preloadedState: createUnauthenticatedState(),
        }
      );

      // AppHeader renders "PickEat" text
      expect(screen.getByText('PickEat')).toBeInTheDocument();
    });

    it('기본적으로 푸터가 렌더링된다', () => {
      renderWithProviders(
        <AppLayout>
          <div>콘텐츠</div>
        </AppLayout>,
        {
          preloadedState: createUnauthenticatedState(),
        }
      );

      // AppFooter renders navigation items
      expect(screen.getByText('홈')).toBeInTheDocument();
      expect(screen.getByText('에이전트')).toBeInTheDocument();
    });
  });

  describe('헤더 표시 제어 테스트', () => {
    it('showHeader가 true면 헤더가 표시된다', () => {
      renderWithProviders(
        <AppLayout showHeader={true}>
          <div>콘텐츠</div>
        </AppLayout>,
        {
          preloadedState: createUnauthenticatedState(),
        }
      );

      expect(screen.getByText('PickEat')).toBeInTheDocument();
    });

    it('showHeader가 false면 헤더가 숨겨진다', () => {
      renderWithProviders(
        <AppLayout showHeader={false}>
          <div>콘텐츠</div>
        </AppLayout>,
        {
          preloadedState: createUnauthenticatedState(),
        }
      );

      expect(screen.queryByText('PickEat')).not.toBeInTheDocument();
    });
  });

  describe('푸터 표시 제어 테스트', () => {
    it('showFooter가 true면 푸터가 표시된다', () => {
      renderWithProviders(
        <AppLayout showFooter={true}>
          <div>콘텐츠</div>
        </AppLayout>,
        {
          preloadedState: createUnauthenticatedState(),
        }
      );

      expect(screen.getByText('홈')).toBeInTheDocument();
    });

    it('showFooter가 false면 푸터가 숨겨진다', () => {
      renderWithProviders(
        <AppLayout showFooter={false}>
          <div>콘텐츠</div>
        </AppLayout>,
        {
          preloadedState: createUnauthenticatedState(),
        }
      );

      expect(screen.queryByText('마이페이지')).not.toBeInTheDocument();
    });
  });

  describe('헤더와 푸터 동시 제어 테스트', () => {
    it('showHeader와 showFooter 모두 false면 둘 다 숨겨진다', () => {
      renderWithProviders(
        <AppLayout showHeader={false} showFooter={false}>
          <div>콘텐츠만 표시</div>
        </AppLayout>,
        {
          preloadedState: createUnauthenticatedState(),
        }
      );

      expect(screen.queryByText('PickEat')).not.toBeInTheDocument();
      expect(screen.queryByText('홈')).not.toBeInTheDocument();
      expect(screen.getByText('콘텐츠만 표시')).toBeInTheDocument();
    });

    it('showHeader만 false면 푸터는 표시된다', () => {
      renderWithProviders(
        <AppLayout showHeader={false} showFooter={true}>
          <div>콘텐츠</div>
        </AppLayout>,
        {
          preloadedState: createUnauthenticatedState(),
        }
      );

      expect(screen.queryByText('PickEat')).not.toBeInTheDocument();
      expect(screen.getByText('홈')).toBeInTheDocument();
    });

    it('showFooter만 false면 헤더는 표시된다', () => {
      renderWithProviders(
        <AppLayout showHeader={true} showFooter={false}>
          <div>콘텐츠</div>
        </AppLayout>,
        {
          preloadedState: createUnauthenticatedState(),
        }
      );

      expect(screen.getByText('PickEat')).toBeInTheDocument();
      expect(screen.queryByText('마이페이지')).not.toBeInTheDocument();
    });
  });

  describe('자식 컴포넌트 렌더링 테스트', () => {
    it('여러 자식 컴포넌트가 렌더링된다', () => {
      renderWithProviders(
        <AppLayout>
          <div data-testid="child-1">첫 번째 자식</div>
          <div data-testid="child-2">두 번째 자식</div>
          <div data-testid="child-3">세 번째 자식</div>
        </AppLayout>,
        {
          preloadedState: createUnauthenticatedState(),
        }
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });

    it('복잡한 자식 컴포넌트가 렌더링된다', () => {
      renderWithProviders(
        <AppLayout>
          <main>
            <h1>페이지 제목</h1>
            <section>
              <p>섹션 내용</p>
            </section>
          </main>
        </AppLayout>,
        {
          preloadedState: createUnauthenticatedState(),
        }
      );

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('페이지 제목')).toBeInTheDocument();
      expect(screen.getByText('섹션 내용')).toBeInTheDocument();
    });
  });

  describe('인증 상태에 따른 레이아웃 테스트', () => {
    it('비로그인 상태에서 로그인 버튼이 헤더에 표시된다', () => {
      renderWithProviders(
        <AppLayout>
          <div>콘텐츠</div>
        </AppLayout>,
        {
          preloadedState: createUnauthenticatedState(),
        }
      );

      expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
    });

    it('로그인 상태에서 사용자 이름이 헤더에 표시된다', () => {
      renderWithProviders(
        <AppLayout>
          <div>콘텐츠</div>
        </AppLayout>,
        {
          preloadedState: createAuthenticatedState({ name: '홍길동' }),
        }
      );

      expect(screen.getByText('홍길동님')).toBeInTheDocument();
    });
  });

  describe('콘텐츠 영역 구조 테스트', () => {
    it('자식 컴포넌트가 div로 감싸진다', () => {
      renderWithProviders(
        <AppLayout>
          <div data-testid="test-content">테스트 콘텐츠</div>
        </AppLayout>,
        {
          preloadedState: createUnauthenticatedState(),
        }
      );

      const contentWrapper = screen.getByTestId('test-content').parentElement;
      expect(contentWrapper?.tagName.toLowerCase()).toBe('div');
    });
  });

  describe('기본 props 테스트', () => {
    it('props를 지정하지 않아도 기본값이 적용된다', () => {
      renderWithProviders(
        <AppLayout>
          <div>콘텐츠</div>
        </AppLayout>,
        {
          preloadedState: createUnauthenticatedState(),
        }
      );

      // 기본값으로 헤더와 푸터 모두 표시
      expect(screen.getByText('PickEat')).toBeInTheDocument();
      expect(screen.getByText('홈')).toBeInTheDocument();
    });
  });
});
