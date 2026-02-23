import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { setupStore, createWrapper } from '@tests/utils/renderWithProviders';
import { useAgentActions } from '@/hooks/agent/useAgentActions';
import { setSelectedMenu, setShowConfirmCard } from '@/store/slices/agentSlice';
import { createMockAgentState } from '@tests/factories/agent';
import type { ResultsSectionRef } from '@/components/features/agent/ResultsSection';
import { http, HttpResponse } from 'msw';
import { server } from '@tests/mocks/server';
import { ENDPOINTS } from '@shared/api/endpoints';

const BASE_URL = 'http://localhost:3000';

// Mock useErrorHandler
const mockHandleError = vi.fn();
const mockHandleSuccess = vi.fn();

vi.mock('@/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
    handleSuccess: mockHandleSuccess,
  }),
}));

describe('useAgentActions', () => {
  let store: ReturnType<typeof setupStore>;
  let wrapper: ReturnType<typeof createWrapper>;

  const defaultProps = {
    latitude: 37.5665,
    longitude: 126.978,
    hasLocation: true,
    address: '서울시 중구',
    resultsSectionRef: { current: null } as React.RefObject<ResultsSectionRef | null>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    store = setupStore({
      auth: {
        isAuthenticated: true,
        user: { email: 'test@example.com', name: '테스트유저' },
        loading: false,
        error: null,
      },
      agent: createMockAgentState(),
    });

    wrapper = createWrapper({ store });
  });

  describe('handleMenuClick', () => {
    it('should dispatch setSelectedMenu with correct payload', () => {
      const { result } = renderHook(() => useAgentActions(defaultProps), { wrapper });

      act(() => {
        result.current.handleMenuClick('김치찌개', 1, { requestAddress: '서울시 강남구' });
      });

      const state = store.getState();
      expect(state.agent.selectedMenu).toBe('김치찌개');
      expect(state.agent.menuHistoryId).toBe(1);
      expect(state.agent.menuRequestAddress).toBe('서울시 강남구');
    });

    it('should handle menu click without requestAddress', () => {
      const { result } = renderHook(() => useAgentActions(defaultProps), { wrapper });

      act(() => {
        result.current.handleMenuClick('불고기', 2);
      });

      const state = store.getState();
      expect(state.agent.selectedMenu).toBe('불고기');
      expect(state.agent.menuHistoryId).toBe(2);
      expect(state.agent.menuRequestAddress).toBe(null);
    });

    it('should be memoized and not change on re-render', () => {
      const { result, rerender } = renderHook(() => useAgentActions(defaultProps), { wrapper });

      const firstRender = result.current.handleMenuClick;
      rerender();
      const secondRender = result.current.handleMenuClick;

      expect(firstRender).toBe(secondRender);
    });
  });

  describe('handleSearch', () => {
    beforeEach(() => {
      act(() => {
        store.dispatch(setSelectedMenu({ menu: '김치찌개', historyId: 1, requestAddress: null }));
      });
    });

    it('should show error when not authenticated', async () => {
      const unauthStore = setupStore({
        auth: { isAuthenticated: false, user: null, loading: false, error: null },
        agent: store.getState().agent,
      });

      const { result } = renderHook(() => useAgentActions(defaultProps), {
        wrapper: ({ children }) => <Provider store={unauthStore}>{children}</Provider>,
      });

      await result.current.handleSearch();

      expect(mockHandleError).toHaveBeenCalledWith('로그인이 필요합니다.', 'Agent');
    });

    it('should show error when location is not available', async () => {
      const { result } = renderHook(
        () =>
          useAgentActions({
            ...defaultProps,
            hasLocation: false,
            latitude: null,
            longitude: null,
          }),
        { wrapper }
      );

      await result.current.handleSearch();

      expect(mockHandleError).toHaveBeenCalledWith(
        '위치 정보가 없습니다. 주소를 등록해주세요.',
        'Agent'
      );
    });

    it('should return early when selectedMenu is null', async () => {
      const emptyMenuStore = setupStore({
        auth: store.getState().auth,
        agent: { ...store.getState().agent, selectedMenu: null },
      });

      const { result } = renderHook(() => useAgentActions(defaultProps), {
        wrapper: ({ children }) => <Provider store={emptyMenuStore}>{children}</Provider>,
      });

      await result.current.handleSearch();

      expect(mockHandleError).not.toHaveBeenCalled();
    });

    it('should successfully search restaurants', async () => {
      const mockSwitchToTab = vi.fn();
      const refWithMock = {
        current: { switchToTab: mockSwitchToTab } as unknown as ResultsSectionRef,
      };

      const { result } = renderHook(
        () => useAgentActions({ ...defaultProps, resultsSectionRef: refWithMock }),
        { wrapper }
      );

      await result.current.handleSearch();

      await waitFor(() => {
        expect(mockSwitchToTab).toHaveBeenCalledWith('search');
        const state = store.getState();
        expect(state.agent.showConfirmCard).toBe(false);
        expect(state.agent.restaurants.length).toBeGreaterThan(0);
      });
    });

    it('should handle search API error', async () => {
      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.SEARCH.RESTAURANTS}`, () => {
          return HttpResponse.json({ message: '검색 실패' }, { status: 500 });
        })
      );

      const { result } = renderHook(() => useAgentActions(defaultProps), { wrapper });

      await result.current.handleSearch();

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith(expect.any(Error), 'Agent');
      });
    });

    it('should set isSearching state correctly during search', async () => {
      const { result } = renderHook(() => useAgentActions(defaultProps), { wrapper });

      const searchPromise = result.current.handleSearch();

      // Check isSearching is true during search
      await waitFor(() => {
        const state = store.getState();
        expect(state.agent.isSearching).toBe(true);
      });

      await searchPromise;

      // Check isSearching is false after search
      await waitFor(() => {
        const state = store.getState();
        expect(state.agent.isSearching).toBe(false);
      });
    });
  });

  describe('handleCancel', () => {
    it('should set showConfirmCard to false', () => {
      store.dispatch(setShowConfirmCard(true));

      const { result } = renderHook(() => useAgentActions(defaultProps), { wrapper });

      act(() => {
        result.current.handleCancel();
      });

      const state = store.getState();
      expect(state.agent.showConfirmCard).toBe(false);
    });

    it('should be memoized', () => {
      const { result, rerender } = renderHook(() => useAgentActions(defaultProps), { wrapper });

      const firstRender = result.current.handleCancel;
      rerender();
      const secondRender = result.current.handleCancel;

      expect(firstRender).toBe(secondRender);
    });
  });

  describe('loadStoredAiRecommendations', () => {
    it('should load and normalize stored recommendations', async () => {
      // Set up menu with historyId before rendering hook
      act(() => {
        store.dispatch(setSelectedMenu({ menu: '김치찌개', historyId: 1, requestAddress: null }));
      });

      // Mock AI recommendation to return 400 error to trigger loadStoredAiRecommendations
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.MENU.RECOMMEND_PLACES}`, () => {
          return HttpResponse.json({ message: '이미 추천받은 메뉴입니다.' }, { status: 400 });
        }),
        http.get(`${BASE_URL}/menu/recommendations/:id`, () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: '점심 메뉴 추천',
              reason: '테스트',
              recommendedAt: new Date().toISOString(),
              requestAddress: '서울시',
              hasPlaceRecommendations: true,
            },
            places: [
              {
                menuName: '김치찌개',
                placeId: 'places/ChIJ1234',
                reason: '맛집입니다',
                name: '테스트 식당',
                address: '서울시',
                rating: 4.5,
                userRatingCount: 100,
                priceLevel: 'MODERATE',
                photos: [],
                openNow: true,
                reviews: [],
              },
            ],
          });
        })
      );

      const { result } = renderHook(() => useAgentActions(defaultProps), { wrapper });

      await act(async () => {
        await result.current.handleAiRecommendation();
      });

      await waitFor(() => {
        const state = store.getState();
        const group = state.agent.aiRecommendationGroups.find((g) => g.menuName === '김치찌개');
        expect(group).toBeDefined();
        expect(group?.recommendations[0].placeId).toBe('ChIJ1234'); // 'places/' prefix removed
      }, { timeout: 3000 });
    });

    it('should handle empty recommendations with error message', async () => {
      server.use(
        http.get(`${BASE_URL}/menu/recommendations/:id`, () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: '점심 메뉴 추천',
              reason: '테스트',
              recommendedAt: new Date().toISOString(),
              requestAddress: '서울시',
              hasPlaceRecommendations: false,
            },
            places: [],
          });
        })
      );

      act(() => {
        store.dispatch(setSelectedMenu({ menu: '김치찌개', historyId: 1, requestAddress: null }));
      });

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.MENU.RECOMMEND_PLACES}`, () => {
          return HttpResponse.json({ message: '이미 추천받은 메뉴입니다.' }, { status: 400 });
        })
      );

      const { result } = renderHook(() => useAgentActions(defaultProps), { wrapper });

      await act(async () => {
        await result.current.handleAiRecommendation();
      });

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith(
          '이미 추천받은 이력이 있지만 저장된 결과를 찾지 못했습니다.',
          'Agent'
        );
      });
    });

    it('should filter recommendations by menuName', async () => {
      server.use(
        http.get(`${BASE_URL}/menu/recommendations/:id`, () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: '점심 메뉴 추천',
              reason: '테스트',
              recommendedAt: new Date().toISOString(),
              requestAddress: '서울시',
              hasPlaceRecommendations: true,
            },
            places: [
              {
                menuName: '김치찌개',
                placeId: 'ChIJ1234',
                reason: '맛집',
                name: '식당1',
                address: '서울',
                rating: 4.5,
                userRatingCount: 100,
                priceLevel: 'MODERATE',
                photos: [],
                openNow: true,
                reviews: [],
              },
              {
                menuName: '불고기',
                placeId: 'ChIJ5678',
                reason: '맛집',
                name: '식당2',
                address: '서울',
                rating: 4.5,
                userRatingCount: 100,
                priceLevel: 'MODERATE',
                photos: [],
                openNow: true,
                reviews: [],
              },
            ],
          });
        })
      );

      act(() => {
        store.dispatch(setSelectedMenu({ menu: '김치찌개', historyId: 1, requestAddress: null }));
      });

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.MENU.RECOMMEND_PLACES}`, () => {
          return HttpResponse.json({ message: '이미 추천받은 메뉴입니다.' }, { status: 400 });
        })
      );

      const { result } = renderHook(() => useAgentActions(defaultProps), { wrapper });

      await act(async () => {
        await result.current.handleAiRecommendation();
      });

      await waitFor(() => {
        const state = store.getState();
        const group = state.agent.aiRecommendationGroups.find((g) => g.menuName === '김치찌개');
        expect(group?.recommendations).toHaveLength(1);
        expect(group?.recommendations[0].menuName).toBe('김치찌개');
      });
    });
  });

  describe('handleAiRecommendation', () => {
    beforeEach(() => {
      act(() => {
        store.dispatch(setSelectedMenu({ menu: '김치찌개', historyId: 1, requestAddress: '서울시 중구' }));
      });
    });

    it('should show error when not authenticated', async () => {
      const unauthStore = setupStore({
        auth: { isAuthenticated: false, user: null, loading: false, error: null },
        agent: store.getState().agent,
      });

      const { result } = renderHook(() => useAgentActions(defaultProps), {
        wrapper: ({ children }) => <Provider store={unauthStore}>{children}</Provider>,
      });

      await result.current.handleAiRecommendation();

      expect(mockHandleError).toHaveBeenCalledWith('로그인이 필요합니다.', 'Agent');
    });

    it('should return early when selectedMenu is null', async () => {
      const emptyMenuStore = setupStore({
        auth: store.getState().auth,
        agent: { ...store.getState().agent, selectedMenu: null, menuHistoryId: null },
      });

      const { result } = renderHook(() => useAgentActions(defaultProps), {
        wrapper: ({ children }) => <Provider store={emptyMenuStore}>{children}</Provider>,
      });

      await result.current.handleAiRecommendation();

      expect(mockHandleError).not.toHaveBeenCalled();
    });

    it('should show success when already recommended', async () => {
      const storeWithRecommendations = setupStore({
        auth: store.getState().auth,
        agent: {
          ...store.getState().agent,
          selectedMenu: '김치찌개',
          menuHistoryId: 1,
          aiRecommendationGroups: [
            {
              menuName: '김치찌개',
              recommendations: [
                { placeId: 'ChIJ1234', name: '테스트 식당', reason: '맛집', menuName: '김치찌개' },
              ],
            },
          ],
        },
      });

      const mockSwitchToTab = vi.fn();
      const refWithMock = {
        current: { switchToTab: mockSwitchToTab } as unknown as ResultsSectionRef,
      };

      const { result } = renderHook(
        () => useAgentActions({ ...defaultProps, resultsSectionRef: refWithMock }),
        {
          wrapper: ({ children }) => <Provider store={storeWithRecommendations}>{children}</Provider>,
        }
      );

      await result.current.handleAiRecommendation();

      expect(mockSwitchToTab).toHaveBeenCalledWith('ai');
      expect(mockHandleSuccess).toHaveBeenCalledWith(
        '이미 추천받은 메뉴입니다. 저장된 결과를 보여드렸어요.'
      );
    });

    it('should show error when no address or location is available', async () => {
      // Clear menuRequestAddress to ensure no address is available
      act(() => {
        store.dispatch(setSelectedMenu({ menu: '김치찌개', historyId: 1, requestAddress: null }));
      });

      const { result } = renderHook(
        () =>
          useAgentActions({
            ...defaultProps,
            address: null,
            latitude: null,
            longitude: null,
          }),
        { wrapper }
      );

      await result.current.handleAiRecommendation();

      expect(mockHandleError).toHaveBeenCalledWith(
        'AI 추천을 사용하려면 주소 또는 위치 정보를 등록해주세요.',
        'Agent'
      );
    });

    it('should use address over coordinates when both are available', async () => {
      const mockSwitchToTab = vi.fn();
      const refWithMock = {
        current: { switchToTab: mockSwitchToTab } as unknown as ResultsSectionRef,
      };

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.MENU.RECOMMEND_PLACES}`, ({ request }) => {
          const url = new URL(request.url);
          const query = url.searchParams.get('query');
          expect(query).toContain('서울시 중구'); // address is used
          expect(query).not.toContain('37.5665'); // coordinates not used

          return HttpResponse.json({
            recommendations: [
              {
                placeId: 'ChIJ1234',
                name: '테스트 식당',
                reason: '맛집',
                menuName: '김치찌개',
              },
            ],
          });
        })
      );

      const { result } = renderHook(
        () => useAgentActions({ ...defaultProps, resultsSectionRef: refWithMock }),
        { wrapper }
      );

      await act(async () => {
        await result.current.handleAiRecommendation();
      });

      await waitFor(() => {
        expect(mockSwitchToTab).toHaveBeenCalledWith('ai');
      });
    });

    it('should use menuRequestAddress when current address is not available', async () => {
      const storeWithRequestAddress = setupStore({
        auth: store.getState().auth,
        agent: {
          ...store.getState().agent,
          selectedMenu: '김치찌개',
          menuHistoryId: 1,
          menuRequestAddress: '서울시 강남구',
        },
      });

      let queryChecked = false;
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.MENU.RECOMMEND_PLACES}`, ({ request }) => {
          const url = new URL(request.url);
          const query = url.searchParams.get('query');
          expect(query).toContain('서울시 강남구');
          queryChecked = true;

          return HttpResponse.json({ recommendations: [] });
        })
      );

      const { result } = renderHook(
        () => useAgentActions({ ...defaultProps, address: null }),
        {
          wrapper: ({ children }) => <Provider store={storeWithRequestAddress}>{children}</Provider>,
        }
      );

      await act(async () => {
        await result.current.handleAiRecommendation();
      });

      // Verify the query was checked
      expect(queryChecked).toBe(true);

      // Check loading state is false after completion
      const state = storeWithRequestAddress.getState();
      expect(state.agent.isAiLoading).toBe(false);
      expect(state.agent.aiLoadingMenu).toBe(null);
    });

    it('should use coordinates as fallback when no address is available', async () => {
      // Clear menuRequestAddress to force coordinate fallback
      act(() => {
        store.dispatch(setSelectedMenu({ menu: '김치찌개', historyId: 1, requestAddress: null }));
      });

      let queryChecked = false;
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.MENU.RECOMMEND_PLACES}`, ({ request }) => {
          const url = new URL(request.url);
          const query = url.searchParams.get('query');
          expect(query).toContain('37.5665,126.978');
          queryChecked = true;

          return HttpResponse.json({ recommendations: [] });
        })
      );

      const { result } = renderHook(
        () => useAgentActions({ ...defaultProps, address: null }),
        { wrapper }
      );

      await act(async () => {
        await result.current.handleAiRecommendation();
      });

      // Verify the query was checked
      expect(queryChecked).toBe(true);

      // Check loading state is false after completion
      const state = store.getState();
      expect(state.agent.isAiLoading).toBe(false);
      expect(state.agent.aiLoadingMenu).toBe(null);
    });

    it('should successfully get AI recommendations', async () => {
      const mockSwitchToTab = vi.fn();
      const refWithMock = {
        current: { switchToTab: mockSwitchToTab } as unknown as ResultsSectionRef,
      };

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.MENU.RECOMMEND_PLACES}`, () => {
          return HttpResponse.json({
            recommendations: [
              {
                placeId: 'places/ChIJ1234',
                name: '테스트 식당',
                reason: '맛집입니다',
                menuName: '김치찌개',
              },
            ],
          });
        })
      );

      const { result } = renderHook(
        () => useAgentActions({ ...defaultProps, resultsSectionRef: refWithMock }),
        { wrapper }
      );

      await act(async () => {
        await result.current.handleAiRecommendation();
      });

      await waitFor(() => {
        expect(mockSwitchToTab).toHaveBeenCalledWith('ai');
        const state = store.getState();
        const group = state.agent.aiRecommendationGroups.find((g) => g.menuName === '김치찌개');
        expect(group?.recommendations[0].placeId).toBe('ChIJ1234'); // prefix removed
      });
    });

    it('should handle empty AI recommendations', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.MENU.RECOMMEND_PLACES}`, () => {
          return HttpResponse.json({ recommendations: [] });
        })
      );

      const { result } = renderHook(() => useAgentActions(defaultProps), { wrapper });

      await act(async () => {
        await result.current.handleAiRecommendation();
      });

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith('AI 추천 결과가 없습니다.', 'Agent');
      });
    });

    it('should handle 400 error by loading stored recommendations', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.MENU.RECOMMEND_PLACES}`, () => {
          return HttpResponse.json({ message: '이미 추천받은 메뉴입니다.' }, { status: 400 });
        }),
        http.get(`${BASE_URL}/menu/recommendations/:id`, () => {
          return HttpResponse.json({
            history: {
              id: 1,
              type: 'MENU',
              prompt: '점심 메뉴',
              reason: '테스트',
              recommendedAt: new Date().toISOString(),
              requestAddress: '서울시',
              hasPlaceRecommendations: true,
            },
            places: [
              {
                menuName: '김치찌개',
                placeId: 'ChIJ1234',
                reason: '맛집',
                name: '저장된 식당',
                address: '서울',
                rating: 4.5,
                userRatingCount: 100,
                priceLevel: 'MODERATE',
                photos: [],
                openNow: true,
                reviews: [],
              },
            ],
          });
        })
      );

      const { result } = renderHook(() => useAgentActions(defaultProps), { wrapper });

      await act(async () => {
        await result.current.handleAiRecommendation();
      });

      await waitFor(() => {
        const state = store.getState();
        const group = state.agent.aiRecommendationGroups.find((g) => g.menuName === '김치찌개');
        expect(group?.recommendations[0].name).toBe('저장된 식당');
      });
    });

    it('should handle non-400 API errors', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.MENU.RECOMMEND_PLACES}`, () => {
          return HttpResponse.json({ message: '서버 오류' }, { status: 500 });
        })
      );

      const { result } = renderHook(() => useAgentActions(defaultProps), { wrapper });

      await result.current.handleAiRecommendation();

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith(expect.any(Error), 'Agent');
      });
    });

    it('should set AI loading state correctly', async () => {
      const { result } = renderHook(() => useAgentActions(defaultProps), { wrapper });

      // Check initial state
      const initialState = store.getState();
      expect(initialState.agent.isAiLoading).toBe(false);
      expect(initialState.agent.aiLoadingMenu).toBe(null);

      // Start the recommendation process (don't await yet)
      const recommendationPromise = result.current.handleAiRecommendation();

      // Loading state should be set to true immediately (synchronously)
      await waitFor(() => {
        const state = store.getState();
        expect(state.agent.isAiLoading).toBe(true);
        expect(state.agent.aiLoadingMenu).toBe('김치찌개');
      });

      // Wait for the promise to complete
      await recommendationPromise;

      // Check that loading state becomes false after completion
      const finalState = store.getState();
      expect(finalState.agent.isAiLoading).toBe(false);
      expect(finalState.agent.aiLoadingMenu).toBe(null);
    });
  });
});
