/**
 * useDateFilter 테스트
 * 날짜 필터 상태 관리, 오늘 선택, 날짜 변경, 초기화, 콜백 동작 검증
 */

import { renderHook, act } from '@testing-library/react';
import { useDateFilter } from '@shared/hooks/useDateFilter';

/** 오늘 날짜를 YYYY-MM-DD 형식으로 반환 */
const getTodayString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

describe('useDateFilter', () => {
  it('초기 상태 — selectedDate null, isToday false', () => {
    const { result } = renderHook(() => useDateFilter());

    expect(result.current.selectedDate).toBeNull();
    expect(result.current.isToday).toBe(false);
  });

  it('handleSelectToday — 오늘 날짜 선택 시 isToday true', () => {
    const { result } = renderHook(() => useDateFilter());

    act(() => {
      result.current.handleSelectToday();
    });

    expect(result.current.selectedDate).toBe(getTodayString());
    expect(result.current.isToday).toBe(true);
  });

  it('handleDateChange — 특정 날짜 선택', () => {
    const { result } = renderHook(() => useDateFilter());

    act(() => {
      result.current.handleDateChange('2024-06-15');
    });

    expect(result.current.selectedDate).toBe('2024-06-15');
    expect(result.current.isToday).toBe(false);
  });

  it('handleClearDate — 날짜 초기화', () => {
    const { result } = renderHook(() => useDateFilter());

    act(() => {
      result.current.handleSelectToday();
    });
    expect(result.current.selectedDate).not.toBeNull();

    act(() => {
      result.current.handleClearDate();
    });

    expect(result.current.selectedDate).toBeNull();
    expect(result.current.isToday).toBe(false);
  });

  it('onDateChange 콜백 — 날짜 변경 전 호출', () => {
    const onDateChange = vi.fn();
    const { result } = renderHook(() => useDateFilter({ onDateChange }));

    act(() => {
      result.current.handleSelectToday();
    });

    expect(onDateChange).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.handleDateChange('2024-03-01');
    });

    expect(onDateChange).toHaveBeenCalledTimes(2);

    act(() => {
      result.current.handleClearDate();
    });

    expect(onDateChange).toHaveBeenCalledTimes(3);
  });

  describe('하위 호환 속성', () => {
    it('startDate/endDate — selectedDate와 동기화', () => {
      const { result } = renderHook(() => useDateFilter());

      expect(result.current.startDate).toBe('');
      expect(result.current.endDate).toBe('');

      act(() => {
        result.current.handleDateChange('2024-06-15');
      });

      expect(result.current.startDate).toBe('2024-06-15');
      expect(result.current.endDate).toBe('2024-06-15');
    });

    it('handleQuickSelect("today") — handleSelectToday 위임', () => {
      const { result } = renderHook(() => useDateFilter());

      act(() => {
        result.current.handleQuickSelect('today');
      });

      expect(result.current.selectedDate).toBe(getTodayString());
      expect(result.current.quickSelectActive).toBe('today');
    });

    it('handleQuickSelect("all") — handleClearDate 위임', () => {
      const { result } = renderHook(() => useDateFilter());

      act(() => {
        result.current.handleSelectToday();
      });
      expect(result.current.selectedDate).not.toBeNull();

      act(() => {
        result.current.handleQuickSelect('all');
      });

      expect(result.current.selectedDate).toBeNull();
      expect(result.current.quickSelectActive).toBeNull();
    });

    it('handleQuickSelect("week"/"month") — clear로 처리', () => {
      const { result } = renderHook(() => useDateFilter());

      act(() => {
        result.current.handleSelectToday();
      });

      act(() => {
        result.current.handleQuickSelect('week');
      });

      expect(result.current.selectedDate).toBeNull();
    });
  });
});
