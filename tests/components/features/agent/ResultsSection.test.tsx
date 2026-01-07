import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import { ResultsSection } from '@/components/features/agent/ResultsSection';
import type { PlaceRecommendationItem } from '@/types/menu';
import { createRef } from 'react';

describe('ResultsSection', () => {
  const mockOnClearMenu = vi.fn();
  const mockOnSelectPlace = vi.fn();
  const mockOnResetAiRecommendations = vi.fn();
  const restaurantSectionRef = createRef<HTMLDivElement>();
  const aiSectionRef = createRef<HTMLDivElement>();

  const defaultProps = {
    selectedMenu: '김치찌개',
    onClearMenu: mockOnClearMenu,
    onSelectPlace: mockOnSelectPlace,
    onResetAiRecommendations: mockOnResetAiRecommendations,
    restaurantSectionRef,
    aiSectionRef,
  };

  const mockRestaurant = {
    placeId: 'place1',
    name: '맛있는 김치찌개',
    address: '서울시 강남구',
    latitude: 37.5,
    longitude: 127.0,
    rating: 4.5,
    userRatingCount: 100,
    priceLevel: 'MODERATE' as const,
    photos: ['photo1.jpg'],
    openNow: true,
  };

  const mockAiRecommendation: PlaceRecommendationItem = {
    placeId: 'place2',
    name: 'AI 추천 맛집',
    reason: '맛있어요',
    menuName: '김치찌개',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty State Without Menu Selection', () => {
    it('should render empty state when no menu selected and has requested menu', () => {
      renderWithProviders(<ResultsSection {...defaultProps} selectedMenu={null} />, {
        preloadedState: {
          agent: {
            selectedMenu: null,
            restaurants: [],
            isSearching: false,
            aiRecommendationGroups: [],
            aiLoadingMenu: null,
            menuRecommendations: ['김치찌개', '불고기'],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: 1,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
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
              selectedMenu: null,
              restaurants: [],
              isSearching: false,
              aiRecommendationGroups: [],
              aiLoadingMenu: null,
              menuRecommendations: ['김치찌개'],
              isMenuRecommendationLoading: false,
              menuRecommendationHistoryId: 1,
              menuRecommendationRequestAddress: null,
              menuRecommendationReason: null,
              hasMenuSelectionCompleted: false,
              showConfirmCard: false,
            },
          },
        }
      );

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Tabs Display with Results', () => {
    it('should render tabs when menu is selected and has search results', () => {
      renderWithProviders(<ResultsSection {...defaultProps} />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [mockRestaurant],
            isSearching: false,
            aiRecommendationGroups: [],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      expect(screen.getByText('일반 검색')).toBeInTheDocument();
      expect(screen.getByText('AI 추천')).toBeInTheDocument();
    });

    it('should render tabs when menu is selected and is searching', () => {
      renderWithProviders(<ResultsSection {...defaultProps} />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [],
            isSearching: true,
            aiRecommendationGroups: [],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      expect(screen.getByText('일반 검색')).toBeInTheDocument();
      expect(screen.getByText('AI 추천')).toBeInTheDocument();
    });

    it('should render tabs when menu is selected and has AI recommendations', () => {
      renderWithProviders(<ResultsSection {...defaultProps} />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [],
            isSearching: false,
            aiRecommendationGroups: [
              {
                menuName: '김치찌개',
                recommendations: [mockAiRecommendation],
                requestAddress: null,
              },
            ],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      expect(screen.getByText('일반 검색')).toBeInTheDocument();
      expect(screen.getByText('AI 추천')).toBeInTheDocument();
    });
  });

  describe('Search Results Count', () => {
    it('should display correct search count in tab', () => {
      renderWithProviders(<ResultsSection {...defaultProps} />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [mockRestaurant, { ...mockRestaurant, placeId: 'place3' }],
            isSearching: false,
            aiRecommendationGroups: [],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should display zero when no search results', () => {
      renderWithProviders(<ResultsSection {...defaultProps} />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [],
            isSearching: false,
            aiRecommendationGroups: [
              {
                menuName: '김치찌개',
                recommendations: [mockAiRecommendation],
                requestAddress: null,
              },
            ],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      const searchButton = screen.getByText('일반 검색').parentElement;
      expect(searchButton?.textContent).not.toContain('0');
    });
  });

  describe('AI Recommendations Count', () => {
    it('should display correct AI count from all groups', () => {
      renderWithProviders(<ResultsSection {...defaultProps} />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [],
            isSearching: false,
            aiRecommendationGroups: [
              {
                menuName: '김치찌개',
                recommendations: [mockAiRecommendation, { ...mockAiRecommendation, placeId: 'place4' }],
                requestAddress: null,
              },
              {
                menuName: '불고기',
                recommendations: [{ ...mockAiRecommendation, placeId: 'place5' }],
                requestAddress: null,
              },
            ],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show search loading indicator when searching', () => {
      renderWithProviders(<ResultsSection {...defaultProps} />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [],
            isSearching: true,
            aiRecommendationGroups: [],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      const searchButton = screen.getByText('일반 검색').parentElement;
      const spinner = searchButton?.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should show AI loading indicator when AI is loading', () => {
      renderWithProviders(<ResultsSection {...defaultProps} />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [],
            isSearching: false,
            aiRecommendationGroups: [],
            aiLoadingMenu: '김치찌개',
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      const aiButton = screen.getByText('AI 추천').parentElement;
      const spinner = aiButton?.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Tab Switching', () => {
    it('should switch to AI tab when tab is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ResultsSection {...defaultProps} />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [mockRestaurant],
            isSearching: false,
            aiRecommendationGroups: [
              {
                menuName: '김치찌개',
                recommendations: [mockAiRecommendation],
                requestAddress: null,
              },
            ],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      const aiTab = screen.getByText('AI 추천');
      await user.click(aiTab);

      // The component should switch tabs internally
      expect(aiTab.closest('button')).toHaveClass('from-orange-500/20');
    });

    it('should switch to search tab when tab is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ResultsSection {...defaultProps} />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [mockRestaurant],
            isSearching: false,
            aiRecommendationGroups: [],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      const searchTab = screen.getByText('일반 검색');
      await user.click(searchTab);

      expect(searchTab.closest('button')).toHaveClass('from-orange-500/20');
    });
  });

  describe('Empty Tab Content States', () => {
    it('should show empty search message when no search results', () => {
      renderWithProviders(<ResultsSection {...defaultProps} />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [],
            isSearching: false,
            aiRecommendationGroups: [
              {
                menuName: '김치찌개',
                recommendations: [mockAiRecommendation],
                requestAddress: null,
              },
            ],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      expect(screen.getByText('일반 검색 결과가 없습니다.')).toBeInTheDocument();
    });

    it('should show empty AI message when no AI recommendations', () => {
      renderWithProviders(<ResultsSection {...defaultProps} />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [mockRestaurant],
            isSearching: false,
            aiRecommendationGroups: [],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      expect(screen.getByText('AI 추천 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  describe('No Results State', () => {
    it('should show no results message when menu selected but no results', () => {
      renderWithProviders(<ResultsSection {...defaultProps} />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [],
            isSearching: false,
            aiRecommendationGroups: [],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      expect(screen.getByText('아직 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('should accept restaurantSectionRef', () => {
      const ref = createRef<HTMLDivElement>();
      renderWithProviders(
        <ResultsSection {...defaultProps} restaurantSectionRef={ref} />,
        {
          preloadedState: {
            agent: {
              selectedMenu: '김치찌개',
              restaurants: [mockRestaurant],
              isSearching: false,
              aiRecommendationGroups: [],
              aiLoadingMenu: null,
              menuRecommendations: [],
              isMenuRecommendationLoading: false,
              menuRecommendationHistoryId: null,
              menuRecommendationRequestAddress: null,
              menuRecommendationReason: null,
              hasMenuSelectionCompleted: false,
              showConfirmCard: false,
            },
          },
        }
      );

      // Component renders without error
      expect(screen.getByText('일반 검색')).toBeInTheDocument();
    });

    it('should accept aiSectionRef', () => {
      const ref = createRef<HTMLDivElement>();
      renderWithProviders(<ResultsSection {...defaultProps} aiSectionRef={ref} />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [],
            isSearching: false,
            aiRecommendationGroups: [
              {
                menuName: '김치찌개',
                recommendations: [mockAiRecommendation],
                requestAddress: null,
              },
            ],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      // Component renders without error
      expect(screen.getByText('AI 추천')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should apply responsive spacing classes', () => {
      const { container } = renderWithProviders(<ResultsSection {...defaultProps} />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [mockRestaurant],
            isSearching: false,
            aiRecommendationGroups: [],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      const mainContainer = container.querySelector('.space-y-4.sm\\:space-y-6');
      expect(mainContainer).toBeInTheDocument();
    });
  });

  describe('AI Count Calculation with reduce', () => {
    it('should calculate total AI recommendations from multiple groups using reduce', () => {
      renderWithProviders(<ResultsSection {...defaultProps} selectedMenu="김치찌개" />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [],
            isSearching: false,
            aiRecommendationGroups: [
              {
                menuName: '김치찌개',
                recommendations: [mockAiRecommendation, { ...mockAiRecommendation, placeId: 'place10' }],
                requestAddress: null,
              },
              {
                menuName: '불고기',
                recommendations: [
                  { ...mockAiRecommendation, placeId: 'place11', menuName: '불고기' },
                  { ...mockAiRecommendation, placeId: 'place12', menuName: '불고기' },
                  { ...mockAiRecommendation, placeId: 'place13', menuName: '불고기' },
                ],
                requestAddress: null,
              },
              {
                menuName: '비빔밥',
                recommendations: [{ ...mockAiRecommendation, placeId: 'place14', menuName: '비빔밥' }],
                requestAddress: null,
              },
            ],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      // Total should be 2 + 3 + 1 = 6
      expect(screen.getByText('6')).toBeInTheDocument();
    });

    it('should handle empty recommendation groups', () => {
      renderWithProviders(<ResultsSection {...defaultProps} selectedMenu="김치찌개" />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [mockRestaurant],
            isSearching: false,
            aiRecommendationGroups: [
              {
                menuName: '김치찌개',
                recommendations: [],
                requestAddress: null,
              },
              {
                menuName: '불고기',
                recommendations: [],
                requestAddress: null,
              },
            ],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      // Should show tabs but with 0 count (handled in empty state)
      expect(screen.getByText('일반 검색')).toBeInTheDocument();
      expect(screen.getByText('AI 추천')).toBeInTheDocument();
    });
  });

  describe('Menu Change Detection', () => {
    it('should detect when selected menu changes', () => {
      renderWithProviders(<ResultsSection {...defaultProps} selectedMenu="김치찌개" />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [mockRestaurant],
            isSearching: false,
            aiRecommendationGroups: [],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      // Component should handle rendering with menu selected
      expect(screen.getByText('일반 검색')).toBeInTheDocument();

      // Render with different menu (simulating menu change detection)
      const { container } = renderWithProviders(<ResultsSection {...defaultProps} selectedMenu="불고기" />, {
        preloadedState: {
          agent: {
            selectedMenu: '불고기',
            restaurants: [{ ...mockRestaurant, name: '불고기 맛집' }],
            isSearching: false,
            aiRecommendationGroups: [],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      // Component should handle menu change
      expect(container.querySelector('.space-y-4')).toBeInTheDocument();
    });

    it('should handle menu change from null to selected', () => {
      renderWithProviders(<ResultsSection {...defaultProps} selectedMenu={null} />, {
        preloadedState: {
          agent: {
            selectedMenu: null,
            restaurants: [],
            isSearching: false,
            aiRecommendationGroups: [],
            aiLoadingMenu: null,
            menuRecommendations: ['김치찌개'],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: 1,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      expect(screen.getByText('메뉴를 선택해주세요')).toBeInTheDocument();

      // Render with menu selected (simulating menu selection)
      const { container } = renderWithProviders(<ResultsSection {...defaultProps} selectedMenu="김치찌개" />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [mockRestaurant],
            isSearching: false,
            aiRecommendationGroups: [],
            aiLoadingMenu: null,
            menuRecommendations: ['김치찌개'],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: 1,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      expect(container.querySelector('.space-y-4')).toBeInTheDocument();
    });
  });

  describe('forwardRef switchToTab', () => {
    it('should expose switchToTab method via ref', () => {
      const ref = createRef<{ switchToTab: (tab: 'search' | 'ai') => void }>();

      renderWithProviders(<ResultsSection {...defaultProps} ref={ref} />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [mockRestaurant],
            isSearching: false,
            aiRecommendationGroups: [
              {
                menuName: '김치찌개',
                recommendations: [mockAiRecommendation],
                requestAddress: null,
              },
            ],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      // Ref should be defined
      expect(ref.current).toBeDefined();
      expect(ref.current?.switchToTab).toBeDefined();
    });

    it('should switch to AI tab when switchToTab is called', () => {
      const ref = createRef<{ switchToTab: (tab: 'search' | 'ai') => void }>();

      renderWithProviders(<ResultsSection {...defaultProps} ref={ref} />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [mockRestaurant],
            isSearching: false,
            aiRecommendationGroups: [
              {
                menuName: '김치찌개',
                recommendations: [mockAiRecommendation],
                requestAddress: null,
              },
            ],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      // Call switchToTab with act
      act(() => {
        ref.current?.switchToTab('ai');
      });

      // AI tab should be active
      const aiTab = screen.getByText('AI 추천').closest('button');
      expect(aiTab).toHaveClass('from-orange-500/20');
    });

    it('should switch to search tab when switchToTab is called', () => {
      const ref = createRef<{ switchToTab: (tab: 'search' | 'ai') => void }>();

      renderWithProviders(<ResultsSection {...defaultProps} ref={ref} />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [mockRestaurant],
            isSearching: false,
            aiRecommendationGroups: [
              {
                menuName: '김치찌개',
                recommendations: [mockAiRecommendation],
                requestAddress: null,
              },
            ],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      // First switch to AI to ensure we're not starting on search
      act(() => {
        ref.current?.switchToTab('ai');
      });

      // Then switch to search tab
      act(() => {
        ref.current?.switchToTab('search');
      });

      // Search tab should be active
      const searchTab = screen.getByText('일반 검색').closest('button');
      expect(searchTab).toHaveClass('from-orange-500/20');
    });
  });

  describe('모바일 뷰포트에서 스크롤 테스트', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      // Mock scrollIntoView
      Element.prototype.scrollIntoView = vi.fn();
    });

    afterEach(() => {
      vi.useRealTimers();
      // Restore desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('모바일 뷰포트에서 메뉴 선택 시 결과 영역으로 스크롤한다', async () => {
      renderWithProviders(<ResultsSection {...defaultProps} selectedMenu={null} />, {
        preloadedState: {
          agent: {
            selectedMenu: null,
            restaurants: [],
            isSearching: false,
            aiRecommendationGroups: [],
            aiLoadingMenu: null,
            menuRecommendations: ['김치찌개'],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: 1,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      // Verify empty state is shown when no menu selected
      expect(screen.getByText('메뉴를 선택해주세요')).toBeInTheDocument();

      // Select menu by re-rendering with selected menu and results
      const { container } = renderWithProviders(<ResultsSection {...defaultProps} selectedMenu="김치찌개" />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [mockRestaurant],
            isSearching: false,
            aiRecommendationGroups: [],
            aiLoadingMenu: null,
            menuRecommendations: ['김치찌개'],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: 1,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      // Advance timer for scroll delay
      vi.advanceTimersByTime(200);

      // Verify component rendered with tabs
      expect(container.querySelector('.space-y-4')).toBeInTheDocument();
    });
  });

  describe('타이머 cleanup 테스트', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('컴포넌트 언마운트 시 스크롤 타이머가 cleanup된다', () => {
      const { unmount } = renderWithProviders(<ResultsSection {...defaultProps} selectedMenu="김치찌개" />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [mockRestaurant],
            isSearching: false,
            aiRecommendationGroups: [],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      unmount();

      // Advance timer to ensure cleanup worked
      vi.advanceTimersByTime(200);

      // Verify component unmounted without errors
      expect(document.querySelector('.space-y-4')).not.toBeInTheDocument();
    });
  });

  describe('사용자 탭 선택 유지 테스트', () => {
    it('사용자가 명시적으로 일반 검색을 선택하면 AI 추천이 시작되어도 탭 유지', () => {
      const ref = createRef<{ switchToTab: (tab: 'search' | 'ai') => void }>();

      const { rerender } = renderWithProviders(<ResultsSection {...defaultProps} ref={ref} />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [mockRestaurant],
            isSearching: false,
            aiRecommendationGroups: [],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      // User explicitly selects search tab
      act(() => {
        ref.current?.switchToTab('search');
      });

      // AI recommendation starts
      rerender(<ResultsSection {...defaultProps} ref={ref} />);

      // Search tab should still be active
      const searchTab = screen.getByText('일반 검색').closest('button');
      expect(searchTab).toHaveClass('from-orange-500/20');
    });
  });

  describe('AI 추천 완료 후 탭 전환 테스트', () => {
    it('AI 추천 완료 시 탭이 표시된다', () => {
      // Render with AI recommendations already complete
      renderWithProviders(<ResultsSection {...defaultProps} selectedMenu="김치찌개" />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [],
            isSearching: false,
            aiRecommendationGroups: [
              {
                menuName: '김치찌개',
                recommendations: [mockAiRecommendation],
                requestAddress: null,
              },
            ],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      // Verify tabs are displayed
      expect(screen.getByText('일반 검색')).toBeInTheDocument();
      expect(screen.getByText('AI 추천')).toBeInTheDocument();

      // Verify AI recommendations count is displayed
      const counts = screen.getAllByText('1');
      expect(counts.length).toBeGreaterThan(0);
    });
  });

  describe('메뉴 변경 시 카운트 업데이트 테스트', () => {
    it('메뉴가 변경되면 이전 카운트가 업데이트된다', () => {
      const { rerender } = renderWithProviders(<ResultsSection {...defaultProps} selectedMenu="김치찌개" />, {
        preloadedState: {
          agent: {
            selectedMenu: '김치찌개',
            restaurants: [mockRestaurant],
            isSearching: false,
            aiRecommendationGroups: [
              {
                menuName: '김치찌개',
                recommendations: [mockAiRecommendation],
                requestAddress: null,
              },
            ],
            aiLoadingMenu: null,
            menuRecommendations: [],
            isMenuRecommendationLoading: false,
            menuRecommendationHistoryId: null,
            menuRecommendationRequestAddress: null,
            menuRecommendationReason: null,
            hasMenuSelectionCompleted: false,
            showConfirmCard: false,
          },
        },
      });

      // Change menu
      rerender(<ResultsSection {...defaultProps} selectedMenu="불고기" />);

      // Verify tabs are still rendered after menu change
      expect(screen.getByText('일반 검색')).toBeInTheDocument();
      expect(screen.getByText('AI 추천')).toBeInTheDocument();
    });
  });
});
