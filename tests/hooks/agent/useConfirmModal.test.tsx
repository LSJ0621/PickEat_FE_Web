import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { setupStore, createWrapper } from '@tests/utils/renderWithProviders';
import { useConfirmModal } from '@/hooks/agent/useConfirmModal';
import { setShowConfirmCard, setSelectedMenu } from '@/store/slices/agentSlice';
import { createMockAgentState } from '@tests/factories/agent';

describe('useConfirmModal', () => {
  let store: ReturnType<typeof setupStore>;
  let wrapper: ReturnType<typeof createWrapper>;
  const mockHandleCancel = vi.fn();

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

  describe('state selection', () => {
    it('should return showConfirmCard from state', () => {
      store.dispatch(setShowConfirmCard(true));

      const { result } = renderHook(() => useConfirmModal({ handleCancel: mockHandleCancel }), {
        wrapper,
      });

      expect(result.current.showConfirmCard).toBe(true);
    });

    it('should return menuRequestAddress from state', () => {
      store.dispatch(
        setSelectedMenu({ menu: '김치찌개', historyId: 1, requestAddress: '서울시 강남구' })
      );

      const { result } = renderHook(() => useConfirmModal({ handleCancel: mockHandleCancel }), {
        wrapper,
      });

      expect(result.current.menuRequestAddress).toBe('서울시 강남구');
    });

    it('should return null menuRequestAddress when not set', () => {
      const { result } = renderHook(() => useConfirmModal({ handleCancel: mockHandleCancel }), {
        wrapper,
      });

      expect(result.current.menuRequestAddress).toBe(null);
    });
  });

  describe('ESC key handler', () => {
    it('should call handleCancel when ESC is pressed and modal is open', () => {
      store.dispatch(setShowConfirmCard(true));

      renderHook(() => useConfirmModal({ handleCancel: mockHandleCancel }), { wrapper });

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(escapeEvent);

      expect(mockHandleCancel).toHaveBeenCalledTimes(1);
    });

    it('should not call handleCancel when ESC is pressed but modal is closed', () => {
      store.dispatch(setShowConfirmCard(false));

      renderHook(() => useConfirmModal({ handleCancel: mockHandleCancel }), { wrapper });

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(escapeEvent);

      expect(mockHandleCancel).not.toHaveBeenCalled();
    });

    it('should not call handleCancel when other keys are pressed', () => {
      store.dispatch(setShowConfirmCard(true));

      renderHook(() => useConfirmModal({ handleCancel: mockHandleCancel }), { wrapper });

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      window.dispatchEvent(enterEvent);

      expect(mockHandleCancel).not.toHaveBeenCalled();
    });

    it('should add and remove event listener correctly', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      store.dispatch(setShowConfirmCard(true));

      const { unmount } = renderHook(() => useConfirmModal({ handleCancel: mockHandleCancel }), {
        wrapper,
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('should not add event listener when modal is closed', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      store.dispatch(setShowConfirmCard(false));

      renderHook(() => useConfirmModal({ handleCancel: mockHandleCancel }), { wrapper });

      expect(addEventListenerSpy).not.toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
    });

    it('should re-attach listener when showConfirmCard changes from false to true', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      store.dispatch(setShowConfirmCard(false));

      const { rerender } = renderHook(() => useConfirmModal({ handleCancel: mockHandleCancel }), {
        wrapper,
      });

      expect(addEventListenerSpy).not.toHaveBeenCalled();

      // Change to true
      act(() => {
        store.dispatch(setShowConfirmCard(true));
      });
      rerender();

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should update listener when handleCancel changes', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      store.dispatch(setShowConfirmCard(true));

      const { rerender } = renderHook(
        ({ handleCancel }) => useConfirmModal({ handleCancel }),
        {
          wrapper,
          initialProps: { handleCancel: mockHandleCancel },
        }
      );

      const initialCallCount = addEventListenerSpy.mock.calls.length;

      const newHandleCancel = vi.fn();
      rerender({ handleCancel: newHandleCancel });

      // Should remove old listener and add new one
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(addEventListenerSpy.mock.calls.length).toBeGreaterThan(initialCallCount);

      // Verify new handler is used
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(escapeEvent);

      expect(newHandleCancel).toHaveBeenCalled();
      expect(mockHandleCancel).not.toHaveBeenCalled();

      removeEventListenerSpy.mockRestore();
      addEventListenerSpy.mockRestore();
    });
  });

  describe('integration with state changes', () => {
    it('should reflect Redux state changes', () => {
      // Initial state
      const { result: result1 } = renderHook(
        () => useConfirmModal({ handleCancel: mockHandleCancel }),
        { wrapper }
      );

      expect(result1.current.showConfirmCard).toBe(false);
      expect(result1.current.menuRequestAddress).toBe(null);

      // Update state and render a new hook instance
      act(() => {
        store.dispatch(setShowConfirmCard(true));
        store.dispatch(
          setSelectedMenu({ menu: '김치찌개', historyId: 1, requestAddress: '서울시 중구' })
        );
      });

      const { result: result2 } = renderHook(
        () => useConfirmModal({ handleCancel: mockHandleCancel }),
        { wrapper }
      );

      expect(result2.current.showConfirmCard).toBe(true);
      expect(result2.current.menuRequestAddress).toBe('서울시 중구');
    });

    it('should handle clearing menuRequestAddress', () => {
      act(() => {
        store.dispatch(
          setSelectedMenu({ menu: '김치찌개', historyId: 1, requestAddress: '서울시 중구' })
        );
      });

      const { result, rerender } = renderHook(
        () => useConfirmModal({ handleCancel: mockHandleCancel }),
        { wrapper }
      );

      expect(result.current.menuRequestAddress).toBe('서울시 중구');

      // Clear requestAddress
      act(() => {
        store.dispatch(setSelectedMenu({ menu: '불고기', historyId: 2, requestAddress: null }));
      });
      rerender();

      expect(result.current.menuRequestAddress).toBe(null);
    });
  });

  describe('edge cases', () => {
    it('should handle rapid ESC key presses', () => {
      store.dispatch(setShowConfirmCard(true));

      renderHook(() => useConfirmModal({ handleCancel: mockHandleCancel }), { wrapper });

      // Simulate rapid key presses
      const escapeEvent1 = new KeyboardEvent('keydown', { key: 'Escape' });
      const escapeEvent2 = new KeyboardEvent('keydown', { key: 'Escape' });
      const escapeEvent3 = new KeyboardEvent('keydown', { key: 'Escape' });

      window.dispatchEvent(escapeEvent1);
      window.dispatchEvent(escapeEvent2);
      window.dispatchEvent(escapeEvent3);

      expect(mockHandleCancel).toHaveBeenCalledTimes(3);
    });

    it('should handle case-sensitive key check', () => {
      store.dispatch(setShowConfirmCard(true));

      renderHook(() => useConfirmModal({ handleCancel: mockHandleCancel }), { wrapper });

      // Try lowercase 'escape' - should not work
      const escapeEventLower = new KeyboardEvent('keydown', { key: 'escape' });
      window.dispatchEvent(escapeEventLower);

      expect(mockHandleCancel).not.toHaveBeenCalled();

      // Try correct 'Escape' - should work
      const escapeEventCorrect = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(escapeEventCorrect);

      expect(mockHandleCancel).toHaveBeenCalledTimes(1);
    });

    it('should not interfere with other keyboard event listeners', () => {
      const otherKeyHandler = vi.fn();
      window.addEventListener('keydown', otherKeyHandler);

      store.dispatch(setShowConfirmCard(true));

      renderHook(() => useConfirmModal({ handleCancel: mockHandleCancel }), { wrapper });

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(escapeEvent);

      expect(mockHandleCancel).toHaveBeenCalledTimes(1);
      expect(otherKeyHandler).toHaveBeenCalledTimes(1);

      window.removeEventListener('keydown', otherKeyHandler);
    });

    it('should cleanup properly on unmount even if showConfirmCard changes during lifecycle', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      store.dispatch(setShowConfirmCard(true));

      const { unmount, rerender } = renderHook(
        () => useConfirmModal({ handleCancel: mockHandleCancel }),
        { wrapper }
      );

      // Change state during lifecycle
      act(() => {
        store.dispatch(setShowConfirmCard(false));
      });
      rerender();

      act(() => {
        store.dispatch(setShowConfirmCard(true));
      });
      rerender();

      unmount();

      // Should have removed listener
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('memory leaks prevention', () => {
    it('should not leak event listeners after multiple mounts/unmounts', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      store.dispatch(setShowConfirmCard(true));

      // Mount and unmount multiple times
      for (let i = 0; i < 5; i++) {
        const { unmount } = renderHook(() => useConfirmModal({ handleCancel: mockHandleCancel }), {
          wrapper,
        });
        unmount();
      }

      // Each mount should add a listener and each unmount should remove it
      expect(addEventListenerSpy).toHaveBeenCalledTimes(5);
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(5);

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });
});
