/**
 * CalendarHeader Component
 *
 * Month/year navigation header for calendar date picker.
 * Features:
 * - Displays current month and year in English
 * - Previous/next month navigation buttons
 * - Disabled state handling for min/max dates
 * - Orange accent color theme
 *
 * @example
 * <CalendarHeader
 *   currentMonth={0}
 *   currentYear={2026}
 *   onPrevMonth={() => {}}
 *   onNextMonth={() => {}}
 *   isPrevDisabled={false}
 *   isNextDisabled={false}
 * />
 */

import type { CalendarHeaderProps } from './types';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function CalendarHeader({
  currentMonth,
  currentYear,
  onPrevMonth,
  onNextMonth,
  isPrevDisabled,
  isNextDisabled,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
      {/* Previous month button */}
      <button
        type="button"
        onClick={onPrevMonth}
        disabled={isPrevDisabled}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-white/5 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
        aria-label="Previous month"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Month and year display */}
      <h3 className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-lg font-bold text-transparent">
        {MONTH_NAMES[currentMonth]} {currentYear}
      </h3>

      {/* Next month button */}
      <button
        type="button"
        onClick={onNextMonth}
        disabled={isNextDisabled}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-white/5 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
        aria-label="Next month"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
