import { describe, it, expect, beforeEach } from 'vitest';
import agentReducer, {
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
  type MenuPlaceRecommendationGroup,
} from '@/store/slices/agentSlice';
import type { PlaceRecommendationItem } from '@/types/menu';
import type { Restaurant } from '@/types/search';

describe('agentSlice', () => {
  const initialState = {
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

  beforeEach(() => {
    // Reset state before each test by returning a fresh initial state
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = agentReducer(undefined, { type: '@@INIT' });
      expect(state).toEqual(initialState);
    });
  });

  describe('setMenuRecommendations', () => {
    it('should set menu recommendations with all related data', () => {
      const payload = {
        recommendations: ['김치찌개', '된장찌개', '순두부찌개'],
        historyId: 123,
        prompt: '오늘 점심 뭐 먹을까?',
        requestAddress: '서울시 강남구',
        reason: '날씨가 추워서 따뜻한 국물 요리를 추천드립니다.',
      };

      const state = agentReducer(initialState, setMenuRecommendations(payload));

      expect(state.menuRecommendations).toEqual(payload.recommendations);
      expect(state.menuRecommendationHistoryId).toBe(payload.historyId);
      expect(state.menuRecommendationPrompt).toBe(payload.prompt);
      expect(state.menuRecommendationRequestAddress).toBe(payload.requestAddress);
      expect(state.menuRecommendationReason).toBe(payload.reason);
      expect(state.hasMenuSelectionCompleted).toBe(false);
    });

    it('should reset hasMenuSelectionCompleted when receiving new recommendations', () => {
      const stateWithSelection = {
        ...initialState,
        hasMenuSelectionCompleted: true,
      };

      const payload = {
        recommendations: ['파스타'],
        historyId: 456,
        prompt: 'test',
        requestAddress: null,
        reason: 'test reason',
      };

      const state = agentReducer(stateWithSelection, setMenuRecommendations(payload));
      expect(state.hasMenuSelectionCompleted).toBe(false);
    });

    it('should handle null requestAddress', () => {
      const payload = {
        recommendations: ['치킨'],
        historyId: 789,
        prompt: 'test',
        requestAddress: null,
        reason: 'test reason',
      };

      const state = agentReducer(initialState, setMenuRecommendations(payload));
      expect(state.menuRecommendationRequestAddress).toBeNull();
    });
  });

  describe('setMenuRecommendationLoading', () => {
    it('should set loading to true', () => {
      const state = agentReducer(initialState, setMenuRecommendationLoading(true));
      expect(state.isMenuRecommendationLoading).toBe(true);
    });

    it('should set loading to false', () => {
      const loadingState = {
        ...initialState,
        isMenuRecommendationLoading: true,
      };
      const state = agentReducer(loadingState, setMenuRecommendationLoading(false));
      expect(state.isMenuRecommendationLoading).toBe(false);
    });
  });

  describe('clearMenuRecommendations', () => {
    it('should clear all menu recommendation related fields', () => {
      const stateWithData = {
        ...initialState,
        menuRecommendations: ['김치찌개', '된장찌개'],
        menuRecommendationHistoryId: 123,
        menuRecommendationPrompt: 'test prompt',
        menuRecommendationRequestAddress: '서울시',
        menuRecommendationReason: 'test reason',
      };

      const state = agentReducer(stateWithData, clearMenuRecommendations());

      expect(state.menuRecommendations).toEqual([]);
      expect(state.menuRecommendationHistoryId).toBeNull();
      expect(state.menuRecommendationPrompt).toBe('');
      expect(state.menuRecommendationRequestAddress).toBeNull();
      expect(state.menuRecommendationReason).toBeNull();
    });
  });

  describe('setSelectedMenu', () => {
    it('should set selected menu with history id and request address', () => {
      const payload = {
        menu: '김치찌개',
        historyId: 456,
        requestAddress: '서울시 강남구',
      };

      const state = agentReducer(initialState, setSelectedMenu(payload));

      expect(state.selectedMenu).toBe(payload.menu);
      expect(state.menuHistoryId).toBe(payload.historyId);
      expect(state.menuRequestAddress).toBe(payload.requestAddress);
      expect(state.showConfirmCard).toBe(true);
      expect(state.selectedPlace).toBeNull();
    });

    it('should clear selectedPlace while keeping search results and AI recommendations', () => {
      const restaurants: Restaurant[] = [
        { name: '맛집1', address: '주소1' },
        { name: '맛집2', address: '주소2' },
      ];

      const aiGroups: MenuPlaceRecommendationGroup[] = [
        {
          menuName: '김치찌개',
          recommendations: [
            { placeId: 'place1', name: '맛집1', reason: '맛있어요' },
          ],
        },
      ];

      const stateWithData = {
        ...initialState,
        restaurants,
        aiRecommendationGroups: aiGroups,
        selectedPlace: { placeId: 'place1', name: '맛집1', reason: '맛있어요' },
      };

      const payload = {
        menu: '된장찌개',
        historyId: 789,
        requestAddress: null,
      };

      const state = agentReducer(stateWithData, setSelectedMenu(payload));

      expect(state.restaurants).toEqual(restaurants);
      expect(state.aiRecommendationGroups).toEqual(aiGroups);
      expect(state.selectedPlace).toBeNull();
    });

    it('should handle null requestAddress', () => {
      const payload = {
        menu: '파스타',
        historyId: 999,
        requestAddress: null,
      };

      const state = agentReducer(initialState, setSelectedMenu(payload));
      expect(state.menuRequestAddress).toBeNull();
    });
  });

  describe('clearSelectedMenu', () => {
    it('should clear selected menu and selected place', () => {
      const stateWithSelection = {
        ...initialState,
        selectedMenu: '김치찌개',
        menuHistoryId: 123,
        menuRequestAddress: '서울시',
        selectedPlace: { placeId: 'place1', name: '맛집', reason: '맛있어요' },
      };

      const state = agentReducer(stateWithSelection, clearSelectedMenu());

      expect(state.selectedMenu).toBeNull();
      expect(state.menuHistoryId).toBeNull();
      expect(state.menuRequestAddress).toBeNull();
      expect(state.selectedPlace).toBeNull();
    });
  });

  describe('setRestaurants', () => {
    it('should set restaurants array', () => {
      const restaurants: Restaurant[] = [
        {
          name: '맛집1',
          address: '주소1',
          phone: '02-1234-5678',
          latitude: 37.5,
          longitude: 127.0,
        },
        {
          name: '맛집2',
          address: '주소2',
          roadAddress: '도로명주소2',
        },
      ];

      const state = agentReducer(initialState, setRestaurants(restaurants));
      expect(state.restaurants).toEqual(restaurants);
    });

    it('should replace existing restaurants', () => {
      const oldRestaurants: Restaurant[] = [
        { name: '옛날맛집', address: '옛날주소' },
      ];

      const stateWithOldData = {
        ...initialState,
        restaurants: oldRestaurants,
      };

      const newRestaurants: Restaurant[] = [
        { name: '새로운맛집', address: '새로운주소' },
      ];

      const state = agentReducer(stateWithOldData, setRestaurants(newRestaurants));
      expect(state.restaurants).toEqual(newRestaurants);
      expect(state.restaurants).not.toEqual(oldRestaurants);
    });

    it('should handle empty array', () => {
      const state = agentReducer(initialState, setRestaurants([]));
      expect(state.restaurants).toEqual([]);
    });
  });

  describe('setIsSearching', () => {
    it('should set searching to true', () => {
      const state = agentReducer(initialState, setIsSearching(true));
      expect(state.isSearching).toBe(true);
    });

    it('should set searching to false', () => {
      const searchingState = { ...initialState, isSearching: true };
      const state = agentReducer(searchingState, setIsSearching(false));
      expect(state.isSearching).toBe(false);
    });
  });

  describe('upsertAiRecommendations', () => {
    it('should add new AI recommendation group', () => {
      const payload = {
        menuName: '김치찌개',
        recommendations: [
          { placeId: 'place1', name: '맛집1', reason: '맛있어요' },
          { placeId: 'place2', name: '맛집2', reason: '친절해요' },
        ],
      };

      const state = agentReducer(initialState, upsertAiRecommendations(payload));

      expect(state.aiRecommendationGroups).toHaveLength(1);
      expect(state.aiRecommendationGroups[0]).toEqual(payload);
    });

    it('should update existing AI recommendation group', () => {
      const existingGroups: MenuPlaceRecommendationGroup[] = [
        {
          menuName: '김치찌개',
          recommendations: [
            { placeId: 'old1', name: '옛날맛집', reason: '옛날이유' },
          ],
        },
        {
          menuName: '된장찌개',
          recommendations: [
            { placeId: 'other1', name: '다른맛집', reason: '다른이유' },
          ],
        },
      ];

      const stateWithGroups = {
        ...initialState,
        aiRecommendationGroups: existingGroups,
      };

      const payload = {
        menuName: '김치찌개',
        recommendations: [
          { placeId: 'new1', name: '새로운맛집', reason: '새로운이유' },
          { placeId: 'new2', name: '또다른맛집', reason: '또다른이유' },
        ],
      };

      const state = agentReducer(stateWithGroups, upsertAiRecommendations(payload));

      expect(state.aiRecommendationGroups).toHaveLength(2);
      expect(state.aiRecommendationGroups[0]).toEqual(payload);
      expect(state.aiRecommendationGroups[1]).toEqual(existingGroups[1]);
    });

    it('should append new group when menu name does not exist', () => {
      const existingGroups: MenuPlaceRecommendationGroup[] = [
        {
          menuName: '김치찌개',
          recommendations: [
            { placeId: 'place1', name: '맛집1', reason: '이유1' },
          ],
        },
      ];

      const stateWithGroups = {
        ...initialState,
        aiRecommendationGroups: existingGroups,
      };

      const payload = {
        menuName: '된장찌개',
        recommendations: [
          { placeId: 'place2', name: '맛집2', reason: '이유2' },
        ],
      };

      const state = agentReducer(stateWithGroups, upsertAiRecommendations(payload));

      expect(state.aiRecommendationGroups).toHaveLength(2);
      expect(state.aiRecommendationGroups[0]).toEqual(existingGroups[0]);
      expect(state.aiRecommendationGroups[1]).toEqual(payload);
    });

    it('should handle empty recommendations array', () => {
      const payload = {
        menuName: '김치찌개',
        recommendations: [],
      };

      const state = agentReducer(initialState, upsertAiRecommendations(payload));
      expect(state.aiRecommendationGroups[0].recommendations).toEqual([]);
    });
  });

  describe('setAiLoading', () => {
    it('should set AI loading state with menu name', () => {
      const payload = { isLoading: true, menuName: '김치찌개' };
      const state = agentReducer(initialState, setAiLoading(payload));

      expect(state.isAiLoading).toBe(true);
      expect(state.aiLoadingMenu).toBe('김치찌개');
    });

    it('should clear AI loading state', () => {
      const loadingState = {
        ...initialState,
        isAiLoading: true,
        aiLoadingMenu: '김치찌개',
      };

      const payload = { isLoading: false, menuName: null };
      const state = agentReducer(loadingState, setAiLoading(payload));

      expect(state.isAiLoading).toBe(false);
      expect(state.aiLoadingMenu).toBeNull();
    });
  });

  describe('resetAiRecommendations', () => {
    it('should reset all AI recommendation related fields', () => {
      const stateWithAiData = {
        ...initialState,
        aiRecommendationGroups: [
          {
            menuName: '김치찌개',
            recommendations: [
              { placeId: 'place1', name: '맛집1', reason: '이유1' },
            ],
          },
        ],
        isAiLoading: true,
        aiLoadingMenu: '김치찌개',
        selectedPlace: { placeId: 'place1', name: '맛집1', reason: '이유1' },
      };

      const state = agentReducer(stateWithAiData, resetAiRecommendations());

      expect(state.aiRecommendationGroups).toEqual([]);
      expect(state.aiLoadingMenu).toBeNull();
      expect(state.isAiLoading).toBe(false);
      expect(state.selectedPlace).toBeNull();
    });
  });

  describe('setSelectedPlace', () => {
    it('should set selected place', () => {
      const place: PlaceRecommendationItem = {
        placeId: 'place123',
        name: '맛집',
        reason: '맛있어요',
        menuName: '김치찌개',
      };

      const state = agentReducer(initialState, setSelectedPlace(place));
      expect(state.selectedPlace).toEqual(place);
    });

    it('should clear selected place with null', () => {
      const stateWithPlace = {
        ...initialState,
        selectedPlace: { placeId: 'place1', name: '맛집', reason: '이유' },
      };

      const state = agentReducer(stateWithPlace, setSelectedPlace(null));
      expect(state.selectedPlace).toBeNull();
    });

    it('should replace existing selected place', () => {
      const oldPlace: PlaceRecommendationItem = {
        placeId: 'old1',
        name: '옛날맛집',
        reason: '옛날이유',
      };

      const stateWithOldPlace = {
        ...initialState,
        selectedPlace: oldPlace,
      };

      const newPlace: PlaceRecommendationItem = {
        placeId: 'new1',
        name: '새로운맛집',
        reason: '새로운이유',
      };

      const state = agentReducer(stateWithOldPlace, setSelectedPlace(newPlace));
      expect(state.selectedPlace).toEqual(newPlace);
      expect(state.selectedPlace).not.toEqual(oldPlace);
    });
  });

  describe('setShowConfirmCard', () => {
    it('should set showConfirmCard to true', () => {
      const state = agentReducer(initialState, setShowConfirmCard(true));
      expect(state.showConfirmCard).toBe(true);
    });

    it('should set showConfirmCard to false', () => {
      const stateWithCard = { ...initialState, showConfirmCard: true };
      const state = agentReducer(stateWithCard, setShowConfirmCard(false));
      expect(state.showConfirmCard).toBe(false);
    });
  });

  describe('setMenuSelectionCompleted', () => {
    it('should set hasMenuSelectionCompleted to true', () => {
      const state = agentReducer(initialState, setMenuSelectionCompleted());
      expect(state.hasMenuSelectionCompleted).toBe(true);
    });

    it('should keep hasMenuSelectionCompleted true when already true', () => {
      const completedState = {
        ...initialState,
        hasMenuSelectionCompleted: true,
      };
      const state = agentReducer(completedState, setMenuSelectionCompleted());
      expect(state.hasMenuSelectionCompleted).toBe(true);
    });
  });

  describe('clearAgentState', () => {
    it('should reset entire state to initial state', () => {
      const complexState = {
        menuRecommendations: ['김치찌개', '된장찌개'],
        menuRecommendationHistoryId: 123,
        menuRecommendationPrompt: 'test prompt',
        menuRecommendationRequestAddress: '서울시',
        menuRecommendationReason: 'test reason',
        isMenuRecommendationLoading: true,
        selectedMenu: '김치찌개',
        menuHistoryId: 456,
        menuRequestAddress: '서울시 강남구',
        restaurants: [{ name: '맛집', address: '주소' }],
        isSearching: true,
        aiRecommendationGroups: [
          {
            menuName: '김치찌개',
            recommendations: [
              { placeId: 'place1', name: '맛집1', reason: '이유1' },
            ],
          },
        ],
        isAiLoading: true,
        aiLoadingMenu: '김치찌개',
        selectedPlace: { placeId: 'place1', name: '맛집1', reason: '이유1' },
        showConfirmCard: true,
        hasMenuSelectionCompleted: true,
      };

      const state = agentReducer(complexState, clearAgentState());
      expect(state).toEqual(initialState);
    });
  });

  describe('complex state transitions', () => {
    it('should handle multiple sequential actions correctly', () => {
      let state = agentReducer(initialState, setMenuRecommendationLoading(true));
      expect(state.isMenuRecommendationLoading).toBe(true);

      state = agentReducer(
        state,
        setMenuRecommendations({
          recommendations: ['김치찌개', '된장찌개'],
          historyId: 123,
          prompt: 'test',
          requestAddress: '서울시',
          reason: 'test reason',
        })
      );
      expect(state.menuRecommendations).toHaveLength(2);

      state = agentReducer(state, setMenuRecommendationLoading(false));
      expect(state.isMenuRecommendationLoading).toBe(false);

      state = agentReducer(
        state,
        setSelectedMenu({
          menu: '김치찌개',
          historyId: 123,
          requestAddress: '서울시',
        })
      );
      expect(state.selectedMenu).toBe('김치찌개');
      expect(state.showConfirmCard).toBe(true);

      state = agentReducer(state, setIsSearching(true));
      const restaurants: Restaurant[] = [
        { name: '맛집1', address: '주소1' },
        { name: '맛집2', address: '주소2' },
      ];
      state = agentReducer(state, setRestaurants(restaurants));
      state = agentReducer(state, setIsSearching(false));

      expect(state.restaurants).toHaveLength(2);
      expect(state.isSearching).toBe(false);

      state = agentReducer(
        state,
        setAiLoading({ isLoading: true, menuName: '김치찌개' })
      );
      state = agentReducer(
        state,
        upsertAiRecommendations({
          menuName: '김치찌개',
          recommendations: [
            { placeId: 'place1', name: '맛집1', reason: '이유1' },
          ],
        })
      );
      state = agentReducer(
        state,
        setAiLoading({ isLoading: false, menuName: null })
      );

      expect(state.aiRecommendationGroups).toHaveLength(1);

      state = agentReducer(
        state,
        setSelectedPlace({ placeId: 'place1', name: '맛집1', reason: '이유1' })
      );
      expect(state.selectedPlace).not.toBeNull();

      state = agentReducer(state, setMenuSelectionCompleted());
      expect(state.hasMenuSelectionCompleted).toBe(true);
    });

    it('should preserve unrelated state when updating specific fields', () => {
      const stateWithData = {
        ...initialState,
        menuRecommendations: ['김치찌개'],
        menuRecommendationHistoryId: 123,
        selectedMenu: '김치찌개',
        restaurants: [{ name: '맛집', address: '주소' }],
      };

      const state = agentReducer(stateWithData, setIsSearching(true));

      expect(state.menuRecommendations).toEqual(['김치찌개']);
      expect(state.menuRecommendationHistoryId).toBe(123);
      expect(state.selectedMenu).toBe('김치찌개');
      expect(state.restaurants).toEqual([{ name: '맛집', address: '주소' }]);
      expect(state.isSearching).toBe(true);
    });
  });
});
