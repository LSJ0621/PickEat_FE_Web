import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { setupStore, createWrapper } from '@tests/utils/renderWithProviders';
import { useAgentActions } from '@features/agent/hooks/useAgentActions';
import { setSelectedMenu, setShowConfirmCard } from '@app/store/slices/agentSlice';
import { createMockAgentState } from '@tests/factories/agent';

// Mock useErrorHandler
const mockHandleError = vi.fn();
const mockHandleSuccess = vi.fn();

vi.mock('@shared/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: mockHandleError,
    handleSuccess: mockHandleSuccess,
  }),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('useAgentActions', () => {
  let store: ReturnType<typeof setupStore>;
  let wrapper: ReturnType<typeof createWrapper>;

  const defaultProps = {
    latitude: 37.5665,
    longitude: 126.978,
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

  describe('handleAiRecommendation', () => {
    it('should show error when not authenticated', async () => {
      const unauthStore = setupStore({
        auth: { isAuthenticated: false, user: null, loading: false, error: null },
        agent: store.getState().agent,
      });

      const { result } = renderHook(() => useAgentActions(defaultProps), {
        wrapper: ({ children }) => <Provider store={unauthStore}>{children}</Provider>,
      });

      await act(async () => {
        await result.current.handleAiRecommendation();
      });

      expect(mockHandleError).toHaveBeenCalledWith('toast.auth.loginRequired', 'Agent');
    });

    it('should show error when location is not available', async () => {
      // Set a selected menu first so it doesn't return early
      const storeWithMenu = setupStore({
        auth: { isAuthenticated: true, user: { email: 'test@example.com', name: '테스트' }, loading: false, error: null },
        agent: createMockAgentState({ selectedMenu: '김치찌개', menuHistoryId: 1 }),
      });

      const { result } = renderHook(
        () =>
          useAgentActions({
            latitude: null,
            longitude: null,
          }),
        { wrapper: ({ children }) => <Provider store={storeWithMenu}>{children}</Provider> }
      );

      await act(async () => {
        await result.current.handleAiRecommendation();
      });

      expect(mockHandleError).toHaveBeenCalledWith('errors.agent.locationRequired', 'Agent');
    });

    it('should return early when selectedMenu is null', async () => {
      const { result } = renderHook(() => useAgentActions(defaultProps), { wrapper });

      await act(async () => {
        await result.current.handleAiRecommendation();
      });

      // No error should be shown since selectedMenu is null (early return)
      expect(mockHandleError).not.toHaveBeenCalled();
    });

    it('should provide handleAiRecommendation function', () => {
      const { result } = renderHook(() => useAgentActions(defaultProps), { wrapper });

      expect(typeof result.current.handleAiRecommendation).toBe('function');
    });
  });

  describe('return value', () => {
    it('should return all expected functions', () => {
      const { result } = renderHook(() => useAgentActions(defaultProps), { wrapper });

      expect(typeof result.current.handleMenuClick).toBe('function');
      expect(typeof result.current.handleCancel).toBe('function');
      expect(typeof result.current.handleAiRecommendation).toBe('function');
    });
  });

  describe('setSelectedMenu effect', () => {
    it('should set showConfirmCard to true when menu is selected', () => {
      const { result } = renderHook(() => useAgentActions(defaultProps), { wrapper });

      act(() => {
        result.current.handleMenuClick('김치찌개', 1);
      });

      const state = store.getState();
      expect(state.agent.showConfirmCard).toBe(true);
    });

    it('should clear selectedPlace when new menu is selected', () => {
      act(() => {
        store.dispatch(setSelectedMenu({ menu: '김치찌개', historyId: 1, requestAddress: null }));
      });

      const { result } = renderHook(() => useAgentActions(defaultProps), { wrapper });

      act(() => {
        result.current.handleMenuClick('불고기', 2);
      });

      const state = store.getState();
      expect(state.agent.selectedPlace).toBeNull();
    });
  });
});
