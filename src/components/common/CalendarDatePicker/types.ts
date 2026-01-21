/**
 * CalendarDatePicker Type Definitions
 *
 * Types and interfaces for the traditional calendar date picker component.
 */

export interface CalendarDatePickerProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Currently selected date */
  selectedDate: Date;
  /** Callback when date is selected */
  onDateSelect: (date: Date) => void;
  /** Minimum selectable date (optional) */
  minDate?: Date;
  /** Maximum selectable date (optional) */
  maxDate?: Date;
}

export interface CalendarHeaderProps {
  /** Current month (0-11) */
  currentMonth: number;
  /** Current year */
  currentYear: number;
  /** Callback when previous month is clicked */
  onPrevMonth: () => void;
  /** Callback when next month is clicked */
  onNextMonth: () => void;
  /** Whether previous month button is disabled */
  isPrevDisabled: boolean;
  /** Whether next month button is disabled */
  isNextDisabled: boolean;
}

export interface CalendarGridProps {
  /** Current month (0-11) */
  currentMonth: number;
  /** Current year */
  currentYear: number;
  /** Selected date */
  selectedDate: Date;
  /** Callback when date is clicked */
  onDateClick: (date: Date) => void;
  /** Minimum selectable date (optional) */
  minDate?: Date;
  /** Maximum selectable date (optional) */
  maxDate?: Date;
}

export interface DayCell {
  /** Day number (1-31) */
  day: number;
  /** Whether day is in current month */
  isCurrentMonth: boolean;
  /** Whether day is today */
  isToday: boolean;
  /** Whether day is selected */
  isSelected: boolean;
  /** Whether day is disabled (out of min/max range) */
  isDisabled: boolean;
  /** Full Date object */
  date: Date;
}
