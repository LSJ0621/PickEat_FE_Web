/**
 * useDateFilter - Single date filter state and handlers management hook
 *
 * Manages simple date filtering with:
 * 1. Quick "Today" selection
 * 2. Manual date selection via calendar
 * 3. Clear filter option
 *
 * Filter logic for consumers:
 * - If selectedDate is set → filter by that single date
 * - If null → show all (no filter)
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface UseDateFilterOptions {
  /**
   * Callback function to execute when dates change (before state updates)
   * Useful for resetting pagination or clearing data
   */
  onDateChange?: () => void;
}

export interface UseDateFilterReturn {
  selectedDate: string | null;
  isToday: boolean;
  handleDateChange: (value: string) => void;
  handleClearDate: () => void;
  handleSelectToday: () => void;
  // Deprecated properties for backward compatibility
  /** @deprecated Use selectedDate instead */
  startDate: string;
  /** @deprecated Use selectedDate instead */
  endDate: string;
  /** @deprecated Use handleSelectToday instead */
  handleQuickSelect: (type: 'today' | 'week' | 'month' | 'all') => void;
  /** @deprecated No longer used */
  quickSelectActive: 'today' | null;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
const getTodayString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useDateFilter = (options?: UseDateFilterOptions): UseDateFilterReturn => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Store callback in ref to avoid stale closures
  const onDateChangeRef = useRef(options?.onDateChange);

  useEffect(() => {
    onDateChangeRef.current = options?.onDateChange;
  }, [options?.onDateChange]);

  // Check if selected date is today
  const isToday = useMemo(() => {
    if (!selectedDate) return false;
    return selectedDate === getTodayString();
  }, [selectedDate]);

  const handleDateChange = useCallback(
    (value: string) => {
      // Execute callback before state update
      onDateChangeRef.current?.();
      setSelectedDate(value);
    },
    []
  );

  const handleClearDate = useCallback(() => {
    // Execute callback before state update
    onDateChangeRef.current?.();
    setSelectedDate(null);
  }, []);

  const handleSelectToday = useCallback(() => {
    // Execute callback before state update
    onDateChangeRef.current?.();
    setSelectedDate(getTodayString());
  }, []);

  // Backward compatibility wrapper
  const handleQuickSelect = useCallback(
    (type: 'today' | 'week' | 'month' | 'all') => {
      if (type === 'today') {
        handleSelectToday();
      } else if (type === 'all') {
        handleClearDate();
      }
      // 'week' and 'month' are deprecated and treated as clear
      else {
        handleClearDate();
      }
    },
    [handleSelectToday, handleClearDate]
  );

  return {
    selectedDate,
    isToday,
    handleDateChange,
    handleClearDate,
    handleSelectToday,
    // Backward compatibility
    startDate: selectedDate || '',
    endDate: selectedDate || '',
    handleQuickSelect,
    quickSelectActive: isToday ? 'today' : null,
  };
};
