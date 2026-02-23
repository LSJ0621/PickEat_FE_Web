import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSwipeGesture } from '@/hooks/onboarding/useSwipeGesture';

describe('useSwipeGesture', () => {
  const mockOnSwipeLeft = vi.fn();
  const mockOnSwipeRight = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useSwipeGesture({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
      })
    );

    expect(result.current.swipeOffset).toBe(0);
    expect(result.current.isTransitioning).toBe(false);
    expect(result.current.handlers).toBeDefined();
  });

  describe('touch handlers', () => {
    it('should handle touch start', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft: mockOnSwipeLeft,
          onSwipeRight: mockOnSwipeRight,
        })
      );

      const touchEvent = {
        touches: [{ clientX: 100 }],
      } as React.TouchEvent;

      act(() => {
        result.current.handlers.onTouchStart(touchEvent);
      });

      expect(result.current.swipeOffset).toBe(0);
    });

    it('should handle touch move and update swipeOffset', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft: mockOnSwipeLeft,
          onSwipeRight: mockOnSwipeRight,
        })
      );

      const startEvent = {
        touches: [{ clientX: 100 }],
      } as React.TouchEvent;

      const moveEvent = {
        touches: [{ clientX: 150 }],
      } as React.TouchEvent;

      act(() => {
        result.current.handlers.onTouchStart(startEvent);
        result.current.handlers.onTouchMove(moveEvent);
      });

      expect(result.current.swipeOffset).toBe(50);
    });

    it('should trigger onSwipeRight when swiping right past threshold', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft: mockOnSwipeLeft,
          onSwipeRight: mockOnSwipeRight,
          threshold: 50,
        })
      );

      const startEvent = {
        touches: [{ clientX: 100 }],
      } as React.TouchEvent;

      const moveEvent = {
        touches: [{ clientX: 160 }],
      } as React.TouchEvent;

      act(() => {
        result.current.handlers.onTouchStart(startEvent);
      });

      act(() => {
        result.current.handlers.onTouchMove(moveEvent);
      });

      act(() => {
        result.current.handlers.onTouchEnd();
      });

      expect(mockOnSwipeRight).toHaveBeenCalled();
      expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    });

    it('should trigger onSwipeLeft when swiping left past threshold', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft: mockOnSwipeLeft,
          onSwipeRight: mockOnSwipeRight,
          threshold: 50,
        })
      );

      const startEvent = {
        touches: [{ clientX: 100 }],
      } as React.TouchEvent;

      const moveEvent = {
        touches: [{ clientX: 40 }],
      } as React.TouchEvent;

      act(() => {
        result.current.handlers.onTouchStart(startEvent);
      });

      act(() => {
        result.current.handlers.onTouchMove(moveEvent);
      });

      act(() => {
        result.current.handlers.onTouchEnd();
      });

      expect(mockOnSwipeLeft).toHaveBeenCalled();
      expect(mockOnSwipeRight).not.toHaveBeenCalled();
    });

    it('should not trigger swipe callbacks when below threshold', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft: mockOnSwipeLeft,
          onSwipeRight: mockOnSwipeRight,
          threshold: 50,
        })
      );

      const startEvent = {
        touches: [{ clientX: 100 }],
      } as React.TouchEvent;

      const moveEvent = {
        touches: [{ clientX: 130 }],
      } as React.TouchEvent;

      act(() => {
        result.current.handlers.onTouchStart(startEvent);
        result.current.handlers.onTouchMove(moveEvent);
        result.current.handlers.onTouchEnd();
      });

      expect(mockOnSwipeLeft).not.toHaveBeenCalled();
      expect(mockOnSwipeRight).not.toHaveBeenCalled();
    });
  });

  describe('mouse handlers', () => {
    it('should handle mouse down and prevent default', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft: mockOnSwipeLeft,
          onSwipeRight: mockOnSwipeRight,
        })
      );

      const mouseEvent = {
        clientX: 100,
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.handlers.onMouseDown(mouseEvent);
      });

      expect(mouseEvent.preventDefault).toHaveBeenCalled();
      expect(result.current.swipeOffset).toBe(0);
    });

    it('should handle mouse move and update swipeOffset', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft: mockOnSwipeLeft,
          onSwipeRight: mockOnSwipeRight,
        })
      );

      const downEvent = {
        clientX: 100,
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent;

      const moveEvent = {
        clientX: 150,
      } as React.MouseEvent;

      act(() => {
        result.current.handlers.onMouseDown(downEvent);
        result.current.handlers.onMouseMove(moveEvent);
      });

      expect(result.current.swipeOffset).toBe(50);
    });

    it('should trigger onSwipeRight on mouse up after swiping right', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft: mockOnSwipeLeft,
          onSwipeRight: mockOnSwipeRight,
          threshold: 50,
        })
      );

      const downEvent = {
        clientX: 100,
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent;

      const moveEvent = {
        clientX: 160,
      } as React.MouseEvent;

      act(() => {
        result.current.handlers.onMouseDown(downEvent);
      });

      act(() => {
        result.current.handlers.onMouseMove(moveEvent);
      });

      act(() => {
        result.current.handlers.onMouseUp();
      });

      expect(mockOnSwipeRight).toHaveBeenCalled();
    });

    it('should trigger onSwipeLeft on mouse leave after swiping left', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft: mockOnSwipeLeft,
          onSwipeRight: mockOnSwipeRight,
          threshold: 50,
        })
      );

      const downEvent = {
        clientX: 100,
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent;

      const moveEvent = {
        clientX: 40,
      } as React.MouseEvent;

      act(() => {
        result.current.handlers.onMouseDown(downEvent);
      });

      act(() => {
        result.current.handlers.onMouseMove(moveEvent);
      });

      act(() => {
        result.current.handlers.onMouseLeave();
      });

      expect(mockOnSwipeLeft).toHaveBeenCalled();
    });
  });

  describe('resistance factor', () => {
    it('should apply resistance when dragging beyond threshold', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft: mockOnSwipeLeft,
          onSwipeRight: mockOnSwipeRight,
          threshold: 50,
          resistanceFactor: 0.3,
        })
      );

      const startEvent = {
        touches: [{ clientX: 100 }],
      } as React.TouchEvent;

      // Drag 100px (50px threshold + 50px over)
      const moveEvent = {
        touches: [{ clientX: 200 }],
      } as React.TouchEvent;

      act(() => {
        result.current.handlers.onTouchStart(startEvent);
        result.current.handlers.onTouchMove(moveEvent);
      });

      // Expected: 50 (threshold) + 50 * 0.3 (resistance) = 65
      expect(result.current.swipeOffset).toBe(65);
    });

    it('should not apply resistance when within threshold', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft: mockOnSwipeLeft,
          onSwipeRight: mockOnSwipeRight,
          threshold: 50,
          resistanceFactor: 0.3,
        })
      );

      const startEvent = {
        touches: [{ clientX: 100 }],
      } as React.TouchEvent;

      const moveEvent = {
        touches: [{ clientX: 130 }],
      } as React.TouchEvent;

      act(() => {
        result.current.handlers.onTouchStart(startEvent);
        result.current.handlers.onTouchMove(moveEvent);
      });

      expect(result.current.swipeOffset).toBe(30);
    });
  });

  describe('transition state', () => {
    it('should set isTransitioning to true during swipe animation', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft: mockOnSwipeLeft,
          onSwipeRight: mockOnSwipeRight,
          threshold: 50,
        })
      );

      const startEvent = {
        touches: [{ clientX: 100 }],
      } as React.TouchEvent;

      const moveEvent = {
        touches: [{ clientX: 160 }],
      } as React.TouchEvent;

      act(() => {
        result.current.handlers.onTouchStart(startEvent);
      });

      act(() => {
        result.current.handlers.onTouchMove(moveEvent);
      });

      act(() => {
        result.current.handlers.onTouchEnd();
      });

      expect(result.current.isTransitioning).toBe(true);
    });

    it('should reset isTransitioning after 300ms', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft: mockOnSwipeLeft,
          onSwipeRight: mockOnSwipeRight,
          threshold: 50,
        })
      );

      const startEvent = {
        touches: [{ clientX: 100 }],
      } as React.TouchEvent;

      const moveEvent = {
        touches: [{ clientX: 160 }],
      } as React.TouchEvent;

      act(() => {
        result.current.handlers.onTouchStart(startEvent);
      });

      act(() => {
        result.current.handlers.onTouchMove(moveEvent);
      });

      act(() => {
        result.current.handlers.onTouchEnd();
      });

      expect(result.current.isTransitioning).toBe(true);

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.isTransitioning).toBe(false);
    });

    it('should ignore gestures during transition', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft: mockOnSwipeLeft,
          onSwipeRight: mockOnSwipeRight,
          threshold: 50,
        })
      );

      const startEvent = {
        touches: [{ clientX: 100 }],
      } as React.TouchEvent;

      const moveEvent = {
        touches: [{ clientX: 160 }],
      } as React.TouchEvent;

      // First swipe
      act(() => {
        result.current.handlers.onTouchStart(startEvent);
      });

      act(() => {
        result.current.handlers.onTouchMove(moveEvent);
      });

      act(() => {
        result.current.handlers.onTouchEnd();
      });

      expect(result.current.isTransitioning).toBe(true);

      // Try to start another swipe during transition
      const newStartEvent = {
        touches: [{ clientX: 100 }],
      } as React.TouchEvent;

      const newMoveEvent = {
        touches: [{ clientX: 150 }],
      } as React.TouchEvent;

      act(() => {
        result.current.handlers.onTouchStart(newStartEvent);
      });

      act(() => {
        result.current.handlers.onTouchMove(newMoveEvent);
      });

      // Swipe offset should remain 0 during transition
      expect(result.current.swipeOffset).toBe(0);
    });
  });

  describe('swipeOffset reset', () => {
    it('should reset swipeOffset to 0 after successful swipe', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft: mockOnSwipeLeft,
          onSwipeRight: mockOnSwipeRight,
          threshold: 50,
        })
      );

      const startEvent = {
        touches: [{ clientX: 100 }],
      } as React.TouchEvent;

      const moveEvent = {
        touches: [{ clientX: 160 }],
      } as React.TouchEvent;

      act(() => {
        result.current.handlers.onTouchStart(startEvent);
        result.current.handlers.onTouchMove(moveEvent);
      });

      // Expected: 50 (threshold) + 10 * 0.3 (resistance) = 53
      expect(result.current.swipeOffset).toBe(53);

      act(() => {
        result.current.handlers.onTouchEnd();
      });

      expect(result.current.swipeOffset).toBe(0);
    });

    it('should reset swipeOffset to 0 when gesture does not meet threshold', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft: mockOnSwipeLeft,
          onSwipeRight: mockOnSwipeRight,
          threshold: 50,
        })
      );

      const startEvent = {
        touches: [{ clientX: 100 }],
      } as React.TouchEvent;

      const moveEvent = {
        touches: [{ clientX: 130 }],
      } as React.TouchEvent;

      act(() => {
        result.current.handlers.onTouchStart(startEvent);
        result.current.handlers.onTouchMove(moveEvent);
      });

      expect(result.current.swipeOffset).toBe(30);

      act(() => {
        result.current.handlers.onTouchEnd();
      });

      expect(result.current.swipeOffset).toBe(0);
    });
  });

  describe('custom threshold', () => {
    it('should use custom threshold value', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft: mockOnSwipeLeft,
          onSwipeRight: mockOnSwipeRight,
          threshold: 100,
        })
      );

      const startEvent = {
        touches: [{ clientX: 100 }],
      } as React.TouchEvent;

      const moveEvent = {
        touches: [{ clientX: 170 }],
      } as React.TouchEvent;

      act(() => {
        result.current.handlers.onTouchStart(startEvent);
      });

      act(() => {
        result.current.handlers.onTouchMove(moveEvent);
      });

      act(() => {
        result.current.handlers.onTouchEnd();
      });

      // 70px is below 100px threshold
      expect(mockOnSwipeRight).not.toHaveBeenCalled();
      expect(mockOnSwipeLeft).not.toHaveBeenCalled();

      const moveEvent2 = {
        touches: [{ clientX: 210 }],
      } as React.TouchEvent;

      // Wait for transition to complete
      act(() => {
        vi.advanceTimersByTime(300);
      });

      act(() => {
        result.current.handlers.onTouchStart(startEvent);
      });

      act(() => {
        result.current.handlers.onTouchMove(moveEvent2);
      });

      act(() => {
        result.current.handlers.onTouchEnd();
      });

      // 110px exceeds 100px threshold
      expect(mockOnSwipeRight).toHaveBeenCalled();
    });
  });
});
