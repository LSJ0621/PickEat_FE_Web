import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import {
  createAuthenticatedState,
  createUnauthenticatedState,
  createMockRecommendationHistory,
} from '@tests/factories';
import { HistoryItem } from '@features/history/components/HistoryItem';

// Mock the custom hooks
const mockHandleMenuClick = vi.fn();
const mockHandleSearch = vi.fn();
const mockHandleCancel = vi.fn();
const mockResetSearchResults = vi.fn();
const mockHandleAiRecommend = vi.fn();
const mockResetAiRecommendations = vi.fn();
const mockHandleShowAiHistory = vi.fn();

// Dynamic state for mocks
let mockMenuActionsState = {
  selectedMenu: null as string | null,
  showConfirmCard: false,
  restaurants: [] as unknown[],
  loading: false,
};

let mockAiRecommendationsState = {
  aiRecommendations: [] as unknown[],
  isAiLoading: false,
  aiLoadingMenu: null as string | null,
  searchEntryPointHtml: null as string | null,
};

let mockAiHistoryState = {
  showAiHistory: false,
  aiHistoryRecommendations: [] as unknown[],
  isAiHistoryLoading: false,
  groupedAiHistory: [] as unknown[],
};

let mockUserLocationState = {
  latitude: 37.5172 as number | null,
  longitude: 127.0473 as number | null,
  hasLocation: true,
  address: '서울시 강남구 테헤란로 123',
};

vi.mock('@features/history/hooks/useHistoryMenuActions', () => ({
  useHistoryMenuActions: () => ({
    ...mockMenuActionsState,
    handleMenuClick: mockHandleMenuClick,
    handleSearch: mockHandleSearch,
    handleCancel: mockHandleCancel,
    resetSearchResults: mockResetSearchResults,
  }),
}));

vi.mock('@features/history/hooks/useHistoryAiRecommendations', () => ({
  useHistoryAiRecommendations: () => ({
    ...mockAiRecommendationsState,
    handleAiRecommend: mockHandleAiRecommend,
    loadStoredAiRecommendations: vi.fn(),
    resetAiRecommendations: mockResetAiRecommendations,
  }),
}));

vi.mock('@features/history/hooks/useHistoryAiHistory', () => ({
  useHistoryAiHistory: () => ({
    ...mockAiHistoryState,
    handleShowAiHistory: mockHandleShowAiHistory,
  }),
}));

vi.mock('@features/map/hooks/useUserLocation', () => ({
  useUserLocation: () => mockUserLocationState,
}));

// Mock restaurant components
vi.mock('@features/agent/components/restaurant/RestaurantList', () => ({
  RestaurantList: ({ menuName, restaurants, onClose }: { menuName: string; restaurants: unknown[]; onClose: () => void }) => (
    <div data-testid="restaurant-list">
      <div>RestaurantList for {menuName}</div>
      <div>Restaurants count: {restaurants.length}</div>
      <button onClick={onClose}>Close Restaurant List</button>
    </div>
  ),
}));

vi.mock('@features/agent/components/restaurant/AiPlaceRecommendations', () => ({
  AiPlaceRecommendations: ({ activeMenuName, recommendations, onReset }: { activeMenuName: string; recommendations: unknown[]; onReset: () => void }) => (
    <div data-testid="ai-place-recommendations">
      <div>AI Recommendations for {activeMenuName}</div>
      <div>Recommendations count: {recommendations.length}</div>
      <button onClick={onReset}>Reset AI Recommendations</button>
    </div>
  ),
}));

vi.mock('@features/agent/components/restaurant/PlaceDetailsModal', () => ({
  PlaceDetailsModal: ({ placeId, placeName, onClose }: { placeId: string | null; placeName: string | null; onClose: () => void }) => (
    placeId ? (
      <div data-testid="place-details-modal">
        <div>Place Details for {placeName}</div>
        <button onClick={onClose}>Close Details</button>
      </div>
    ) : null
  ),
}));

const DEFAULT_MENU_RECOMMENDATIONS = [
  { menu: '김치찌개', condition: '한식이 당긴다면' },
  { menu: '불고기', condition: '달콤한 맛이 좋다면' },
  { menu: '비빔밥', condition: '건강하게 먹고 싶다면' },
];

describe('HistoryItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMenuActionsState = {
      selectedMenu: null,
      showConfirmCard: false,
      restaurants: [],
      loading: false,
    };
    mockAiRecommendationsState = {
      aiRecommendations: [],
      isAiLoading: false,
      aiLoadingMenu: null,
      searchEntryPointHtml: null,
    };
    mockAiHistoryState = {
      showAiHistory: false,
      aiHistoryRecommendations: [],
      isAiHistoryLoading: false,
      groupedAiHistory: [],
    };
    mockUserLocationState = {
      latitude: 37.5172,
      longitude: 127.0473,
      hasLocation: true,
      address: '서울시 강남구 테헤란로 123',
    };
  });

  describe('렌더링 테스트', () => {
    it('히스토리 아이템의 날짜가 표시된다', () => {
      const historyItem = createMockRecommendationHistory({ recommendedAt: '2024-01-15T12:00:00.000Z' });
      renderWithProviders(<HistoryItem item={historyItem} />, { preloadedState: createAuthenticatedState() });
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    it.each([
      ['점심 메뉴 추천해줘', '"점심 메뉴 추천해줘"', true],
      ['', null, false],
    ])('프롬프트 "%s" 표시 여부가 올바르다', (prompt, expectedText, shouldExist) => {
      const historyItem = createMockRecommendationHistory({ prompt });
      renderWithProviders(<HistoryItem item={historyItem} />, { preloadedState: createAuthenticatedState() });
      if (shouldExist && expectedText) {
        expect(screen.getByText(expectedText)).toBeInTheDocument();
      } else {
        expect(screen.queryByText(/^".*"$/)).not.toBeInTheDocument();
      }
    });

    it.each([
      ['한식 중심의 건강한 메뉴를 추천드립니다.', true],
      ['', false],
    ])('추천 이유 표시 여부가 올바르다 (reason: "%s")', (reason, shouldExist) => {
      const historyItem = createMockRecommendationHistory({ reason });
      renderWithProviders(<HistoryItem item={historyItem} />, { preloadedState: createAuthenticatedState() });
      if (shouldExist) {
        expect(screen.getByText('추천 이유')).toBeInTheDocument();
        expect(screen.getByText(reason)).toBeInTheDocument();
      } else {
        expect(screen.queryByText('추천 이유')).not.toBeInTheDocument();
      }
    });
  });

  describe('메뉴 추천 태그 테스트', () => {
    it('추천 메뉴들이 태그로 표시되며 버튼으로 렌더링된다', () => {
      const historyItem = createMockRecommendationHistory({ recommendations: DEFAULT_MENU_RECOMMENDATIONS });
      renderWithProviders(<HistoryItem item={historyItem} />, { preloadedState: createAuthenticatedState() });

      expect(screen.getByText('김치찌개')).toBeInTheDocument();
      expect(screen.getByText('불고기')).toBeInTheDocument();
      expect(screen.getByText('비빔밥')).toBeInTheDocument();
      expect(screen.getByText('김치찌개').closest('button')).toBeInTheDocument();
    });

    it.each([['김치찌개'], ['불고기']])(
      '메뉴 태그 "%s"를 클릭하면 handleMenuClick이 해당 메뉴로 호출된다',
      async (menuName) => {
        const user = userEvent.setup();
        const historyItem = createMockRecommendationHistory({ recommendations: DEFAULT_MENU_RECOMMENDATIONS });
        renderWithProviders(<HistoryItem item={historyItem} />, { preloadedState: createAuthenticatedState() });
        await user.click(screen.getByText(menuName));
        expect(mockHandleMenuClick).toHaveBeenCalledWith(menuName);
      }
    );
  });

  describe('AI 추천 이력 버튼 테스트', () => {
    it.each([
      [true, true],
      [false, false],
    ])('hasPlaceRecommendations=%s 이면 AI 추천 버튼 표시 여부가 올바르다', (hasPlaceRecommendations, shouldExist) => {
      const historyItem = createMockRecommendationHistory({ hasPlaceRecommendations });
      renderWithProviders(<HistoryItem item={historyItem} />, { preloadedState: createAuthenticatedState() });
      if (shouldExist) {
        expect(screen.getByText('AI 추천')).toBeInTheDocument();
      } else {
        expect(screen.queryByText('AI 추천')).not.toBeInTheDocument();
      }
    });

    it('AI 추천 버튼을 클릭하면 handleShowAiHistory가 호출된다', async () => {
      const user = userEvent.setup();
      const historyItem = createMockRecommendationHistory({ hasPlaceRecommendations: true });
      renderWithProviders(<HistoryItem item={historyItem} />, { preloadedState: createAuthenticatedState() });
      await user.click(screen.getByText('AI 추천'));
      expect(mockHandleShowAiHistory).toHaveBeenCalled();
    });

    it('비로그인 상태에서는 AI 추천 버튼이 비활성화된다', () => {
      const historyItem = createMockRecommendationHistory({ hasPlaceRecommendations: true });
      renderWithProviders(<HistoryItem item={historyItem} />, { preloadedState: createUnauthenticatedState() });
      expect(screen.getByText('AI 추천').closest('button')).toBeDisabled();
    });
  });

  describe('모달 버튼 동작 테스트', () => {
    const openModalWithMenu = (hasLocation = true) => {
      mockMenuActionsState.showConfirmCard = true;
      mockMenuActionsState.selectedMenu = '김치찌개';
      mockUserLocationState.hasLocation = hasLocation;
      if (!hasLocation) {
        mockUserLocationState.address = '';
        mockUserLocationState.latitude = null;
        mockUserLocationState.longitude = null;
      }
    };

    it('위치 정보가 있을 때 확인 버튼이 활성화된다', () => {
      openModalWithMenu(true);
      const historyItem = createMockRecommendationHistory({ recommendations: [{ menu: '김치찌개', condition: '한식이 당긴다면' }] });
      renderWithProviders(<HistoryItem item={historyItem} />, { preloadedState: createAuthenticatedState() });
      expect(screen.getByText('확인')).not.toBeDisabled();
    });

    it('AI query context가 없으면 확인 버튼이 비활성화된다', () => {
      openModalWithMenu(false);
      const historyItem = createMockRecommendationHistory({
        recommendations: [{ menu: '김치찌개', condition: '한식이 당긴다면' }],
        requestAddress: '',
      });
      renderWithProviders(<HistoryItem item={historyItem} />, { preloadedState: createAuthenticatedState() });
      expect(screen.getByText('확인')).toBeDisabled();
    });

    it('확인 버튼 클릭 시 handleAiRecommend가 호출된다', async () => {
      const user = userEvent.setup();
      openModalWithMenu(true);
      mockUserLocationState.address = '서울시 강남구 테헤란로 123';
      const historyItem = createMockRecommendationHistory({ recommendations: [{ menu: '김치찌개', condition: '한식이 당긴다면' }] });
      renderWithProviders(<HistoryItem item={historyItem} />, { preloadedState: createAuthenticatedState() });

      await user.click(screen.getByText('확인'));

      await waitFor(() => {
        expect(mockHandleCancel).toHaveBeenCalled();
        expect(mockHandleAiRecommend).toHaveBeenCalledWith('김치찌개');
      });
    });
  });

  describe('AI 추천 이력 렌더링 테스트', () => {
    it('showAiHistory가 true이고 데이터가 있으면 AI 추천 이력 섹션이 표시된다', () => {
      const historyItem = createMockRecommendationHistory({
        hasPlaceRecommendations: true,
        recommendations: [{ menu: '볶음밥', condition: '간단히 먹고 싶다면' }],
      });
      mockAiHistoryState.showAiHistory = true;
      mockAiHistoryState.aiHistoryRecommendations = [
        { placeId: '1', name: '맛있는 집', reason: '추천 이유', source: 'GOOGLE' },
      ];
      mockAiHistoryState.groupedAiHistory = [
        { menuName: '김치찌개', recommendations: [{ placeId: '1', name: '맛있는 집', reason: '추천 이유', source: 'GOOGLE' }] },
      ];
      renderWithProviders(<HistoryItem item={historyItem} />, { preloadedState: createAuthenticatedState() });
      expect(screen.getByText('김치찌개')).toBeInTheDocument();
      expect(screen.getByText('맛있는 집')).toBeInTheDocument();
    });

    it('isAiHistoryLoading이 true면 로딩 스피너가 표시된다', () => {
      const historyItem = createMockRecommendationHistory({ hasPlaceRecommendations: true });
      mockAiHistoryState.showAiHistory = true;
      mockAiHistoryState.isAiHistoryLoading = true;
      renderWithProviders(<HistoryItem item={historyItem} />, { preloadedState: createAuthenticatedState() });
      expect(screen.getByText('AI 추천 맛집 불러오는 중...')).toBeInTheDocument();
    });

    it.each([
      [
        '단일 메뉴',
        [
          {
            menuName: '김치찌개 메뉴',
            recommendations: [
              { placeId: '1', name: '맛있는 김치찌개', reason: '맛있어요', source: 'GOOGLE' },
              { placeId: '2', name: '좋은 김치찌개', reason: '좋아요', source: 'GOOGLE' },
            ],
          },
        ],
        ['김치찌개 메뉴', '맛있는 김치찌개', '좋은 김치찌개', '맛있어요', '좋아요'],
      ],
      [
        '복수 메뉴',
        [
          { menuName: '김치찌개', recommendations: [{ placeId: '1', name: '김치찌개 전문점', reason: '유명해요', source: 'GOOGLE' }] },
          { menuName: '불고기', recommendations: [{ placeId: '2', name: '불고기 맛집', reason: '고기가 좋아요', source: 'GOOGLE' }] },
        ],
        ['김치찌개', '불고기', '김치찌개 전문점', '불고기 맛집'],
      ],
    ])('groupedAiHistory - %s 데이터가 메뉴별로 렌더링된다', (_, groupedAiHistory, expectedTexts) => {
      const historyItem = createMockRecommendationHistory({
        hasPlaceRecommendations: true,
        recommendations: [{ menu: '기타메뉴', condition: '기타 조건' }],
      });
      const allRecommendations = (groupedAiHistory as { menuName: string; recommendations: unknown[] }[])
        .flatMap((g) => g.recommendations);
      mockAiHistoryState.showAiHistory = true;
      mockAiHistoryState.aiHistoryRecommendations = allRecommendations;
      mockAiHistoryState.groupedAiHistory = groupedAiHistory;
      renderWithProviders(<HistoryItem item={historyItem} />, { preloadedState: createAuthenticatedState() });
      for (const text of expectedTexts) {
        expect(screen.getByText(text)).toBeInTheDocument();
      }
    });

    it('showAiHistory가 false면 AI 추천 이력이 표시되지 않는다', () => {
      const historyItem = createMockRecommendationHistory({ hasPlaceRecommendations: true });
      mockAiHistoryState.showAiHistory = false;
      renderWithProviders(<HistoryItem item={historyItem} />, { preloadedState: createAuthenticatedState() });
      expect(screen.queryByText('AI 추천 맛집 불러오는 중...')).not.toBeInTheDocument();
    });
  });

  describe('RestaurantList 및 AiPlaceRecommendations 통합 테스트', () => {
    it('aiRecommendations 배열이 있으면 AiPlaceRecommendations가 렌더링된다', () => {
      const historyItem = createMockRecommendationHistory({ recommendations: [{ menu: '김치찌개', condition: '한식이 당긴다면' }] });
      mockMenuActionsState.selectedMenu = '김치찌개';
      mockAiRecommendationsState.aiRecommendations = [{ placeId: '1', name: 'AI Place 1' }, { placeId: '2', name: 'AI Place 2' }];
      renderWithProviders(<HistoryItem item={historyItem} />, { preloadedState: createAuthenticatedState() });

      expect(screen.getByTestId('ai-place-recommendations')).toBeInTheDocument();
      expect(screen.getByText('AI Recommendations for 김치찌개')).toBeInTheDocument();
      expect(screen.getByText('Recommendations count: 1')).toBeInTheDocument();
    });

    it('AiPlaceRecommendations의 onReset을 호출하면 resetAiRecommendations가 호출된다', async () => {
      const user = userEvent.setup();
      const historyItem = createMockRecommendationHistory({ recommendations: [{ menu: '김치찌개', condition: '한식이 당긴다면' }] });
      mockMenuActionsState.selectedMenu = '김치찌개';
      mockAiRecommendationsState.aiRecommendations = [{ placeId: '1', name: 'AI Place 1' }];
      renderWithProviders(<HistoryItem item={historyItem} />, { preloadedState: createAuthenticatedState() });

      await user.click(screen.getByText('Reset AI Recommendations'));

      await waitFor(() => { expect(mockResetAiRecommendations).toHaveBeenCalled(); });
    });

    it('모달이 열려있으면 AiPlaceRecommendations가 표시되지 않는다', () => {
      const historyItem = createMockRecommendationHistory({ recommendations: [{ menu: '김치찌개', condition: '한식이 당긴다면' }] });
      mockMenuActionsState.selectedMenu = '김치찌개';
      mockMenuActionsState.showConfirmCard = true;
      mockAiRecommendationsState.aiRecommendations = [{ placeId: '1', name: 'AI Place 1' }];
      renderWithProviders(<HistoryItem item={historyItem} />, { preloadedState: createAuthenticatedState() });

      expect(screen.queryByTestId('ai-place-recommendations')).not.toBeInTheDocument();
    });
  });

  describe('모달 ESC 키 및 배경 클릭 테스트', () => {
    beforeEach(() => {
      mockMenuActionsState.showConfirmCard = true;
      mockMenuActionsState.selectedMenu = '김치찌개';
    });

    const renderModalOpen = () =>
      renderWithProviders(
        <HistoryItem item={createMockRecommendationHistory({ recommendations: [{ menu: '김치찌개', condition: '한식이 당긴다면' }] })} />,
        { preloadedState: createAuthenticatedState() }
      );

    it('ESC 키를 누르면 handleCancel이 호출된다', async () => {
      renderModalOpen();
      expect(screen.getAllByText('김치찌개').length).toBeGreaterThan(0);
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await waitFor(() => { expect(mockHandleCancel).toHaveBeenCalled(); });
    });

    it('모달 배경을 클릭하면 handleCancel이 호출된다', async () => {
      const user = userEvent.setup();
      renderModalOpen();
      const backdrop = document.querySelector('.fixed.inset-0.z-50');
      expect(backdrop).toBeInTheDocument();
      if (backdrop) {
        await user.click(backdrop);
        await waitFor(() => { expect(mockHandleCancel).toHaveBeenCalled(); });
      }
    });

    it('모달 내부를 클릭하면 stopPropagation으로 닫히지 않는다', async () => {
      const user = userEvent.setup();
      renderModalOpen();
      const modalContent = document.querySelector('.fixed.inset-0.z-50 .rounded-2xl');
      expect(modalContent).toBeInTheDocument();
      if (modalContent) {
        const callsBefore = mockHandleCancel.mock.calls.length;
        await user.click(modalContent);
        expect(mockHandleCancel.mock.calls.length).toBe(callsBefore);
      }
    });
  });
});
