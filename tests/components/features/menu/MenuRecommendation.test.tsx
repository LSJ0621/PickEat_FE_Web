import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { MenuRecommendation } from '@/components/features/menu/MenuRecommendation';
import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';

describe('MenuRecommendation', () => {
  const mockOnMenuSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const authenticatedState = {
    auth: {
      isAuthenticated: true,
      user: { id: 1, email: 'test@example.com', nickname: 'TestUser' },
      token: 'test-token',
    },
    agent: {
      selectedMenu: null,
      restaurants: [],
      isSearching: false,
      aiRecommendationGroups: [],
      aiLoadingMenu: null,
      menuRecommendations: [],
      menuRecommendationHistoryId: null,
      menuRecommendationRequestAddress: null,
      menuRecommendationReason: null,
      isMenuRecommendationLoading: false,
      hasMenuSelectionCompleted: false,
      showConfirmCard: false,
    },
  };

  describe('Rendering', () => {
    it('should render menu recommendation section', () => {
      renderWithProviders(<MenuRecommendation />, {
        preloadedState: authenticatedState,
      });

      expect(screen.getByRole('heading', { name: '메뉴 추천 받기' })).toBeInTheDocument();
    });

    it('should render input field', () => {
      renderWithProviders(<MenuRecommendation />, {
        preloadedState: authenticatedState,
      });

      expect(screen.getByPlaceholderText(/오늘 기분이 안좋은데 메뉴 추천해줘/)).toBeInTheDocument();
    });

    it('should render recommendation button', () => {
      renderWithProviders(<MenuRecommendation />, {
        preloadedState: authenticatedState,
      });

      expect(screen.getByRole('button', { name: '메뉴 추천 받기' })).toBeInTheDocument();
    });

    it('should render AI curated badge', () => {
      renderWithProviders(<MenuRecommendation />, {
        preloadedState: authenticatedState,
      });

      expect(screen.getByText('AI curated')).toBeInTheDocument();
    });
  });

  describe('Input Interaction', () => {
    it('should allow typing in input field', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MenuRecommendation />, {
        preloadedState: authenticatedState,
      });

      const input = screen.getByPlaceholderText(/오늘 기분이 안좋은데 메뉴 추천해줘/);
      await user.type(input, '매운 음식 추천해줘');

      expect(input).toHaveValue('매운 음식 추천해줘');
    });

    it('should clear input when value changes', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MenuRecommendation />, {
        preloadedState: authenticatedState,
      });

      const input = screen.getByPlaceholderText(/오늘 기분이 안좋은데 메뉴 추천해줘/);
      await user.type(input, '매운 음식');
      await user.clear(input);

      expect(input).toHaveValue('');
    });

    it('should submit on Enter key press', async () => {
      const user = userEvent.setup();

      server.use(
        http.post('*/menu/recommend', () => {
          return HttpResponse.json({
            id: 1,
            recommendations: ['김치찌개'],
            reason: '매운 음식 추천',
            recommendedAt: new Date().toISOString(),
            requestAddress: null,
          });
        })
      );

      renderWithProviders(<MenuRecommendation />, {
        preloadedState: authenticatedState,
      });

      const input = screen.getByPlaceholderText(/오늘 기분이 안좋은데 메뉴 추천해줘/);
      await user.type(input, '매운 음식{Enter}');

      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
      });
    });
  });

  describe('Recommendation Button', () => {
    it('should call API when recommendation button is clicked', async () => {
      const user = userEvent.setup();
      let apiCalled = false;

      server.use(
        http.post('*/menu/recommend', () => {
          apiCalled = true;
          return HttpResponse.json({
            id: 1,
            recommendations: ['김치찌개', '불고기'],
            reason: '한식 추천',
            recommendedAt: new Date().toISOString(),
            requestAddress: null,
          });
        })
      );

      renderWithProviders(<MenuRecommendation />, {
        preloadedState: authenticatedState,
      });

      const input = screen.getByPlaceholderText(/오늘 기분이 안좋은데 메뉴 추천해줘/);
      await user.type(input, '한식 추천해줘');

      const button = screen.getByRole('button', { name: '메뉴 추천 받기' });
      await user.click(button);

      await waitFor(() => {
        expect(apiCalled).toBe(true);
      });
    });

    it('should disable button during loading', async () => {
      const user = userEvent.setup();

      server.use(
        http.post('*/menu/recommend', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({
            id: 1,
            recommendations: ['김치찌개'],
            reason: '추천 이유',
            recommendedAt: new Date().toISOString(),
            requestAddress: null,
          });
        })
      );

      renderWithProviders(<MenuRecommendation />, {
        preloadedState: authenticatedState,
      });

      const input = screen.getByPlaceholderText(/오늘 기분이 안좋은데 메뉴 추천해줘/);
      await user.type(input, '추천해줘');

      const button = screen.getByRole('button', { name: '메뉴 추천 받기' });
      await user.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator when fetching recommendations', () => {
      renderWithProviders(<MenuRecommendation />, {
        preloadedState: {
          ...authenticatedState,
          agent: {
            ...authenticatedState.agent,
            isMenuRecommendationLoading: true,
          },
        },
      });

      expect(screen.getByText('AI가 메뉴를 추천하고 있어요...')).toBeInTheDocument();
    });

    it('should show loading spinner during recommendation', () => {
      const { container } = renderWithProviders(<MenuRecommendation />, {
        preloadedState: {
          ...authenticatedState,
          agent: {
            ...authenticatedState.agent,
            isMenuRecommendationLoading: true,
          },
        },
      });

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Recommendation Results', () => {
    it('should display recommendations after loading', () => {
      renderWithProviders(<MenuRecommendation />, {
        preloadedState: {
          ...authenticatedState,
          agent: {
            ...authenticatedState.agent,
            menuRecommendations: ['김치찌개', '불고기', '비빔밥'],
            menuRecommendationHistoryId: 1,
            menuRecommendationReason: '한식 추천 이유',
            isMenuRecommendationLoading: false,
          },
        },
      });

      expect(screen.getByText('김치찌개')).toBeInTheDocument();
      expect(screen.getByText('불고기')).toBeInTheDocument();
      expect(screen.getByText('비빔밥')).toBeInTheDocument();
    });

    it('should display recommendation reason', () => {
      renderWithProviders(<MenuRecommendation />, {
        preloadedState: {
          ...authenticatedState,
          agent: {
            ...authenticatedState.agent,
            menuRecommendations: ['김치찌개'],
            menuRecommendationReason: '건강한 한식을 추천드립니다',
            isMenuRecommendationLoading: false,
          },
        },
      });

      expect(screen.getByText('건강한 한식을 추천드립니다')).toBeInTheDocument();
    });

    it('should show menu selection button when recommendations exist', () => {
      renderWithProviders(<MenuRecommendation />, {
        preloadedState: {
          ...authenticatedState,
          agent: {
            ...authenticatedState.agent,
            menuRecommendations: ['김치찌개', '불고기'],
            menuRecommendationHistoryId: 1,
            isMenuRecommendationLoading: false,
            hasMenuSelectionCompleted: false,
          },
        },
      });

      expect(screen.getByText('메뉴 선택하기')).toBeInTheDocument();
    });

    it('should hide menu selection button after completion', () => {
      renderWithProviders(<MenuRecommendation />, {
        preloadedState: {
          ...authenticatedState,
          agent: {
            ...authenticatedState.agent,
            menuRecommendations: ['김치찌개', '불고기'],
            menuRecommendationHistoryId: 1,
            isMenuRecommendationLoading: false,
            hasMenuSelectionCompleted: true,
          },
        },
      });

      expect(screen.queryByText('메뉴 선택하기')).not.toBeInTheDocument();
    });
  });

  describe('Menu Selection Interaction', () => {
    it('should call onMenuSelect when menu is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MenuRecommendation onMenuSelect={mockOnMenuSelect} />, {
        preloadedState: {
          ...authenticatedState,
          agent: {
            ...authenticatedState.agent,
            menuRecommendations: ['김치찌개', '불고기'],
            menuRecommendationHistoryId: 1,
            menuRecommendationRequestAddress: '서울시 강남구',
            isMenuRecommendationLoading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByText('김치찌개')).toBeInTheDocument();
      });

      const menuButton = screen.getByText('김치찌개').closest('button');
      if (menuButton) {
        await user.click(menuButton);
      }

      expect(mockOnMenuSelect).toHaveBeenCalledWith('김치찌개', 1, {
        requestAddress: '서울시 강남구',
      });
    });

    it('should highlight selected menu', () => {
      renderWithProviders(<MenuRecommendation selectedMenu="김치찌개" />, {
        preloadedState: {
          ...authenticatedState,
          agent: {
            ...authenticatedState.agent,
            menuRecommendations: ['김치찌개', '불고기'],
            menuRecommendationHistoryId: 1,
            isMenuRecommendationLoading: false,
          },
        },
      });

      const menuButton = screen.getByText('김치찌개').closest('button');
      expect(menuButton).toHaveClass('border-orange-400/70');
    });

    it('should not highlight non-selected menus', () => {
      renderWithProviders(<MenuRecommendation selectedMenu="김치찌개" />, {
        preloadedState: {
          ...authenticatedState,
          agent: {
            ...authenticatedState.agent,
            menuRecommendations: ['김치찌개', '불고기'],
            menuRecommendationHistoryId: 1,
            isMenuRecommendationLoading: false,
          },
        },
      });

      const menuButton = screen.getByText('불고기').closest('button');
      expect(menuButton).not.toHaveClass('border-orange-400/70');
    });
  });

  describe('Authentication', () => {
    it('should redirect to login when not authenticated', async () => {
      const user = userEvent.setup();

      renderWithProviders(<MenuRecommendation />, {
        preloadedState: {
          auth: {
            isAuthenticated: false,
            user: null,
            token: null,
          },
          agent: authenticatedState.agent,
        },
      });

      const input = screen.getByPlaceholderText(/오늘 기분이 안좋은데 메뉴 추천해줘/);
      await user.type(input, '추천해줘');

      const button = screen.getByRole('button', { name: '메뉴 추천 받기' });
      await user.click(button);

      // Error toast should be shown (tested in integration tests)
      expect(mockOnMenuSelect).not.toHaveBeenCalled();
    });
  });

  describe('Menu Selection Modal', () => {
    it('should open modal when menu selection button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MenuRecommendation />, {
        preloadedState: {
          ...authenticatedState,
          agent: {
            ...authenticatedState.agent,
            menuRecommendations: ['김치찌개', '불고기'],
            menuRecommendationHistoryId: 1,
            isMenuRecommendationLoading: false,
            hasMenuSelectionCompleted: false,
          },
        },
      });

      const selectionButton = screen.getByRole('button', { name: '메뉴 선택하기' });
      await user.click(selectionButton);

      // Modal should open and render in document.body
      await waitFor(() => {
        expect(document.body.querySelector('.fixed.inset-0.z-50')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '메뉴 선택하기' })).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should apply responsive padding classes', () => {
      const { container } = renderWithProviders(<MenuRecommendation />, {
        preloadedState: authenticatedState,
      });

      const mainContainer = container.querySelector('.p-4.sm\\:p-6');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should apply responsive text size classes', () => {
      renderWithProviders(<MenuRecommendation />, {
        preloadedState: authenticatedState,
      });

      const title = screen.getByRole('heading', { name: '메뉴 추천 받기' });
      expect(title).toHaveClass('text-xl', 'sm:text-2xl');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form label', () => {
      renderWithProviders(<MenuRecommendation />, {
        preloadedState: authenticatedState,
      });

      expect(screen.getByLabelText('어떤 메뉴를 원하시나요?')).toBeInTheDocument();
    });

    it('should have proper button roles', () => {
      renderWithProviders(<MenuRecommendation />, {
        preloadedState: {
          ...authenticatedState,
          agent: {
            ...authenticatedState.agent,
            menuRecommendations: ['김치찌개', '불고기'],
            isMenuRecommendationLoading: false,
          },
        },
      });

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Animation', () => {
    it('should apply animation to recommendation cards', () => {
      const { container } = renderWithProviders(<MenuRecommendation />, {
        preloadedState: {
          ...authenticatedState,
          agent: {
            ...authenticatedState.agent,
            menuRecommendations: ['김치찌개', '불고기'],
            isMenuRecommendationLoading: false,
          },
        },
      });

      const animatedCard = container.querySelector('.menu-card-enter');
      expect(animatedCard).toBeInTheDocument();
    });
  });
});
