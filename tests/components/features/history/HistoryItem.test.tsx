import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@tests/utils/renderWithProviders';
import {
  createAuthenticatedState,
  createUnauthenticatedState,
  createMockRecommendationHistory,
} from '@tests/factories';
import { HistoryItem } from '@/components/features/history/HistoryItem';

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
};

let mockAiHistoryState = {
  showAiHistory: false,
  aiHistoryRecommendations: [] as unknown[],
  isAiHistoryLoading: false,
  groupedAiHistory: [] as unknown[],
};

let mockUserLocationState = {
  latitude: 37.5172,
  longitude: 127.0473,
  hasLocation: true,
  address: '서울시 강남구 테헤란로 123',
};

vi.mock('@/hooks/history/useHistoryMenuActions', () => ({
  useHistoryMenuActions: () => ({
    ...mockMenuActionsState,
    handleMenuClick: mockHandleMenuClick,
    handleSearch: mockHandleSearch,
    handleCancel: mockHandleCancel,
    resetSearchResults: mockResetSearchResults,
  }),
}));

vi.mock('@/hooks/history/useHistoryAiRecommendations', () => ({
  useHistoryAiRecommendations: () => ({
    ...mockAiRecommendationsState,
    handleAiRecommend: mockHandleAiRecommend,
    loadStoredAiRecommendations: vi.fn(),
    resetAiRecommendations: mockResetAiRecommendations,
  }),
}));

vi.mock('@/hooks/history/useHistoryAiHistory', () => ({
  useHistoryAiHistory: () => ({
    ...mockAiHistoryState,
    handleShowAiHistory: mockHandleShowAiHistory,
  }),
}));

vi.mock('@/hooks/map/useUserLocation', () => ({
  useUserLocation: () => mockUserLocationState,
}));

// Mock restaurant components
vi.mock('@/components/features/restaurant/RestaurantList', () => ({
  RestaurantList: ({ menuName, restaurants, onClose }: { menuName: string; restaurants: unknown[]; onClose: () => void }) => (
    <div data-testid="restaurant-list">
      <div>RestaurantList for {menuName}</div>
      <div>Restaurants count: {restaurants.length}</div>
      <button onClick={onClose}>Close Restaurant List</button>
    </div>
  ),
}));

vi.mock('@/components/features/restaurant/AiPlaceRecommendations', () => ({
  AiPlaceRecommendations: ({ activeMenuName, recommendations, onReset }: { activeMenuName: string; recommendations: unknown[]; onReset: () => void }) => (
    <div data-testid="ai-place-recommendations">
      <div>AI Recommendations for {activeMenuName}</div>
      <div>Recommendations count: {recommendations.length}</div>
      <button onClick={onReset}>Reset AI Recommendations</button>
    </div>
  ),
}));

vi.mock('@/components/features/restaurant/PlaceDetailsModal', () => ({
  PlaceDetailsModal: ({ placeId, placeName, onClose }: { placeId: string | null; placeName: string | null; onClose: () => void }) => (
    placeId ? (
      <div data-testid="place-details-modal">
        <div>Place Details for {placeName}</div>
        <button onClick={onClose}>Close Details</button>
      </div>
    ) : null
  ),
}));

describe('HistoryItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock states
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
      const historyItem = createMockRecommendationHistory({
        recommendedAt: '2024-01-15T12:00:00.000Z',
      });

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      // formatDateTimeKorean returns formatted date
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    it('프롬프트가 있으면 표시된다', () => {
      const historyItem = createMockRecommendationHistory({
        prompt: '점심 메뉴 추천해줘',
      });

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      expect(screen.getByText('"점심 메뉴 추천해줘"')).toBeInTheDocument();
    });

    it('프롬프트가 없으면 표시되지 않는다', () => {
      const historyItem = createMockRecommendationHistory({
        prompt: '',
      });

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      expect(screen.queryByText(/^".*"$/)).not.toBeInTheDocument();
    });

    it('추천 이유가 있으면 표시된다', () => {
      const historyItem = createMockRecommendationHistory({
        reason: '한식 중심의 건강한 메뉴를 추천드립니다.',
      });

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      expect(screen.getByText('추천 이유')).toBeInTheDocument();
      expect(screen.getByText('한식 중심의 건강한 메뉴를 추천드립니다.')).toBeInTheDocument();
    });

    it('추천 이유가 없으면 표시되지 않는다', () => {
      const historyItem = createMockRecommendationHistory({
        reason: '',
      });

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      expect(screen.queryByText('추천 이유')).not.toBeInTheDocument();
    });
  });

  describe('메뉴 추천 태그 테스트', () => {
    it('추천 메뉴들이 태그로 표시된다', () => {
      const historyItem = createMockRecommendationHistory({
        recommendations: ['김치찌개', '불고기', '비빔밥'],
      });

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      expect(screen.getByText('김치찌개')).toBeInTheDocument();
      expect(screen.getByText('불고기')).toBeInTheDocument();
      expect(screen.getByText('비빔밥')).toBeInTheDocument();
    });

    it('메뉴 태그를 클릭하면 handleMenuClick이 호출된다', async () => {
      const user = userEvent.setup();
      const historyItem = createMockRecommendationHistory({
        recommendations: ['김치찌개'],
      });

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      await user.click(screen.getByText('김치찌개'));

      expect(mockHandleMenuClick).toHaveBeenCalledWith('김치찌개');
    });

    it('여러 메뉴 태그 중 하나를 클릭하면 해당 메뉴로 호출된다', async () => {
      const user = userEvent.setup();
      const historyItem = createMockRecommendationHistory({
        recommendations: ['김치찌개', '불고기', '비빔밥'],
      });

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      await user.click(screen.getByText('불고기'));

      expect(mockHandleMenuClick).toHaveBeenCalledWith('불고기');
    });
  });

  describe('AI 추천 이력 버튼 테스트', () => {
    it('hasPlaceRecommendations가 true면 AI 추천 버튼이 표시된다', () => {
      const historyItem = createMockRecommendationHistory({
        hasPlaceRecommendations: true,
      });

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      expect(screen.getByText('AI 추천')).toBeInTheDocument();
    });

    it('hasPlaceRecommendations가 false면 AI 추천 버튼이 표시되지 않는다', () => {
      const historyItem = createMockRecommendationHistory({
        hasPlaceRecommendations: false,
      });

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      expect(screen.queryByText('AI 추천')).not.toBeInTheDocument();
    });

    it('AI 추천 버튼을 클릭하면 handleShowAiHistory가 호출된다', async () => {
      const user = userEvent.setup();
      const historyItem = createMockRecommendationHistory({
        hasPlaceRecommendations: true,
      });

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      await user.click(screen.getByText('AI 추천'));

      expect(mockHandleShowAiHistory).toHaveBeenCalled();
    });

    it('비로그인 상태에서는 AI 추천 버튼이 비활성화된다', () => {
      const historyItem = createMockRecommendationHistory({
        hasPlaceRecommendations: true,
      });

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createUnauthenticatedState(),
      });

      const aiButton = screen.getByText('AI 추천').closest('button');
      expect(aiButton).toBeDisabled();
    });
  });

  describe('카드 스타일 테스트', () => {
    it('카드가 둥근 모서리와 배경을 가진다', () => {
      const historyItem = createMockRecommendationHistory();

      const { container } = renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      const card = container.querySelector('.rounded-\\[32px\\]');
      expect(card).toBeInTheDocument();
    });

    it('메뉴 태그가 오렌지 스타일을 가진다', () => {
      const historyItem = createMockRecommendationHistory({
        recommendations: ['김치찌개'],
      });

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      const menuTag = screen.getByText('김치찌개');
      expect(menuTag).toHaveClass('text-orange-200');
    });
  });

  describe('날짜 포맷 테스트', () => {
    it('날짜가 한국어 형식으로 표시된다', () => {
      const historyItem = createMockRecommendationHistory({
        recommendedAt: '2024-01-15T12:00:00.000Z',
      });

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      // formatDateTimeKorean returns a formatted date string
      const dateText = screen.getByText(/2024/);
      expect(dateText).toBeInTheDocument();
    });
  });

  describe('접근성 테스트', () => {
    it('메뉴 태그가 버튼으로 렌더링된다', () => {
      const historyItem = createMockRecommendationHistory({
        recommendations: ['김치찌개'],
      });

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      const button = screen.getByText('김치찌개').closest('button');
      expect(button).toBeInTheDocument();
    });

    it('AI 추천 버튼이 버튼 태그로 렌더링된다', () => {
      const historyItem = createMockRecommendationHistory({
        hasPlaceRecommendations: true,
      });

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      const aiButton = screen.getByText('AI 추천').closest('button');
      expect(aiButton).toBeInTheDocument();
    });
  });

  describe('모달 버튼 동작 테스트', () => {
    it('일반 검색 버튼 클릭 시 handleSearchWithClose가 호출되고 모달이 닫힌다', async () => {
      const user = userEvent.setup();
      const historyItem = createMockRecommendationHistory({
        recommendations: ['김치찌개'],
      });

      // Set modal to open state with location available
      mockMenuActionsState.showConfirmCard = true;
      mockMenuActionsState.selectedMenu = '김치찌개';
      mockUserLocationState.hasLocation = true;

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      const searchButton = screen.getByText('일반 검색 (네이버)');
      expect(searchButton).not.toBeDisabled();

      await user.click(searchButton);

      await waitFor(() => {
        expect(mockHandleCancel).toHaveBeenCalled();
        expect(mockHandleSearch).toHaveBeenCalled();
      });
    });

    it('일반 검색 버튼은 hasLocation이 false면 비활성화된다', () => {
      const historyItem = createMockRecommendationHistory({
        recommendations: ['김치찌개'],
      });

      // Set modal to open state WITHOUT location
      mockMenuActionsState.showConfirmCard = true;
      mockMenuActionsState.selectedMenu = '김치찌개';
      mockUserLocationState.hasLocation = false;

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      const searchButton = screen.getByText('일반 검색 (네이버)');
      expect(searchButton).toBeDisabled();
    });

    it('AI 추천 버튼 클릭 시 handleAiRecommendWithClose가 호출되고 모달이 닫힌다', async () => {
      const user = userEvent.setup();
      const historyItem = createMockRecommendationHistory({
        recommendations: ['김치찌개'],
      });

      // Set modal to open state with AI query context
      mockMenuActionsState.showConfirmCard = true;
      mockMenuActionsState.selectedMenu = '김치찌개';
      mockUserLocationState.hasLocation = true;
      mockUserLocationState.address = '서울시 강남구 테헤란로 123';

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      const aiButton = screen.getByText('AI 추천 받기');
      expect(aiButton).not.toBeDisabled();

      await user.click(aiButton);

      await waitFor(() => {
        expect(mockHandleCancel).toHaveBeenCalled();
        expect(mockHandleAiRecommend).toHaveBeenCalledWith('김치찌개');
      });
    });

    it('AI 추천 버튼은 hasAiQueryContext가 false면 비활성화된다', () => {
      const historyItem = createMockRecommendationHistory({
        recommendations: ['김치찌개'],
        requestAddress: '', // No request address
      });

      // Set modal to open state WITHOUT AI query context
      mockMenuActionsState.showConfirmCard = true;
      mockMenuActionsState.selectedMenu = '김치찌개';
      mockUserLocationState.hasLocation = false;
      mockUserLocationState.address = '';
      mockUserLocationState.latitude = null;
      mockUserLocationState.longitude = null;

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      const aiButton = screen.getByText('AI 추천 받기');
      expect(aiButton).toBeDisabled();
    });
  });

  describe('AI 추천 이력 렌더링 테스트', () => {
    it('showAiHistory가 true이고 데이터가 있으면 AI 추천 이력 섹션이 표시된다', () => {
      const historyItem = createMockRecommendationHistory({
        hasPlaceRecommendations: true,
        recommendations: ['볶음밥'], // Use different menu to avoid conflicts
      });

      mockAiHistoryState.showAiHistory = true;
      mockAiHistoryState.isAiHistoryLoading = false;
      mockAiHistoryState.aiHistoryRecommendations = [
        { placeId: '1', name: '맛있는 집', reason: '추천 이유' },
      ];
      mockAiHistoryState.groupedAiHistory = [
        {
          menuName: '김치찌개',
          recommendations: [
            { placeId: '1', name: '맛있는 집', reason: '추천 이유' },
          ],
        },
      ];

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      // Check that the section is rendered with menu name and place name
      expect(screen.getByText('김치찌개')).toBeInTheDocument();
      expect(screen.getByText('맛있는 집')).toBeInTheDocument();
    });

    it('isAiHistoryLoading이 true면 로딩 스피너가 표시된다', () => {
      const historyItem = createMockRecommendationHistory({
        hasPlaceRecommendations: true,
      });

      mockAiHistoryState.showAiHistory = true;
      mockAiHistoryState.isAiHistoryLoading = true;
      mockAiHistoryState.aiHistoryRecommendations = [];

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      expect(screen.getByText('AI 추천 맛집 불러오는 중...')).toBeInTheDocument();
    });

    it('groupedAiHistory 데이터가 있으면 메뉴별로 추천 장소가 렌더링된다', () => {
      const historyItem = createMockRecommendationHistory({
        hasPlaceRecommendations: true,
        recommendations: ['김치찌개'], // Avoid conflict with menu name
      });

      mockAiHistoryState.showAiHistory = true;
      mockAiHistoryState.isAiHistoryLoading = false;
      mockAiHistoryState.aiHistoryRecommendations = [
        { placeId: '1', name: '맛있는 김치찌개', reason: '맛있어요' },
        { placeId: '2', name: '좋은 김치찌개', reason: '좋아요' },
      ];
      mockAiHistoryState.groupedAiHistory = [
        {
          menuName: '김치찌개 메뉴',
          recommendations: [
            { placeId: '1', name: '맛있는 김치찌개', reason: '맛있어요' },
            { placeId: '2', name: '좋은 김치찌개', reason: '좋아요' },
          ],
        },
      ];

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      expect(screen.getByText('김치찌개 메뉴')).toBeInTheDocument();
      expect(screen.getByText('맛있는 김치찌개')).toBeInTheDocument();
      expect(screen.getByText('좋은 김치찌개')).toBeInTheDocument();
      expect(screen.getByText('맛있어요')).toBeInTheDocument();
      expect(screen.getByText('좋아요')).toBeInTheDocument();
    });

    it('여러 메뉴의 AI 추천이 그룹별로 렌더링된다', () => {
      const historyItem = createMockRecommendationHistory({
        hasPlaceRecommendations: true,
        recommendations: ['기타메뉴'], // Avoid conflicts
      });

      mockAiHistoryState.showAiHistory = true;
      mockAiHistoryState.isAiHistoryLoading = false;
      mockAiHistoryState.aiHistoryRecommendations = [
        { placeId: '1', name: '김치찌개 전문점', reason: '유명해요' },
        { placeId: '2', name: '불고기 맛집', reason: '고기가 좋아요' },
      ];
      mockAiHistoryState.groupedAiHistory = [
        {
          menuName: '김치찌개',
          recommendations: [
            { placeId: '1', name: '김치찌개 전문점', reason: '유명해요' },
          ],
        },
        {
          menuName: '불고기',
          recommendations: [
            { placeId: '2', name: '불고기 맛집', reason: '고기가 좋아요' },
          ],
        },
      ];

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      expect(screen.getByText('김치찌개')).toBeInTheDocument();
      expect(screen.getByText('불고기')).toBeInTheDocument();
      expect(screen.getByText('김치찌개 전문점')).toBeInTheDocument();
      expect(screen.getByText('불고기 맛집')).toBeInTheDocument();
    });

    it('showAiHistory가 false면 AI 추천 이력이 표시되지 않는다', () => {
      const historyItem = createMockRecommendationHistory({
        hasPlaceRecommendations: true,
      });

      mockAiHistoryState.showAiHistory = false;

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      expect(screen.queryByText('AI 추천 맛집 불러오는 중...')).not.toBeInTheDocument();
    });
  });

  describe('RestaurantList 및 AiPlaceRecommendations 통합 테스트', () => {
    it('restaurants 배열이 있으면 RestaurantList가 렌더링된다', () => {
      const historyItem = createMockRecommendationHistory({
        recommendations: ['김치찌개'],
      });

      // Set state with restaurants results and modal closed
      mockMenuActionsState.selectedMenu = '김치찌개';
      mockMenuActionsState.showConfirmCard = false;
      mockMenuActionsState.restaurants = [
        { id: '1', name: 'Restaurant 1' },
        { id: '2', name: 'Restaurant 2' },
      ];

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      expect(screen.getByTestId('restaurant-list')).toBeInTheDocument();
      expect(screen.getByText('RestaurantList for 김치찌개')).toBeInTheDocument();
      expect(screen.getByText('Restaurants count: 2')).toBeInTheDocument();
    });

    it('RestaurantList의 onClose를 호출하면 resetSearchResults가 호출된다', async () => {
      const user = userEvent.setup();
      const historyItem = createMockRecommendationHistory({
        recommendations: ['김치찌개'],
      });

      mockMenuActionsState.selectedMenu = '김치찌개';
      mockMenuActionsState.showConfirmCard = false;
      mockMenuActionsState.restaurants = [{ id: '1', name: 'Restaurant 1' }];

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      const closeButton = screen.getByText('Close Restaurant List');
      await user.click(closeButton);

      await waitFor(() => {
        expect(mockResetSearchResults).toHaveBeenCalled();
      });
    });

    it('aiRecommendations 배열이 있으면 AiPlaceRecommendations가 렌더링된다', () => {
      const historyItem = createMockRecommendationHistory({
        recommendations: ['김치찌개'],
      });

      // Set state with AI recommendations and modal closed
      mockMenuActionsState.selectedMenu = '김치찌개';
      mockMenuActionsState.showConfirmCard = false;
      mockAiRecommendationsState.aiRecommendations = [
        { placeId: '1', name: 'AI Place 1' },
        { placeId: '2', name: 'AI Place 2' },
      ];

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      expect(screen.getByTestId('ai-place-recommendations')).toBeInTheDocument();
      expect(screen.getByText('AI Recommendations for 김치찌개')).toBeInTheDocument();
      expect(screen.getByText('Recommendations count: 1')).toBeInTheDocument();
    });

    it('AiPlaceRecommendations의 onReset을 호출하면 resetAiRecommendations가 호출된다', async () => {
      const user = userEvent.setup();
      const historyItem = createMockRecommendationHistory({
        recommendations: ['김치찌개'],
      });

      mockMenuActionsState.selectedMenu = '김치찌개';
      mockMenuActionsState.showConfirmCard = false;
      mockAiRecommendationsState.aiRecommendations = [{ placeId: '1', name: 'AI Place 1' }];

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      const resetButton = screen.getByText('Reset AI Recommendations');
      await user.click(resetButton);

      await waitFor(() => {
        expect(mockResetAiRecommendations).toHaveBeenCalled();
      });
    });

    it('isAiLoading이 true면 AiPlaceRecommendations가 로딩 상태로 렌더링된다', () => {
      const historyItem = createMockRecommendationHistory({
        recommendations: ['김치찌개'],
      });

      mockMenuActionsState.selectedMenu = '김치찌개';
      mockMenuActionsState.showConfirmCard = false;
      mockAiRecommendationsState.isAiLoading = true;
      mockAiRecommendationsState.aiLoadingMenu = '김치찌개';
      mockAiRecommendationsState.aiRecommendations = [];

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      expect(screen.getByTestId('ai-place-recommendations')).toBeInTheDocument();
    });

    it('모달이 열려있으면 restaurants가 있어도 RestaurantList가 표시되지 않는다', () => {
      const historyItem = createMockRecommendationHistory({
        recommendations: ['김치찌개'],
      });

      mockMenuActionsState.selectedMenu = '김치찌개';
      mockMenuActionsState.showConfirmCard = true; // Modal is open
      mockMenuActionsState.restaurants = [{ id: '1', name: 'Restaurant 1' }];

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      expect(screen.queryByTestId('restaurant-list')).not.toBeInTheDocument();
    });
  });

  describe('모달 ESC 키 및 배경 클릭 테스트', () => {
    it('모달이 열린 상태에서 ESC 키를 누르면 handleCancel이 호출된다', async () => {
      const historyItem = createMockRecommendationHistory({
        recommendations: ['김치찌개'],
      });

      // Set modal to open state
      mockMenuActionsState.showConfirmCard = true;
      mockMenuActionsState.selectedMenu = '김치찌개';

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      // Modal should be visible
      expect(screen.getByText(/어떤 방식으로 탐색할까요/)).toBeInTheDocument();

      // Press ESC key
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(escapeEvent);

      await waitFor(() => {
        expect(mockHandleCancel).toHaveBeenCalled();
      });
    });

    it('모달 배경을 클릭하면 handleCancel이 호출된다', async () => {
      const user = userEvent.setup();
      const historyItem = createMockRecommendationHistory({
        recommendations: ['김치찌개'],
      });

      // Set modal to open state
      mockMenuActionsState.showConfirmCard = true;
      mockMenuActionsState.selectedMenu = '김치찌개';

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      // Find the backdrop (modal overlay with bg-black/50 class)
      const backdrop = screen.getByText(/어떤 방식으로 탐색할까요/).closest('.fixed.inset-0');
      expect(backdrop).toBeInTheDocument();

      if (backdrop) {
        await user.click(backdrop);
        await waitFor(() => {
          expect(mockHandleCancel).toHaveBeenCalled();
        });
      }
    });

    it('모달 내부를 클릭하면 stopPropagation으로 닫히지 않는다', async () => {
      const user = userEvent.setup();
      const historyItem = createMockRecommendationHistory({
        recommendations: ['김치찌개'],
      });

      // Set modal to open state
      mockMenuActionsState.showConfirmCard = true;
      mockMenuActionsState.selectedMenu = '김치찌개';

      renderWithProviders(<HistoryItem item={historyItem} />, {
        preloadedState: createAuthenticatedState(),
      });

      // Find modal content (the inner div with rounded corners)
      const modalContent = screen.getByText(/어떤 방식으로 탐색할까요/).closest('.rounded-\\[32px\\]');
      expect(modalContent).toBeInTheDocument();

      if (modalContent) {
        const cancelCallsBefore = mockHandleCancel.mock.calls.length;
        await user.click(modalContent);
        const cancelCallsAfter = mockHandleCancel.mock.calls.length;
        expect(cancelCallsAfter).toBe(cancelCallsBefore);
      }
    });
  });
});
