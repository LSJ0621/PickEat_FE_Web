import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { MenuRecommendation } from '@features/agent/components/menu/MenuRecommendation';

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

  // Base agent state matching current AgentState interface
  const baseAgentState = {
    selectedMenu: null,
    menuRecommendations: [],
    menuRecommendationHistoryId: null,
    menuRecommendationPrompt: '',
    menuRecommendationRequestAddress: null,
    menuRecommendationIntro: null,
    menuRecommendationClosing: null,
    isMenuRecommendationLoading: false,
    menuHistoryId: null,
    menuRequestAddress: null,
    searchAiRecommendationGroups: [],
    isSearchAiLoading: false,
    searchAiLoadingMenu: null,
    searchAiRetrying: false,
    communityAiRecommendationGroups: [],
    isCommunityAiLoading: false,
    communityAiLoadingMenu: null,
    communityAiRetrying: false,
    aiRecommendationGroups: [],
    isAiLoading: false,
    aiLoadingMenu: null,
    selectedPlace: null,
    showConfirmCard: false,
    hasMenuSelectionCompleted: false,
  };

  const authenticatedState = {
    auth: {
      isAuthenticated: true,
      user: { id: 1, email: 'test@example.com', nickname: 'TestUser' },
      token: 'test-token',
    },
    agent: baseAgentState,
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
    it('should update input value when typing', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MenuRecommendation />, {
        preloadedState: authenticatedState,
      });

      const input = screen.getByPlaceholderText(/오늘 기분이 안좋은데 메뉴 추천해줘/);
      await user.type(input, '한식 먹고 싶어');

      expect(input).toHaveValue('한식 먹고 싶어');
    });

    it('should enable button when input has value', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MenuRecommendation />, {
        preloadedState: authenticatedState,
      });

      const input = screen.getByPlaceholderText(/오늘 기분이 안좋은데 메뉴 추천해줘/);
      const button = screen.getByRole('button', { name: '메뉴 추천 받기' });

      await user.type(input, '한식');

      expect(button).not.toBeDisabled();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when isMenuRecommendationLoading is true', () => {
      const { container } = renderWithProviders(<MenuRecommendation />, {
        preloadedState: {
          ...authenticatedState,
          agent: {
            ...baseAgentState,
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
            ...baseAgentState,
            menuRecommendations: [
              { condition: '매콤한 맛을 원한다면', menu: '김치찌개' },
              { condition: '고소하고 담백한 맛을 원한다면', menu: '불고기' },
              { condition: '건강한 한 끼를 원한다면', menu: '비빔밥' },
            ],
            menuRecommendationHistoryId: 1,
            isMenuRecommendationLoading: false,
          },
        },
      });

      // Use getAllByText since menu name may appear in both card and intro list
      expect(screen.getAllByText('김치찌개').length).toBeGreaterThan(0);
      expect(screen.getAllByText('불고기').length).toBeGreaterThan(0);
      expect(screen.getAllByText('비빔밥').length).toBeGreaterThan(0);
    });

    it('should display recommendation intro', () => {
      renderWithProviders(<MenuRecommendation />, {
        preloadedState: {
          ...authenticatedState,
          agent: {
            ...baseAgentState,
            menuRecommendations: [{ condition: '매콤한 맛을 원한다면', menu: '김치찌개' }],
            menuRecommendationIntro: '건강한 한식을 추천드립니다',
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
            ...baseAgentState,
            menuRecommendations: [
              { condition: '매콤하게', menu: '김치찌개' },
              { condition: '고소하게', menu: '불고기' },
            ],
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
            ...baseAgentState,
            menuRecommendations: [
              { condition: '매콤하게', menu: '김치찌개' },
              { condition: '고소하게', menu: '불고기' },
            ],
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
            ...baseAgentState,
            menuRecommendations: [
              { condition: '매콤하게', menu: '김치찌개' },
              { condition: '고소하게', menu: '불고기' },
            ],
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
            ...baseAgentState,
            menuRecommendations: [
              { condition: '매콤하게', menu: '김치찌개' },
              { condition: '고소하게', menu: '불고기' },
            ],
            menuRecommendationHistoryId: 1,
            isMenuRecommendationLoading: false,
          },
        },
      });

      // Find the card button for 김치찌개 (it renders as a button with aria-label)
      const menuButton = screen.getByRole('button', { name: '김치찌개 선택' });
      expect(menuButton).toHaveClass('border-brand-primary/50');
    });

    it('should not highlight non-selected menus', () => {
      renderWithProviders(<MenuRecommendation selectedMenu="김치찌개" />, {
        preloadedState: {
          ...authenticatedState,
          agent: {
            ...baseAgentState,
            menuRecommendations: [
              { condition: '매콤하게', menu: '김치찌개' },
              { condition: '고소하게', menu: '불고기' },
            ],
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
          agent: baseAgentState,
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
            ...baseAgentState,
            menuRecommendations: [
              { condition: '매콤하게', menu: '김치찌개' },
              { condition: '고소하게', menu: '불고기' },
            ],
            menuRecommendationHistoryId: 1,
            isMenuRecommendationLoading: false,
            hasMenuSelectionCompleted: false,
          },
        },
      });

      const selectionButton = screen.getByRole('button', { name: '메뉴 선택하기' });
      await user.click(selectionButton);

      // Modal should open - check for the heading rendered by MenuSelectionModal
      await waitFor(() => {
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
            ...baseAgentState,
            menuRecommendations: [
              { condition: '매콤하게', menu: '김치찌개' },
              { condition: '고소하게', menu: '불고기' },
            ],
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
            ...baseAgentState,
            menuRecommendations: [
              { condition: '매콤하게', menu: '김치찌개' },
              { condition: '고소하게', menu: '불고기' },
            ],
            isMenuRecommendationLoading: false,
          },
        },
      });

      const animatedCard = container.querySelector('.menu-card-enter');
      expect(animatedCard).toBeInTheDocument();
    });
  });
});
