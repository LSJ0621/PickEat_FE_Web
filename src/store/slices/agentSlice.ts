/**
 * Agent Redux Slice
 * 에이전트 페이지의 상태를 전역으로 관리합니다.
 */

import type { MenuRecommendationItemData, PlaceRecommendationItem } from '@/types/menu';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export interface MenuPlaceRecommendationGroup {
  menuName: string;
  recommendations: PlaceRecommendationItem[];
}

interface AgentState {
  // 메뉴 추천 결과
  menuRecommendations: MenuRecommendationItemData[];
  menuRecommendationHistoryId: number | null;
  menuRecommendationPrompt: string;
  menuRecommendationRequestAddress: string | null;
  menuRecommendationIntro: string | null;
  menuRecommendationClosing: string | null;
  isMenuRecommendationLoading: boolean;

  // 메뉴 선택 관련
  selectedMenu: string | null;
  menuHistoryId: number | null;
  menuRequestAddress: string | null;

  // AI 추천 결과 - 검색 기반 (Google Places)
  searchAiRecommendationGroups: MenuPlaceRecommendationGroup[];
  isSearchAiLoading: boolean;
  searchAiLoadingMenu: string | null;
  searchAiRetrying: boolean;

  // AI 추천 결과 - 커뮤니티 기반 (UserPlace)
  communityAiRecommendationGroups: MenuPlaceRecommendationGroup[];
  isCommunityAiLoading: boolean;
  communityAiLoadingMenu: string | null;
  communityAiRetrying: boolean;

  // 레거시 AI 추천 결과 (하위 호환성 유지)
  // @deprecated - searchAiRecommendationGroups 사용 권장
  aiRecommendationGroups: MenuPlaceRecommendationGroup[];
  isAiLoading: boolean;
  aiLoadingMenu: string | null;

  // 선택된 장소
  selectedPlace: PlaceRecommendationItem | null;

  // UI 상태
  showConfirmCard: boolean;

  // 메뉴 선택 완료 여부 (선택 완료 시 버튼 숨김용)
  hasMenuSelectionCompleted: boolean;
}

const initialState: AgentState = {
  menuRecommendations: [],
  menuRecommendationHistoryId: null,
  menuRecommendationPrompt: '',
  menuRecommendationRequestAddress: null,
  menuRecommendationIntro: null,
  menuRecommendationClosing: null,
  isMenuRecommendationLoading: false,
  selectedMenu: null,
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

const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    // 메뉴 추천 관련
    setMenuRecommendations: (
      state,
      action: PayloadAction<{
        recommendations: MenuRecommendationItemData[];
        historyId: number;
        prompt: string;
        requestAddress: string | null;
        intro: string;
        closing: string;
      }>
    ) => {
      state.menuRecommendations = action.payload.recommendations;
      state.menuRecommendationHistoryId = action.payload.historyId;
      state.menuRecommendationPrompt = action.payload.prompt;
      state.menuRecommendationRequestAddress = action.payload.requestAddress;
      state.menuRecommendationIntro = action.payload.intro;
      state.menuRecommendationClosing = action.payload.closing;
      // 새 추천 받으면 선택 완료 상태 초기화
      state.hasMenuSelectionCompleted = false;
    },
    
    setMenuRecommendationLoading: (state, action: PayloadAction<boolean>) => {
      state.isMenuRecommendationLoading = action.payload;
    },
    
    clearMenuRecommendations: (state) => {
      state.menuRecommendations = [];
      state.menuRecommendationHistoryId = null;
      state.menuRecommendationPrompt = '';
      state.menuRecommendationRequestAddress = null;
      state.menuRecommendationIntro = null;
      state.menuRecommendationClosing = null;
    },
    
    // 메뉴 선택 관련
    setSelectedMenu: (
      state,
      action: PayloadAction<{
        menu: string;
        historyId: number;
        requestAddress: string | null;
      }>
    ) => {
      state.selectedMenu = action.payload.menu;
      state.menuHistoryId = action.payload.historyId;
      state.menuRequestAddress = action.payload.requestAddress;
      state.showConfirmCard = true;
      // 메뉴 선택 시 선택된 장소만 초기화 (검색 결과와 AI 추천은 유지)
      state.selectedPlace = null;
    },
    
    clearSelectedMenu: (state) => {
      state.selectedMenu = null;
      state.menuHistoryId = null;
      state.menuRequestAddress = null;
      state.selectedPlace = null;
    },

    // AI 추천 관련 - 검색 기반 (Google Places)
    upsertSearchAiRecommendations: (
      state,
      action: PayloadAction<{ menuName: string; recommendations: PlaceRecommendationItem[] }>
    ) => {
      const { menuName, recommendations } = action.payload;
      const existingIndex = state.searchAiRecommendationGroups.findIndex(
        (group) => group.menuName === menuName
      );

      if (existingIndex >= 0) {
        state.searchAiRecommendationGroups[existingIndex] = { menuName, recommendations };
      } else {
        state.searchAiRecommendationGroups.push({ menuName, recommendations });
      }
    },

    setSearchAiLoading: (state, action: PayloadAction<{ isLoading: boolean; menuName: string | null }>) => {
      state.isSearchAiLoading = action.payload.isLoading;
      state.searchAiLoadingMenu = action.payload.menuName;
    },

    clearSearchAiRecommendations: (state) => {
      state.searchAiRecommendationGroups = [];
      state.searchAiLoadingMenu = null;
      state.isSearchAiLoading = false;
      state.searchAiRetrying = false;
    },

    setSearchAiRetrying: (state, action: PayloadAction<boolean>) => {
      state.searchAiRetrying = action.payload;
    },

    // AI 추천 관련 - 커뮤니티 기반 (UserPlace)
    upsertCommunityAiRecommendations: (
      state,
      action: PayloadAction<{ menuName: string; recommendations: PlaceRecommendationItem[] }>
    ) => {
      const { menuName, recommendations } = action.payload;
      const existingIndex = state.communityAiRecommendationGroups.findIndex(
        (group) => group.menuName === menuName
      );

      if (existingIndex >= 0) {
        state.communityAiRecommendationGroups[existingIndex] = { menuName, recommendations };
      } else {
        state.communityAiRecommendationGroups.push({ menuName, recommendations });
      }
    },

    setCommunityAiLoading: (state, action: PayloadAction<{ isLoading: boolean; menuName: string | null }>) => {
      state.isCommunityAiLoading = action.payload.isLoading;
      state.communityAiLoadingMenu = action.payload.menuName;
    },

    clearCommunityAiRecommendations: (state) => {
      state.communityAiRecommendationGroups = [];
      state.communityAiLoadingMenu = null;
      state.isCommunityAiLoading = false;
      state.communityAiRetrying = false;
    },

    setCommunityAiRetrying: (state, action: PayloadAction<boolean>) => {
      state.communityAiRetrying = action.payload;
    },

    // 레거시 AI 추천 관련 (하위 호환성 유지)
    // @deprecated - upsertSearchAiRecommendations 사용 권장
    upsertAiRecommendations: (
      state,
      action: PayloadAction<{ menuName: string; recommendations: PlaceRecommendationItem[] }>
    ) => {
      const { menuName, recommendations } = action.payload;
      const existingIndex = state.aiRecommendationGroups.findIndex(
        (group) => group.menuName === menuName
      );

      if (existingIndex >= 0) {
        state.aiRecommendationGroups[existingIndex] = { menuName, recommendations };
      } else {
        state.aiRecommendationGroups.push({ menuName, recommendations });
      }
      // searchAiRecommendationGroups 동기화 코드 제거
      // 검색 추천(searchAiRecommendationGroups)과 저장된 추천(aiRecommendationGroups)은 별도로 관리되어야 함
      // 검색 추천은 upsertSearchAiRecommendations를 통해서만 업데이트되어야 함
    },

    // @deprecated - setSearchAiLoading 사용 권장
    setAiLoading: (state, action: PayloadAction<{ isLoading: boolean; menuName: string | null }>) => {
      state.isAiLoading = action.payload.isLoading;
      state.aiLoadingMenu = action.payload.menuName;
      // 하위 호환성: searchAiLoading에도 동기화
      state.isSearchAiLoading = action.payload.isLoading;
      state.searchAiLoadingMenu = action.payload.menuName;
    },

    // @deprecated - clearSearchAiRecommendations + clearCommunityAiRecommendations 사용 권장
    resetAiRecommendations: (state) => {
      state.aiRecommendationGroups = [];
      state.aiLoadingMenu = null;
      state.isAiLoading = false;
      state.searchAiRecommendationGroups = [];
      state.searchAiLoadingMenu = null;
      state.isSearchAiLoading = false;
      state.searchAiRetrying = false;
      state.communityAiRecommendationGroups = [];
      state.communityAiLoadingMenu = null;
      state.isCommunityAiLoading = false;
      state.communityAiRetrying = false;
      state.selectedPlace = null;
    },
    
    // 선택된 장소
    setSelectedPlace: (state, action: PayloadAction<PlaceRecommendationItem | null>) => {
      state.selectedPlace = action.payload;
    },
    
    // UI 상태
    setShowConfirmCard: (state, action: PayloadAction<boolean>) => {
      state.showConfirmCard = action.payload;
    },
    
    // 메뉴 선택 완료 표시
    setMenuSelectionCompleted: (state) => {
      state.hasMenuSelectionCompleted = true;
    },
    
    // 전체 상태 초기화 (로그아웃 시 사용)
    clearAgentState: () => initialState,
  },
});

export const {
  setMenuRecommendations,
  setMenuRecommendationLoading,
  clearMenuRecommendations,
  setSelectedMenu,
  clearSelectedMenu,
  upsertSearchAiRecommendations,
  setSearchAiLoading,
  clearSearchAiRecommendations,
  setSearchAiRetrying,
  upsertCommunityAiRecommendations,
  setCommunityAiLoading,
  clearCommunityAiRecommendations,
  setCommunityAiRetrying,
  upsertAiRecommendations,
  setAiLoading,
  resetAiRecommendations,
  setSelectedPlace,
  setShowConfirmCard,
  setMenuSelectionCompleted,
  clearAgentState,
} = agentSlice.actions;

export default agentSlice.reducer;

// Selectors
export const selectSearchAiRecommendationGroups = (state: { agent: AgentState }) =>
  state.agent.searchAiRecommendationGroups;
export const selectCommunityAiRecommendationGroups = (state: { agent: AgentState }) =>
  state.agent.communityAiRecommendationGroups;
export const selectIsSearchAiLoading = (state: { agent: AgentState }) =>
  state.agent.isSearchAiLoading;
export const selectIsCommunityAiLoading = (state: { agent: AgentState }) =>
  state.agent.isCommunityAiLoading;
export const selectSearchAiLoadingMenu = (state: { agent: AgentState }) =>
  state.agent.searchAiLoadingMenu;
export const selectCommunityAiLoadingMenu = (state: { agent: AgentState }) =>
  state.agent.communityAiLoadingMenu;

