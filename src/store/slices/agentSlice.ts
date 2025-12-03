/**
 * Agent Redux Slice
 * 에이전트 페이지의 상태를 전역으로 관리합니다.
 */

import type { PlaceRecommendationItem } from '@/types/menu';
import type { Restaurant } from '@/types/search';
import type { RecommendationLocation } from '@/types/user';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export interface MenuPlaceRecommendationGroup {
  menuName: string;
  recommendations: PlaceRecommendationItem[];
}

interface AgentState {
  // 메뉴 추천 결과
  menuRecommendations: string[];
  menuRecommendationHistoryId: number | null;
  menuRecommendationPrompt: string;
  menuRecommendationRequestAddress: string | null;
  menuRecommendationRequestLocation: RecommendationLocation | null;
  isMenuRecommendationLoading: boolean;
  
  // 메뉴 선택 관련
  selectedMenu: string | null;
  menuHistoryId: number | null;
  menuRequestAddress: string | null;
  menuRequestLocation: RecommendationLocation | null;
  
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
  
  // 메뉴 선택 완료 여부 (선택 완료 시 버튼 숨김용)
  hasMenuSelectionCompleted: boolean;
}

const initialState: AgentState = {
  menuRecommendations: [],
  menuRecommendationHistoryId: null,
  menuRecommendationPrompt: '',
  menuRecommendationRequestAddress: null,
  menuRecommendationRequestLocation: null,
  isMenuRecommendationLoading: false,
  selectedMenu: null,
  menuHistoryId: null,
  menuRequestAddress: null,
  menuRequestLocation: null,
  restaurants: [],
  isSearching: false,
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
        recommendations: string[];
        historyId: number;
        prompt: string;
        requestAddress: string | null;
        requestLocation: RecommendationLocation | null;
      }>
    ) => {
      state.menuRecommendations = action.payload.recommendations;
      state.menuRecommendationHistoryId = action.payload.historyId;
      state.menuRecommendationPrompt = action.payload.prompt;
      state.menuRecommendationRequestAddress = action.payload.requestAddress;
      state.menuRecommendationRequestLocation = action.payload.requestLocation;
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
      state.menuRecommendationRequestLocation = null;
    },
    
    // 메뉴 선택 관련
    setSelectedMenu: (
      state,
      action: PayloadAction<{
        menu: string;
        historyId: number;
        requestAddress: string | null;
        requestLocation: RecommendationLocation | null;
      }>
    ) => {
      state.selectedMenu = action.payload.menu;
      state.menuHistoryId = action.payload.historyId;
      state.menuRequestAddress = action.payload.requestAddress;
      state.menuRequestLocation = action.payload.requestLocation;
      state.showConfirmCard = true;
      // 메뉴 선택 시 선택된 장소만 초기화 (검색 결과와 AI 추천은 유지)
      state.selectedPlace = null;
    },
    
    clearSelectedMenu: (state) => {
      state.selectedMenu = null;
      state.menuHistoryId = null;
      state.menuRequestAddress = null;
      state.menuRequestLocation = null;
      // clearSelectedMenu는 사용자가 검색 결과를 닫을 때만 호출되므로 검색 결과는 유지
      // (다른 메뉴를 선택하면 setSelectedMenu가 호출되고, 새로운 검색을 하면 setRestaurants가 호출됨)
      state.selectedPlace = null;
    },
    
    // 네이버 검색 관련
    setRestaurants: (state, action: PayloadAction<Restaurant[]>) => {
      state.restaurants = action.payload;
    },
    
    setIsSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
    },
    
    // AI 추천 관련
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
    },
    
    setAiLoading: (state, action: PayloadAction<{ isLoading: boolean; menuName: string | null }>) => {
      state.isAiLoading = action.payload.isLoading;
      state.aiLoadingMenu = action.payload.menuName;
    },
    
    resetAiRecommendations: (state) => {
      state.aiRecommendationGroups = [];
      state.aiLoadingMenu = null;
      state.isAiLoading = false;
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
  setRestaurants,
  setIsSearching,
  upsertAiRecommendations,
  setAiLoading,
  resetAiRecommendations,
  setSelectedPlace,
  setShowConfirmCard,
  setMenuSelectionCompleted,
  clearAgentState,
} = agentSlice.actions;

export default agentSlice.reducer;

