/**
 * CalendarGrid Component
 *
 * 7x6 calendar grid with date cells.
 * Features:
 * - English weekday headers (Sun-Sat)
 * - Previous/next month date cells in muted color
 * - Highlight today's date
 * - Selected date styling with orange accent
 * - Disabled dates (out of min/max range)
 * - Responsive grid layout
 *
 * @example
 * <CalendarGrid
 *   currentMonth={0}
 *   currentYear={2026}
 *   selectedDate={new Date()}
 *   onDateClick={(date) => console.log(date)}
 *   minDate={new Date('2020-01-01')}
 *   maxDate={new Date()}
 * />
 */

import { useMemo } from 'react';
import type { CalendarGridProps, DayCell } from './types';

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Get all day cells for the calendar grid (42 cells = 6 rows x 7 days)
 */
function getCalendarDays(
  year: number,
  month: number,
  selectedDate: Date,
  minDate?: Date,
  maxDate?: Date
): DayCell[] {
  const cells: DayCell[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // First day of current month
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

  // Last day of previous month
  const lastDayOfPrevMonth = new Date(year, month, 0).getDate();

  // Days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Normalize selected date for comparison
  const normalizedSelected = new Date(selectedDate);
  normalizedSelected.setHours(0, 0, 0, 0);

  // Normalize min/max dates
  const normalizedMin = minDate ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : undefined;
  const normalizedMax = maxDate ? new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()) : undefined;

  // Fill previous month days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = lastDayOfPrevMonth - i;
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);

    const isDisabled = (normalizedMin && date < normalizedMin) || (normalizedMax && date > normalizedMax) || false;

    cells.push({
      day,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      isDisabled,
      date,
    });
  }

  // Fill current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    const isToday = date.getTime() === today.getTime();
    const isSelected = date.getTime() === normalizedSelected.getTime();
    const isDisabled = (normalizedMin && date < normalizedMin) || (normalizedMax && date > normalizedMax) || false;

    cells.push({
      day,
      isCurrentMonth: true,
      isToday,
      isSelected,
      isDisabled,
      date,
    });
  }

  // Fill next month days to complete 42 cells (6 rows)
  const remainingCells = 42 - cells.length;
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(year, month + 1, day);
    date.setHours(0, 0, 0, 0);

    const isDisabled = (normalizedMin && date < normalizedMin) || (normalizedMax && date > normalizedMax) || false;

    cells.push({
      day,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      isDisabled,
      date,
    });
  }

  return cells;
}

export function CalendarGrid({
  currentMonth,
  currentYear,
  selectedDate,
  onDateClick,
  minDate,
  maxDate,
}: CalendarGridProps) {
  const dayCells = useMemo(
    () => getCalendarDays(currentYear, currentMonth, selectedDate, minDate, maxDate),
    [currentYear, currentMonth, selectedDate, minDate, maxDate]
  );

  return (
    <div className="px-4 pb-6 pt-4">
      {/* Weekday headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAY_NAMES.map((day) => (
          <div
            key={day}
            className="flex h-10 items-center justify-center text-xs font-semibold text-slate-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Date grid (6 rows x 7 columns) */}
      <div className="grid grid-cols-7 gap-1">
        {dayCells.map((cell, index) => {
          const baseClasses = 'flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-all';

          // Disabled state
          if (cell.isDisabled) {
            return (
              <button
                key={index}
                type="button"
                disabled
                aria-disabled="true"
                className={`${baseClasses} cursor-not-allowed text-slate-600 opacity-40`}
              >
                {cell.day}
              </button>
            );
          }

          // Selected state
          if (cell.isSelected) {
            return (
              <button
                key={index}
                type="button"
                onClick={() => onDateClick(cell.date)}
                className={`${baseClasses} bg-gradient-to-r from-orange-500 to-rose-500 font-bold text-white shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95`}
              >
                {cell.day}
              </button>
            );
          }

          // Today state (not selected)
          if (cell.isToday && cell.isCurrentMonth) {
            return (
              <button
                key={index}
                type="button"
                onClick={() => onDateClick(cell.date)}
                className={`${baseClasses} border-2 border-orange-500/50 text-orange-400 hover:scale-105 hover:border-orange-400 hover:bg-orange-500/10 active:scale-95`}
              >
                {cell.day}
              </button>
            );
          }

          // Current month days
          if (cell.isCurrentMonth) {
            return (
              <button
                key={index}
                type="button"
                onClick={() => onDateClick(cell.date)}
                className={`${baseClasses} text-white hover:scale-105 hover:bg-white/10 active:scale-95`}
              >
                {cell.day}
              </button>
            );
          }

          // Previous/next month days
          return (
            <button
              key={index}
              type="button"
              onClick={() => onDateClick(cell.date)}
              className={`${baseClasses} text-slate-500 hover:scale-105 hover:bg-white/5 hover:text-slate-400 active:scale-95`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
