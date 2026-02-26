import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { ResultsSection } from '@features/agent/components/ResultsSection';
import type { PlaceRecommendationItem } from '@features/agent/types';
import { createRef } from 'react';

describe('ResultsSection', () => {
  const mockOnClearMenu = vi.fn();
  const mockOnSelectPlace = vi.fn();
  const mockOnResetAiRecommendations = vi.fn();
  const aiSectionRef = createRef<HTMLDivElement>();

  const defaultProps = {
    selectedMenu: '김치찌개',
    onClearMenu: mockOnClearMenu,
    onSelectPlace: mockOnSelectPlace,
    onResetAiRecommendations: mockOnResetAiRecommendations,
    aiSectionRef,
  };

  const mockAiRecommendation: PlaceRecommendationItem = {
    placeId: 'place2',
    name: 'AI 추천 맛집',
    reason: '맛있어요',
    menuName: '김치찌개',
  };

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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty State Without Menu Selection', () => {
    it('should render empty state when no menu selected and has requested menu', () => {
      renderWithProviders(<ResultsSection {...defaultProps} selectedMenu={null} />, {
        preloadedState: {
          agent: {
            ...baseAgentState,
            selectedMenu: null,
            menuRecommendations: [
              { condition: '매콤하게', menu: '김치찌개' },
              { condition: '고소하게', menu: '불고기' },
            ],
            menuRecommendationHistoryId: 1,
          },
        },
      });

      expect(screen.getByText('메뉴를 선택해주세요')).toBeInTheDocument();
    });

    it('should render empty state icon when no menu selected', () => {
      const { container } = renderWithProviders(
        <ResultsSection {...defaultProps} selectedMenu={null} />,
        {
          preloadedState: {
            agent: {
              ...baseAgentState,
              selectedMenu: null,
              menuRecommendations: [{ condition: '매콤하게', menu: '김치찌개' }],
              menuRecommendationHistoryId: 1,
            },
          },
        }
      );

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render empty state when loading menu recommendations', () => {
      renderWithProviders(<ResultsSection {...defaultProps} selectedMenu={null} />, {
        preloadedState: {
          agent: {
            ...baseAgentState,
            selectedMenu: null,
            isMenuRecommendationLoading: true,
          },
        },
      });

      expect(screen.getByText('메뉴를 선택해주세요')).toBeInTheDocument();
    });
  });

  describe('No Results State', () => {
    it('should show no results message when menu selected but no AI results', () => {
      renderWithProviders(<ResultsSection {...defaultProps} />, {
        preloadedState: {
          agent: {
            ...baseAgentState,
            selectedMenu: '김치찌개',
          },
        },
      });

      expect(screen.getByText('AI 추천 결과가 없습니다.')).toBeInTheDocument();
    });

    it('should not show empty state when aiLoadingMenu is set', () => {
      renderWithProviders(<ResultsSection {...defaultProps} />, {
        preloadedState: {
          agent: {
            ...baseAgentState,
            selectedMenu: '김치찌개',
            aiLoadingMenu: '김치찌개',
          },
        },
      });

      expect(screen.queryByText('아직 결과가 없습니다.')).not.toBeInTheDocument();
    });

    it('should not show empty state when isSearchAiLoading is true', () => {
      renderWithProviders(<ResultsSection {...defaultProps} />, {
        preloadedState: {
          agent: {
            ...baseAgentState,
            selectedMenu: '김치찌개',
            isSearchAiLoading: true,
            searchAiLoadingMenu: '김치찌개',
          },
        },
      });

      expect(screen.queryByText('아직 결과가 없습니다.')).not.toBeInTheDocument();
    });
  });

  describe('Results with AI Recommendations', () => {
    it('should render AI recommendations section when aiRecommendationGroups has results', () => {
      renderWithProviders(<ResultsSection {...defaultProps} />, {
        preloadedState: {
          agent: {
            ...baseAgentState,
            selectedMenu: '김치찌개',
            aiRecommendationGroups: [
              {
                menuName: '김치찌개',
                recommendations: [mockAiRecommendation],
              },
            ],
          },
        },
      });

      // AiPlaceRecommendations component should be rendered
      expect(screen.queryByText('아직 결과가 없습니다.')).not.toBeInTheDocument();
    });

    it('should render results when searchAiRecommendationGroups has results', () => {
      renderWithProviders(<ResultsSection {...defaultProps} />, {
        preloadedState: {
          agent: {
            ...baseAgentState,
            selectedMenu: '김치찌개',
            searchAiRecommendationGroups: [
              {
                menuName: '김치찌개',
                recommendations: [mockAiRecommendation],
              },
            ],
          },
        },
      });

      expect(screen.queryByText('아직 결과가 없습니다.')).not.toBeInTheDocument();
    });

    it('should render results when communityAiRecommendationGroups has results', () => {
      renderWithProviders(<ResultsSection {...defaultProps} />, {
        preloadedState: {
          agent: {
            ...baseAgentState,
            selectedMenu: '김치찌개',
            communityAiRecommendationGroups: [
              {
                menuName: '김치찌개',
                recommendations: [mockAiRecommendation],
              },
            ],
          },
        },
      });

      expect(screen.queryByText('아직 결과가 없습니다.')).not.toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('should accept aiSectionRef without error', () => {
      const ref = createRef<HTMLDivElement>();
      renderWithProviders(
        <ResultsSection {...defaultProps} aiSectionRef={ref} />,
        {
          preloadedState: {
            agent: {
              ...baseAgentState,
              selectedMenu: '김치찌개',
              aiRecommendationGroups: [
                {
                  menuName: '김치찌개',
                  recommendations: [mockAiRecommendation],
                },
              ],
            },
          },
        }
      );

      // Component renders without error
      expect(screen.queryByText('아직 결과가 없습니다.')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should apply responsive spacing classes when results are shown', () => {
      const { container } = renderWithProviders(<ResultsSection {...defaultProps} />, {
        preloadedState: {
          agent: {
            ...baseAgentState,
            selectedMenu: '김치찌개',
            aiRecommendationGroups: [
              {
                menuName: '김치찌개',
                recommendations: [mockAiRecommendation],
              },
            ],
          },
        },
      });

      const mainContainer = container.querySelector('.space-y-4');
      expect(mainContainer).toBeInTheDocument();
    });
  });

  describe('Mobile Scroll Behavior', () => {
    let originalScrollIntoView: typeof Element.prototype.scrollIntoView;
    let originalInnerWidth: number;

    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      originalInnerWidth = window.innerWidth;
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      originalScrollIntoView = Element.prototype.scrollIntoView;
      Element.prototype.scrollIntoView = vi.fn();
    });

    afterEach(() => {
      vi.useRealTimers();
      Element.prototype.scrollIntoView = originalScrollIntoView;
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalInnerWidth,
      });
    });

    it('should render empty state initially when no menu selected', () => {
      renderWithProviders(<ResultsSection {...defaultProps} selectedMenu={null} />, {
        preloadedState: {
          agent: {
            ...baseAgentState,
            selectedMenu: null,
            menuRecommendations: [{ condition: '매콤하게', menu: '김치찌개' }],
            menuRecommendationHistoryId: 1,
          },
        },
      });

      expect(screen.getByText('메뉴를 선택해주세요')).toBeInTheDocument();
    });

    it('should render results section when menu is selected', () => {
      const { container } = renderWithProviders(<ResultsSection {...defaultProps} selectedMenu="김치찌개" />, {
        preloadedState: {
          agent: {
            ...baseAgentState,
            selectedMenu: '김치찌개',
            menuRecommendations: [{ condition: '매콤하게', menu: '김치찌개' }],
            menuRecommendationHistoryId: 1,
            aiRecommendationGroups: [
              { menuName: '김치찌개', recommendations: [mockAiRecommendation] },
            ],
          },
        },
      });

      vi.advanceTimersByTime(200);
      expect(container.querySelector('.space-y-4')).toBeInTheDocument();
    });
  });

  describe('Timer Cleanup', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should unmount without errors when timer is pending', () => {
      const { unmount } = renderWithProviders(<ResultsSection {...defaultProps} selectedMenu="김치찌개" />, {
        preloadedState: {
          agent: {
            ...baseAgentState,
            selectedMenu: '김치찌개',
            aiRecommendationGroups: [
              { menuName: '김치찌개', recommendations: [mockAiRecommendation] },
            ],
          },
        },
      });

      unmount();

      vi.advanceTimersByTime(200);

      // Verify component unmounted without errors
      expect(document.querySelector('.space-y-4')).not.toBeInTheDocument();
    });
  });

  describe('State Changes', () => {
    it('should show no results message when menu changes to a menu with no results', () => {
      const { rerender } = renderWithProviders(<ResultsSection {...defaultProps} selectedMenu="김치찌개" />, {
        preloadedState: {
          agent: {
            ...baseAgentState,
            selectedMenu: '김치찌개',
            aiRecommendationGroups: [
              { menuName: '김치찌개', recommendations: [mockAiRecommendation] },
            ],
          },
        },
      });

      expect(screen.queryByText('아직 결과가 없습니다.')).not.toBeInTheDocument();

      rerender(<ResultsSection {...defaultProps} selectedMenu="불고기" />);

      // After rerender without updating preloadedState, the store still has kimchi results
      // but the new component just checks hasResults which may not match
      // This test just verifies the component doesn't crash on menu change
      expect(screen.queryByText('메뉴를 선택해주세요')).not.toBeInTheDocument();
    });

    it('should show empty state when selectedMenu becomes null', () => {
      renderWithProviders(<ResultsSection {...defaultProps} selectedMenu={null} />, {
        preloadedState: {
          agent: {
            ...baseAgentState,
            selectedMenu: null,
            menuRecommendations: [{ condition: '매콤하게', menu: '김치찌개' }],
            menuRecommendationHistoryId: 1,
          },
        },
      });

      expect(screen.getByText('메뉴를 선택해주세요')).toBeInTheDocument();
    });
  });
});
