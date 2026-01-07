/**
 * Agent State Factory
 * Agent Redux 상태 테스트를 위한 Factory 함수
 */

import type { PlaceRecommendationItem } from '@/types/menu';
import type { Restaurant } from '@/types/search';

/**
 * MenuPlaceRecommendationGroup 인터페이스
 * (agentSlice.ts와 동일한 구조)
 */
export interface MenuPlaceRecommendationGroup {
  menuName: string;
  recommendations: PlaceRecommendationItem[];
}

/**
 * AgentState 인터페이스
 * (agentSlice.ts와 동일한 구조)
 */
export interface AgentState {
  // 메뉴 추천 결과
  menuRecommendations: string[];
  menuRecommendationHistoryId: number | null;
  menuRecommendationPrompt: string;
  menuRecommendationRequestAddress: string | null;
  menuRecommendationReason: string | null;
  isMenuRecommendationLoading: boolean;

  // 메뉴 선택 관련
  selectedMenu: string | null;
  menuHistoryId: number | null;
  menuRequestAddress: string | null;

  // 네이버 검색 결과
  restaurants: Restaurant[];
  isSearching: boolean;

  // AI 추천 결과
  aiRecommendationGroups: MenuPlaceRecommendationGroup[];
  isAiLoading: boolean;
  aiLoadingMenu: string | null;

  // 선택된 장소
  selectedPlace: PlaceRecommendationItem | null;

  // UI 상태
  showConfirmCard: boolean;

  // 메뉴 선택 완료 여부
  hasMenuSelectionCompleted: boolean;
}

/**
 * 기본 Agent 상태
 */
export const defaultAgentState: AgentState = {
  menuRecommendations: [],
  menuRecommendationHistoryId: null,
  menuRecommendationPrompt: '',
  menuRecommendationRequestAddress: null,
  menuRecommendationReason: null,
  isMenuRecommendationLoading: false,
  selectedMenu: null,
  menuHistoryId: null,
  menuRequestAddress: null,
  restaurants: [],
  isSearching: false,
  aiRecommendationGroups: [],
  isAiLoading: false,
  aiLoadingMenu: null,
  selectedPlace: null,
  showConfirmCard: false,
  hasMenuSelectionCompleted: false,
};

/**
 * Mock AgentState 생성
 * @param overrides - 덮어쓸 속성들
 */
export function createMockAgentState(overrides?: Partial<AgentState>): AgentState {
  return {
    ...defaultAgentState,
    ...overrides,
  };
}

/**
 * 메뉴 추천 결과가 있는 Agent 상태 생성
 */
export function createAgentStateWithMenuRecommendations(
  recommendations: string[] = ['김치찌개', '불고기', '비빔밥'],
  historyId: number = 1
): { agent: AgentState } {
  return {
    agent: createMockAgentState({
      menuRecommendations: recommendations,
      menuRecommendationHistoryId: historyId,
      menuRecommendationPrompt: '점심 메뉴 추천해줘',
      menuRecommendationReason: '한식 중심의 건강한 메뉴를 추천드립니다.',
      menuRecommendationRequestAddress: '서울시 강남구 테헤란로 123',
    }),
  };
}

/**
 * 메뉴가 선택된 Agent 상태 생성
 */
export function createAgentStateWithSelectedMenu(
  menuName: string = '김치찌개',
  historyId: number = 1
): { agent: AgentState } {
  return {
    agent: createMockAgentState({
      selectedMenu: menuName,
      menuHistoryId: historyId,
      menuRequestAddress: '서울시 강남구 테헤란로 123',
      showConfirmCard: true,
    }),
  };
}

/**
 * AI 로딩 중인 Agent 상태 생성
 */
export function createAgentStateWithAiLoading(
  menuName: string = '김치찌개'
): { agent: AgentState } {
  return {
    agent: createMockAgentState({
      selectedMenu: menuName,
      isAiLoading: true,
      aiLoadingMenu: menuName,
      showConfirmCard: true,
    }),
  };
}

/**
 * Creates a mock MenuPlaceRecommendationGroup with specified menu name and count
 */
export function createMockRecommendationGroup(
  menuName: string,
  count: number = 2
): MenuPlaceRecommendationGroup {
  const recommendations = Array.from({ length: count }, (_, i) => ({
    placeId: `place-${menuName}-${i}`,
    name: `${menuName} 맛집 ${i + 1}`,
    reason: `${menuName} 추천 이유 ${i + 1}`,
    menuName,
  }));
  return { menuName, recommendations };
}

/**
 * AI 추천 결과가 있는 Agent 상태 생성
 */
export function createAgentStateWithAiRecommendations(
  groups?: MenuPlaceRecommendationGroup[]
): { agent: AgentState } {
  const defaultGroups: MenuPlaceRecommendationGroup[] = [
    {
      menuName: '김치찌개',
      recommendations: [
        {
          placeId: 'ChIJ1234567890',
          name: '명동 김치찌개',
          reason: '전통적인 김치찌개 맛집',
          menuName: '김치찌개',
        },
      ],
    },
  ];

  return {
    agent: createMockAgentState({
      selectedMenu: '김치찌개',
      aiRecommendationGroups: groups ?? defaultGroups,
      showConfirmCard: true,
    }),
  };
}

/**
 * 검색 중인 Agent 상태 생성
 */
export function createAgentStateSearching(menuName: string = '김치찌개'): { agent: AgentState } {
  return {
    agent: createMockAgentState({
      selectedMenu: menuName,
      isSearching: true,
      showConfirmCard: true,
    }),
  };
}

/**
 * 레스토랑 목록이 있는 Agent 상태 생성
 */
export function createAgentStateWithRestaurantList(
  restaurants?: Restaurant[]
): { agent: AgentState } {
  const defaultRestaurants: Restaurant[] = [
    {
      name: '명동 김치찌개',
      link: 'https://place.naver.com/restaurant/123',
      phone: '02-1234-5678',
      address: '서울시 중구 명동길 123',
      roadAddress: '서울시 중구 명동길 123',
      mapx: 1269869,
      mapy: 375636,
    },
  ];

  return {
    agent: createMockAgentState({
      selectedMenu: '김치찌개',
      restaurants: restaurants ?? defaultRestaurants,
      menuRequestAddress: '서울시 강남구 테헤란로 123',
      showConfirmCard: true,
    }),
  };
}

/**
 * 장소가 선택된 Agent 상태 생성
 */
export function createAgentStateWithSelectedPlace(
  place?: PlaceRecommendationItem
): { agent: AgentState } {
  const defaultPlace: PlaceRecommendationItem = {
    placeId: 'ChIJ1234567890',
    name: '명동 김치찌개',
    reason: '전통적인 김치찌개 맛집',
    menuName: '김치찌개',
  };

  return {
    agent: createMockAgentState({
      selectedMenu: '김치찌개',
      selectedPlace: place ?? defaultPlace,
      showConfirmCard: true,
    }),
  };
}

/**
 * 초기 상태 (빈 상태) 생성
 */
export function createEmptyAgentState(): { agent: AgentState } {
  return {
    agent: createMockAgentState(),
  };
}
