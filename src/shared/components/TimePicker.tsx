/**
 * TimePicker Component
 *
 * iOS-style drum scroll time picker with 3 columns: AM/PM, Hour, Minute.
 * Uses CSS scroll-snap for smooth selection, matching the ScrollDatePicker pattern
 * but with compact sizing (28px item height).
 *
 * @example
 * <TimePickerInput
 *   value="09:00"
 *   onChange={(v) => console.log(v)} // "09:00" (24h format)
 * />
 */

import { memo, useCallback, useEffect, useRef } from 'react';

interface TimePickerInputProps {
  /** Time value in "HH:mm" 24h format */
  value: string;
  /** Change handler - receives "HH:mm" 24h formatted string */
  onChange: (value: string) => void;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
}

type Period = 'AM' | 'PM';

function parseTime(value: string): { hour12: number; minute: number; period: Period } {
  const parts = value.split(':');
  const h = Number(parts[0]);
  const m = Number(parts[1]);

  if (!value || parts.length < 2 || isNaN(h) || isNaN(m)) {
    return { hour12: 12, minute: 0, period: 'AM' };
  }

  if (h === 0) return { hour12: 12, minute: m, period: 'AM' };
  if (h === 12) return { hour12: 12, minute: m, period: 'PM' };
  if (h > 12) return { hour12: h - 12, minute: m, period: 'PM' };
  return { hour12: h, minute: m, period: 'AM' };
}

function formatTime(hour12: number, minute: number, period: Period): string {
  let h24: number;
  if (hour12 === 12) {
    h24 = period === 'AM' ? 0 : 12;
  } else {
    h24 = period === 'AM' ? hour12 : hour12 + 12;
  }
  return `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

// Compact drum scroll constants
const ITEM_HEIGHT = 28;
const VISIBLE_ITEMS = 3;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface ScrollColumnItem {
  value: number;
  label: string;
}

interface CompactScrollColumnProps {
  items: ScrollColumnItem[];
  selectedValue: number;
  onSelect: (value: number) => void;
  disabled?: boolean;
}

/**
 * Compact iOS-style scroll column for time picking.
 * Internal to TimePicker - not exported.
 */
const CompactScrollColumn = memo(
  ({ items, selectedValue, onSelect, disabled = false }: CompactScrollColumnProps) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const handleScroll = useCallback(() => {
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
      }

      scrollEndTimerRef.current = setTimeout(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const itemIndex = Math.round(container.scrollTop / ITEM_HEIGHT);
        const item = items[itemIndex];
        if (item && item.value !== selectedValue) {
          onSelect(item.value);
        }
      }, 150);
    }, [items, onSelect, selectedValue]);

    // Set initial scroll position on mount
    useEffect(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const itemIndex = items.findIndex((item) => item.value === selectedValue);
      const targetIndex = itemIndex !== -1 ? itemIndex : 0;

      const timer = setTimeout(() => {
        container.scrollTop = targetIndex * ITEM_HEIGHT;
      }, 0);
      return () => clearTimeout(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    // Cleanup pending timer on unmount
    useEffect(() => {
      return () => {
        if (scrollEndTimerRef.current) {
          clearTimeout(scrollEndTimerRef.current);
        }
      };
    }, []);

    return (
      <div className={`relative ${disabled ? 'pointer-events-none opacity-40' : ''}`}>
        {/* Gradient overlay - top */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-7 bg-gradient-to-b from-bg-surface to-transparent" />

        {/* Scroll container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="relative z-[5] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            height: `${CONTAINER_HEIGHT}px`,
            scrollSnapType: 'y mandatory',
            paddingTop: `${ITEM_HEIGHT}px`,
            paddingBottom: `${ITEM_HEIGHT}px`,
            willChange: 'scroll-position',
            transform: 'translateZ(0)',
          }}
        >
          {items.map((item) => {
            const isSelected = item.value === selectedValue;
            return (
              <div
                key={item.value}
                className={`flex items-center justify-center transition-colors duration-150 ${
                  isSelected ? 'text-base font-semibold text-brand-primary' : 'text-xs text-text-tertiary'
                }`}
                style={{
                  height: `${ITEM_HEIGHT}px`,
                  scrollSnapAlign: 'center',
                }}
              >
                {item.label}
              </div>
            );
          })}
        </div>

        {/* Gradient overlay - bottom */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-7 bg-gradient-to-t from-bg-surface to-transparent" />

        {/* Center highlight line */}
        <div
          className="pointer-events-none absolute left-0 right-0 border-y border-border-default bg-brand-tertiary"
          style={{ top: `${ITEM_HEIGHT}px`, height: `${ITEM_HEIGHT}px` }}
        />
      </div>
    );
  }
);

CompactScrollColumn.displayName = 'CompactScrollColumn';

const AM_PM_ITEMS: ScrollColumnItem[] = [
  { value: 0, label: 'AM' },
  { value: 1, label: 'PM' },
];

const HOUR_ITEMS: ScrollColumnItem[] = HOURS.map((h) => ({ value: h, label: String(h) }));

const MINUTE_ITEMS: ScrollColumnItem[] = MINUTES.map((m) => ({
  value: m,
  label: String(m).padStart(2, '0'),
}));

export function TimePickerInput({
  value,
  onChange,
  disabled = false,
  'aria-label': ariaLabel,
  className = '',
}: TimePickerInputProps) {
  const { hour12, minute, period } = parseTime(value);
  const displayMinute = Math.min(Math.round(minute / 5) * 5, 55);

  const handlePeriodSelect = useCallback(
    (newValue: number) => {
      onChange(formatTime(hour12, minute, newValue === 0 ? 'AM' : 'PM'));
    },
    [hour12, minute, onChange]
  );

  const handleHourSelect = useCallback(
    (newHour: number) => {
      onChange(formatTime(newHour, minute, period));
    },
    [minute, period, onChange]
  );

  const handleMinuteSelect = useCallback(
    (newMinute: number) => {
      onChange(formatTime(hour12, newMinute, period));
    },
    [hour12, period, onChange]
  );

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`flex w-full items-center gap-2 rounded-xl border border-input bg-background p-2 transition-colors focus-within:ring-2 focus-within:ring-ring ${
        disabled ? 'pointer-events-none opacity-50' : ''
      } ${className}`}
    >
      {/* AM/PM column */}
      <div className="flex-1">
        <CompactScrollColumn
          items={AM_PM_ITEMS}
          selectedValue={period === 'AM' ? 0 : 1}
          onSelect={handlePeriodSelect}
          disabled={disabled}
        />
      </div>

      {/* Hour column */}
      <div className="flex-1">
        <CompactScrollColumn
          items={HOUR_ITEMS}
          selectedValue={hour12}
          onSelect={handleHourSelect}
          disabled={disabled}
        />
      </div>

      {/* Minute column */}
      <div className="flex-1">
        <CompactScrollColumn
          items={MINUTE_ITEMS}
          selectedValue={displayMinute}
          onSelect={handleMinuteSelect}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
