import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { createAuthenticatedState } from '@tests/factories';
import { UserMenu } from '@/components/common/UserMenu';

const mockNavigate = vi.fn();
const mockDispatch = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('UserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDispatch.mockResolvedValue({ type: 'auth/logout' });
  });

  describe('렌더링 테스트', () => {
    it('메뉴 버튼이 렌더링된다', () => {
      renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ name: '홍길동' }),
      });

      const menuButton = screen.getByRole('button');
      expect(menuButton).toBeInTheDocument();
    });

    it('사용자 이름이 표시된다 (데스크톱)', () => {
      renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ name: '홍길동' }),
      });

      expect(screen.getByText('홍길동님')).toBeInTheDocument();
    });

    it('햄버거 아이콘이 렌더링된다', () => {
      const { container } = renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ name: '홍길동' }),
      });

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('메뉴 열기/닫기 테스트', () => {
    it('메뉴 버튼을 클릭하면 드롭다운이 열린다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ name: '홍길동' }),
      });

      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      expect(screen.getByText('마이페이지')).toBeInTheDocument();
      expect(screen.getByText('추천 이력')).toBeInTheDocument();
      expect(screen.getByText('로그아웃')).toBeInTheDocument();
    });

    it('메뉴가 열린 상태에서 다시 버튼을 클릭하면 닫힌다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ name: '홍길동' }),
      });

      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      expect(screen.getByText('마이페이지')).toBeInTheDocument();

      await user.click(menuButton);

      await waitFor(() => {
        expect(screen.queryByText('마이페이지')).not.toBeInTheDocument();
      });
    });

    it('메뉴 외부를 클릭하면 메뉴가 닫힌다', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <div>
          <UserMenu />
          <div data-testid="outside">외부 영역</div>
        </div>,
        {
          preloadedState: createAuthenticatedState({ name: '홍길동' }),
        }
      );

      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      expect(screen.getByText('마이페이지')).toBeInTheDocument();

      const outside = screen.getByTestId('outside');
      await user.click(outside);

      await waitFor(() => {
        expect(screen.queryByText('마이페이지')).not.toBeInTheDocument();
      });
    });
  });

  describe('메뉴 아이템 클릭 테스트', () => {
    it('마이페이지를 클릭하면 마이페이지로 이동한다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ name: '홍길동' }),
      });

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('마이페이지'));

      expect(mockNavigate).toHaveBeenCalledWith('/mypage');
    });

    it('추천 이력을 클릭하면 추천 이력 페이지로 이동한다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ name: '홍길동' }),
      });

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('추천 이력'));

      expect(mockNavigate).toHaveBeenCalledWith('/recommendations/history');
    });

    it('메뉴 아이템 클릭 후 메뉴가 닫힌다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ name: '홍길동' }),
      });

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('마이페이지'));

      await waitFor(() => {
        expect(screen.queryByText('추천 이력')).not.toBeInTheDocument();
      });
    });
  });

  describe('관리자 메뉴 테스트', () => {
    it('일반 사용자에게는 문의사항 관리 메뉴가 표시되지 않는다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ role: 'USER' }),
      });

      await user.click(screen.getByRole('button'));

      expect(screen.queryByText('문의사항 관리')).not.toBeInTheDocument();
    });

    it('관리자에게는 문의사항 관리 메뉴가 표시된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ role: 'ADMIN' }),
      });

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('문의사항 관리')).toBeInTheDocument();
    });

    it('관리자가 문의사항 관리를 클릭하면 관리 페이지로 이동한다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ role: 'ADMIN' }),
      });

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('문의사항 관리'));

      expect(mockNavigate).toHaveBeenCalledWith('/admin/bug-reports');
    });
  });

  describe('로그아웃 테스트', () => {
    it('로그아웃 버튼이 빨간색으로 표시된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ name: '홍길동' }),
      });

      await user.click(screen.getByRole('button'));

      const logoutButton = screen.getByText('로그아웃');
      expect(logoutButton).toHaveClass('text-red-400');
    });

    it('로그아웃을 클릭하면 홈으로 이동한다', async () => {
      const user = userEvent.setup();

      const { store } = renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ name: '홍길동' }),
      });

      // Mock dispatch
      const originalDispatch = store.dispatch;
      store.dispatch = vi.fn(originalDispatch) as unknown as typeof store.dispatch;

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByText('로그아웃'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('로그아웃 후 메뉴가 닫힌다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ name: '홍길동' }),
      });

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('로그아웃')).toBeInTheDocument();

      await user.click(screen.getByText('로그아웃'));

      await waitFor(() => {
        expect(screen.queryByText('마이페이지')).not.toBeInTheDocument();
      });
    });
  });

  describe('스타일 테스트', () => {
    it('메뉴 버튼이 적절한 스타일을 가진다', () => {
      renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ name: '홍길동' }),
      });

      const menuButton = screen.getByRole('button');
      expect(menuButton).toHaveClass('rounded-xl');
      expect(menuButton).toHaveClass('border');
    });

    it('드롭다운이 절대 위치에 렌더링된다', async () => {
      const user = userEvent.setup();

      const { container } = renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ name: '홍길동' }),
      });

      await user.click(screen.getByRole('button'));

      const dropdown = container.querySelector('.absolute.right-0');
      expect(dropdown).toBeInTheDocument();
    });

    it('드롭다운이 둥근 모서리를 가진다', async () => {
      const user = userEvent.setup();

      const { container } = renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ name: '홍길동' }),
      });

      await user.click(screen.getByRole('button'));

      const dropdown = container.querySelector('.rounded-xl');
      expect(dropdown).toBeInTheDocument();
    });

    it('드롭다운이 backdrop-blur를 가진다', async () => {
      const user = userEvent.setup();

      const { container } = renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ name: '홍길동' }),
      });

      await user.click(screen.getByRole('button'));

      const dropdown = container.querySelector('.backdrop-blur');
      expect(dropdown).toBeInTheDocument();
    });
  });

  describe('반응형 테스트', () => {
    it('사용자 이름이 모바일에서는 숨겨진다', () => {
      renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ name: '홍길동' }),
      });

      const userName = screen.getByText('홍길동님');
      expect(userName).toHaveClass('hidden');
      expect(userName).toHaveClass('sm:inline');
    });
  });

  describe('구분선 테스트', () => {
    it('로그아웃 위에 구분선이 렌더링된다', async () => {
      const user = userEvent.setup();

      const { container } = renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ name: '홍길동' }),
      });

      await user.click(screen.getByRole('button'));

      const divider = container.querySelector('.border-t');
      expect(divider).toBeInTheDocument();
    });
  });

  describe('접근성 테스트', () => {
    it('메뉴 버튼이 button 역할을 가진다', () => {
      renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ name: '홍길동' }),
      });

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('드롭다운 메뉴 아이템들이 버튼으로 렌더링된다', async () => {
      const user = userEvent.setup();

      renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ name: '홍길동' }),
      });

      await user.click(screen.getByRole('button'));

      const menuItems = screen.getAllByRole('button');
      expect(menuItems.length).toBeGreaterThanOrEqual(3); // 최소 3개 (마이페이지, 추천 이력, 로그아웃)
    });
  });
});
