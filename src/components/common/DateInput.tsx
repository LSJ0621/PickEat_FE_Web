/**
 * DateInput Component
 *
 * A date input component that opens a CalendarDatePicker modal for date selection.
 * Displays selected date in YYYY/MM/DD format (e.g., 2026/01/19) or placeholder.
 *
 * @example
 * <DateInput
 *   value="2026-01-17"
 *   onChange={(dateStr) => console.log(dateStr)} // "2026-01-17"
 *   placeholder="날짜 선택"
 * />
 */

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { CalendarDatePicker } from '@/components/common/CalendarDatePicker';

export interface DateInputProps {
  /** Current selected date in YYYY-MM-DD format */
  value?: string;
  /** Change handler - receives YYYY-MM-DD formatted string */
  onChange: (value: string) => void;
  /** Custom placeholder text */
  placeholder?: string;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes for the button */
  className?: string;
}

/**
 * Format date to YYYY/MM/DD display format
 * Example: 2026/01/19
 */
function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const formattedMonth = String(month).padStart(2, '0');
  const formattedDay = String(day).padStart(2, '0');
  return `${year}/${formattedMonth}/${formattedDay}`;
}

/**
 * Convert YYYY-MM-DD string to Date object
 * Uses explicit date parts to avoid timezone issues
 */
function stringToDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day); // Month is 0-indexed
}

/**
 * Convert Date object to YYYY-MM-DD string
 */
function dateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DateInput({
  value,
  onChange,
  placeholder = '날짜 선택',
  minDate,
  maxDate,
  disabled = false,
  className = '',
}: DateInputProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleOpenPicker = () => {
    if (!disabled) {
      setIsPickerOpen(true);
    }
  };

  const handleSelectDate = (date: Date) => {
    const dateStr = dateToString(date);
    onChange(dateStr);
    setIsPickerOpen(false);
  };

  const displayText = value ? formatDate(value) : placeholder;
  const selectedDate = value ? stringToDate(value) : new Date();

  return (
    <>
      <button
        type="button"
        onClick={handleOpenPicker}
        disabled={disabled}
        className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
          disabled
            ? 'cursor-not-allowed border-border-default bg-bg-secondary text-text-placeholder'
            : 'border-border-default bg-bg-surface text-text-primary hover:border-border-focus'
        } ${className}`}
      >
        <span className={value ? 'text-text-primary' : 'text-text-placeholder'}>{displayText}</span>
        <Calendar className={`ml-2 h-4 w-4 ${disabled ? 'text-text-placeholder' : 'text-text-tertiary'}`} />
      </button>

      <CalendarDatePicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        selectedDate={selectedDate}
        onDateSelect={handleSelectDate}
        minDate={minDate}
        maxDate={maxDate}
      />
    </>
  );
}
