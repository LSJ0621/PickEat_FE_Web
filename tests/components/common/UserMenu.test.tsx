import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { createAuthenticatedState } from '@tests/factories';
import { UserMenu } from '@shared/components/UserMenu';

describe('UserMenu', () => {
  describe('렌더링 테스트', () => {
    it('사용자 이름이 표시된다', () => {
      renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ name: '홍길동' }),
      });

      expect(screen.getByText('홍길동님')).toBeInTheDocument();
    });

    it('사용자 이름이 없으면 이름이 표시되지 않는다', () => {
      renderWithProviders(<UserMenu />, {
        preloadedState: {
          auth: {
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          },
        },
      });

      expect(screen.queryByText(/님$/)).not.toBeInTheDocument();
    });
  });

  describe('스타일 테스트', () => {
    it('컴포넌트가 렌더링된다', () => {
      const { container } = renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ name: '홍길동' }),
      });

      expect(container.firstChild).toBeInTheDocument();
    });

    it('사용자 이름이 모바일에서는 숨겨진다', () => {
      renderWithProviders(<UserMenu />, {
        preloadedState: createAuthenticatedState({ name: '홍길동' }),
      });

      const userName = screen.getByText('홍길동님');
      expect(userName).toHaveClass('hidden');
      expect(userName).toHaveClass('sm:inline');
    });
  });
});
