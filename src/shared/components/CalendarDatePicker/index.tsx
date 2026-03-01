/**
 * CalendarDatePicker Component
 *
 * Traditional calendar date picker with month/year navigation.
 * Features:
 * - Bottom sheet modal similar to ScrollDatePicker
 * - English month names and weekday headers
 * - Month navigation with previous/next buttons
 * - Highlight today's date with orange border
 * - Selected date with orange gradient background
 * - White/orange theme (bg-bg-surface background, orange-500 accent)
 * - Min/max date range support
 * - Keyboard navigation (Escape to close)
 * - Responsive design
 *
 * @example
 * <CalendarDatePicker
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   selectedDate={new Date()}
 *   onDateSelect={(date) => console.log('Selected:', date)}
 *   minDate={new Date('2020-01-01')}
 *   maxDate={new Date()}
 * />
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useModalAnimation } from '@shared/hooks/useModalAnimation';
import { useModalScrollLock } from '@shared/hooks/useModalScrollLock';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import type { CalendarDatePickerProps } from './types';

export function CalendarDatePicker({
  isOpen,
  onClose,
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
}: CalendarDatePickerProps) {
  const { isAnimating, shouldRender, isClosing } = useModalAnimation(isOpen);
  useModalScrollLock(isOpen);

  // Track current viewing month/year (can be different from selected date)
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());

  // Track temporary selected date (confirmed on date click)
  const [tempSelectedDate, setTempSelectedDate] = useState(selectedDate);

  // Reset view to selected date when modal opens
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setViewMonth(selectedDate.getMonth());
      setViewYear(selectedDate.getFullYear());
      setTempSelectedDate(selectedDate);
    }
  }, [isOpen, selectedDate]);

  // Handle keyboard navigation - Escape to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Navigate to previous month
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  // Navigate to next month
  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Check if previous month button should be disabled
  const isPrevDisabled = minDate
    ? new Date(viewYear, viewMonth, 0) < new Date(minDate.getFullYear(), minDate.getMonth(), 1)
    : false;

  // Check if next month button should be disabled
  const isNextDisabled = maxDate
    ? new Date(viewYear, viewMonth + 1, 1) > new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0)
    : false;

  // Handle date selection
  const handleDateClick = (date: Date) => {
    setTempSelectedDate(date);
    onDateSelect(date);
    onClose();
  };

  // Handle "Today" button
  const handleToday = () => {
    const today = new Date();
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
    setTempSelectedDate(today);
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!shouldRender) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm ${
        isAnimating ? 'modal-backdrop-enter' : isClosing ? 'modal-backdrop-exit' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Bottom sheet content */}
      <div
        className={`w-full max-w-lg rounded-t-[28px] border-t border-border-default bg-bg-surface pb-safe shadow-2xl ${
          isAnimating
            ? 'animate-slide-up-enter opacity-100'
            : isClosing
            ? 'animate-slide-down-exit opacity-0'
            : 'opacity-0'
        }`}
        style={{
          animation: isAnimating
            ? 'slideUpFromBottom 0.3s ease-out forwards'
            : isClosing
            ? 'slideDownToBottom 0.3s ease-in forwards'
            : undefined,
        }}
      >
        {/* Close button */}
        <div className="flex items-center justify-between px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[60px] text-sm font-medium text-text-tertiary transition-all hover:scale-105 hover:text-text-secondary active:scale-95"
          >
            Close
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={handleToday}
            className="min-h-[44px] min-w-[60px] text-sm font-semibold text-brand-primary transition-all hover:scale-105 hover:text-brand-secondary active:scale-95"
          >
            Today
          </button>
        </div>

        {/* Calendar header with month/year navigation */}
        <CalendarHeader
          currentMonth={viewMonth}
          currentYear={viewYear}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          isPrevDisabled={isPrevDisabled}
          isNextDisabled={isNextDisabled}
        />

        {/* Calendar grid */}
        <CalendarGrid
          currentMonth={viewMonth}
          currentYear={viewYear}
          selectedDate={tempSelectedDate}
          onDateClick={handleDateClick}
          minDate={minDate}
          maxDate={maxDate}
        />
      </div>
    </div>,
    document.body
  );
}
