import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDateFilter } from '@/hooks/common/useDateFilter';

describe('useDateFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Date to ensure consistent "today" value
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with null selectedDate', () => {
    const { result } = renderHook(() => useDateFilter());

    expect(result.current.selectedDate).toBeNull();
    expect(result.current.isToday).toBe(false);
    expect(result.current.startDate).toBe('');
    expect(result.current.endDate).toBe('');
    expect(result.current.quickSelectActive).toBeNull();
  });

  describe('handleDateChange', () => {
    it('should update selectedDate', () => {
      const { result } = renderHook(() => useDateFilter());

      act(() => {
        result.current.handleDateChange('2024-03-10');
      });

      expect(result.current.selectedDate).toBe('2024-03-10');
      expect(result.current.startDate).toBe('2024-03-10');
      expect(result.current.endDate).toBe('2024-03-10');
      expect(result.current.isToday).toBe(false);
    });

    it('should call onDateChange callback before state update', () => {
      const onDateChange = vi.fn();
      const { result } = renderHook(() => useDateFilter({ onDateChange }));

      act(() => {
        result.current.handleDateChange('2024-03-10');
      });

      expect(onDateChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleSelectToday', () => {
    it('should set selectedDate to today', () => {
      const { result } = renderHook(() => useDateFilter());

      act(() => {
        result.current.handleSelectToday();
      });

      expect(result.current.selectedDate).toBe('2024-03-15');
      expect(result.current.isToday).toBe(true);
      expect(result.current.quickSelectActive).toBe('today');
    });

    it('should call onDateChange callback before state update', () => {
      const onDateChange = vi.fn();
      const { result } = renderHook(() => useDateFilter({ onDateChange }));

      act(() => {
        result.current.handleSelectToday();
      });

      expect(onDateChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleClearDate', () => {
    it('should clear selectedDate', () => {
      const { result } = renderHook(() => useDateFilter());

      // First set a date
      act(() => {
        result.current.handleDateChange('2024-03-10');
      });

      expect(result.current.selectedDate).toBe('2024-03-10');

      // Then clear it
      act(() => {
        result.current.handleClearDate();
      });

      expect(result.current.selectedDate).toBeNull();
      expect(result.current.isToday).toBe(false);
      expect(result.current.startDate).toBe('');
      expect(result.current.endDate).toBe('');
    });

    it('should call onDateChange callback before state update', () => {
      const onDateChange = vi.fn();
      const { result } = renderHook(() => useDateFilter({ onDateChange }));

      act(() => {
        result.current.handleClearDate();
      });

      expect(onDateChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('isToday computation', () => {
    it('should return true when selectedDate is today', () => {
      const { result } = renderHook(() => useDateFilter());

      act(() => {
        result.current.handleSelectToday();
      });

      expect(result.current.isToday).toBe(true);
    });

    it('should return false when selectedDate is not today', () => {
      const { result } = renderHook(() => useDateFilter());

      act(() => {
        result.current.handleDateChange('2024-03-10');
      });

      expect(result.current.isToday).toBe(false);
    });

    it('should return false when selectedDate is null', () => {
      const { result } = renderHook(() => useDateFilter());

      expect(result.current.isToday).toBe(false);
    });
  });

  describe('backward compatibility - handleQuickSelect', () => {
    it('should call handleSelectToday when type is "today"', () => {
      const { result } = renderHook(() => useDateFilter());

      act(() => {
        result.current.handleQuickSelect('today');
      });

      expect(result.current.selectedDate).toBe('2024-03-15');
      expect(result.current.isToday).toBe(true);
    });

    it('should call handleClearDate when type is "all"', () => {
      const { result } = renderHook(() => useDateFilter());

      // Set a date first
      act(() => {
        result.current.handleDateChange('2024-03-10');
      });

      act(() => {
        result.current.handleQuickSelect('all');
      });

      expect(result.current.selectedDate).toBeNull();
    });

    it('should clear date for deprecated "week" type', () => {
      const { result } = renderHook(() => useDateFilter());

      act(() => {
        result.current.handleDateChange('2024-03-10');
      });

      act(() => {
        result.current.handleQuickSelect('week');
      });

      expect(result.current.selectedDate).toBeNull();
    });

    it('should clear date for deprecated "month" type', () => {
      const { result } = renderHook(() => useDateFilter());

      act(() => {
        result.current.handleDateChange('2024-03-10');
      });

      act(() => {
        result.current.handleQuickSelect('month');
      });

      expect(result.current.selectedDate).toBeNull();
    });
  });

  describe('backward compatibility properties', () => {
    it('should sync startDate and endDate with selectedDate', () => {
      const { result } = renderHook(() => useDateFilter());

      act(() => {
        result.current.handleDateChange('2024-03-10');
      });

      expect(result.current.startDate).toBe('2024-03-10');
      expect(result.current.endDate).toBe('2024-03-10');
    });

    it('should set quickSelectActive to "today" when isToday is true', () => {
      const { result } = renderHook(() => useDateFilter());

      act(() => {
        result.current.handleSelectToday();
      });

      expect(result.current.quickSelectActive).toBe('today');
    });

    it('should set quickSelectActive to null when isToday is false', () => {
      const { result } = renderHook(() => useDateFilter());

      act(() => {
        result.current.handleDateChange('2024-03-10');
      });

      expect(result.current.quickSelectActive).toBeNull();
    });
  });

  describe('onDateChange callback ref update', () => {
    it('should update callback ref when options change', () => {
      const firstCallback = vi.fn();
      const secondCallback = vi.fn();

      const { result, rerender } = renderHook(
        ({ callback }) => useDateFilter({ onDateChange: callback }),
        { initialProps: { callback: firstCallback } }
      );

      act(() => {
        result.current.handleDateChange('2024-03-10');
      });

      expect(firstCallback).toHaveBeenCalledTimes(1);
      expect(secondCallback).not.toHaveBeenCalled();

      // Update callback
      rerender({ callback: secondCallback });

      act(() => {
        result.current.handleDateChange('2024-03-11');
      });

      expect(firstCallback).toHaveBeenCalledTimes(1);
      expect(secondCallback).toHaveBeenCalledTimes(1);
    });
  });
});
