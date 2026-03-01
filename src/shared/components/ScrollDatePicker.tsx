/**
 * iOS-style 3-column drum scroll date picker component
 * Uses CSS scroll-snap for smooth year/month/day selection
 */

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ScrollDatePickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
  minYear?: number;
  maxYear?: number;
}

interface ScrollColumnItem {
  value: number;
  label: string;
}

interface ScrollColumnProps {
  items: ScrollColumnItem[];
  selectedValue: number | null;
  onSelect: (value: number | null) => void;
  disabled?: boolean;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 3;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

/**
 * Generic scroll column component for year/month/day selection
 */
const ScrollColumn = memo(({ items, selectedValue, onSelect, disabled = false }: ScrollColumnProps) => {
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

  // Set initial scroll position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let targetIndex = 0;
    if (selectedValue !== null) {
      const itemIndex = items.findIndex((item) => item.value === selectedValue);
      if (itemIndex !== -1) {
        targetIndex = itemIndex;
      }
    }

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
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-11 bg-gradient-to-b from-bg-surface to-transparent" />

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
                isSelected ? 'text-lg font-semibold text-brand-primary' : 'text-sm text-text-tertiary'
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
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-11 bg-gradient-to-t from-bg-surface to-transparent" />

      {/* Center highlight line */}
      <div
        className="pointer-events-none absolute left-0 right-0 border-y border-border-default bg-brand-tertiary"
        style={{ top: `${ITEM_HEIGHT}px`, height: `${ITEM_HEIGHT}px` }}
      />
    </div>
  );
});

/**
 * Helper to calculate days in month, accounting for leap years
 */
const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

const NOT_SET_VALUE = -1;

export const ScrollDatePicker = ({
  value,
  onChange,
  minYear = 1940,
  maxYear = new Date().getFullYear(),
}: ScrollDatePickerProps) => {
  const { t } = useTranslation();
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Parse initial value
  const parseDate = (dateString: string | null): { year: number | null; month: number | null; day: number | null } => {
    if (!dateString) return { year: null, month: null, day: null };
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return { year: null, month: null, day: null };
    return {
      year: parseInt(match[1], 10),
      month: parseInt(match[2], 10),
      day: parseInt(match[3], 10),
    };
  };

  const initialDate = useMemo(() => parseDate(value), [value]);
  const [selectedYear, setSelectedYear] = useState<number | null>(initialDate.year);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(initialDate.month);
  const [selectedDay, setSelectedDay] = useState<number | null>(initialDate.day);

  // Generate year items (descending with "미설정" at top)
  const yearItems = useMemo(() => {
    const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
    const items: ScrollColumnItem[] = [
      { value: NOT_SET_VALUE, label: t('user.profile.notSet') }, // Special value for "미설정"
      ...years.map((year) => ({ value: year, label: String(year) })),
    ];
    return items;
  }, [minYear, maxYear, t]);

  // Generate month items (1-12)
  const monthItems = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: String(i + 1).padStart(2, '0'),
    }));
  }, []);

  // Generate day items (1-N, where N depends on selected year/month)
  const dayItems = useMemo(() => {
    if (selectedYear === null || selectedYear === NOT_SET_VALUE || selectedMonth === null) {
      return Array.from({ length: 31 }, (_, i) => ({
        value: i + 1,
        label: String(i + 1).padStart(2, '0'),
      }));
    }
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    return Array.from({ length: daysInMonth }, (_, i) => ({
      value: i + 1,
      label: String(i + 1).padStart(2, '0'),
    }));
  }, [selectedYear, selectedMonth]);

  // Handle year selection
  const handleYearChange = useCallback((year: number | null) => {
    if (year === NOT_SET_VALUE) {
      // "미설정" selected
      setSelectedYear(null);
      setSelectedMonth(null);
      setSelectedDay(null);
    } else {
      setSelectedYear(year);
    }
  }, []);

  // Handle month selection
  const handleMonthChange = useCallback((month: number | null) => {
    setSelectedMonth(month);
  }, []);

  // Handle day selection
  const handleDayChange = useCallback((day: number | null) => {
    setSelectedDay(day);
  }, []);

  // Auto-adjust day when year/month changes and current day exceeds max
  useEffect(() => {
    if (selectedYear !== null && selectedYear !== NOT_SET_VALUE && selectedMonth !== null && selectedDay !== null) {
      const maxDays = getDaysInMonth(selectedYear, selectedMonth);
      if (selectedDay > maxDays) {
        setSelectedDay(maxDays);
      }
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  // Update parent when all values are selected or when "미설정" is selected
  useEffect(() => {
    if (selectedYear === null) {
      onChangeRef.current(null);
    } else if (selectedYear !== NOT_SET_VALUE && selectedMonth !== null && selectedDay !== null) {
      const dateString = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
      onChangeRef.current(dateString);
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  return (
    <div className="flex gap-4">
      {/* Year column */}
      <div className="flex-1">
        <div className="mb-2 text-center text-sm text-text-secondary">{t('user.profile.yearLabel')}</div>
        <ScrollColumn
          items={yearItems}
          selectedValue={selectedYear === null ? NOT_SET_VALUE : selectedYear}
          onSelect={handleYearChange}
        />
      </div>

      {/* Month column */}
      <div className="flex-1">
        <div className="mb-2 text-center text-sm text-text-secondary">{t('user.profile.monthLabel')}</div>
        <ScrollColumn
          items={monthItems}
          selectedValue={selectedMonth}
          onSelect={handleMonthChange}
          disabled={selectedYear === null || selectedYear === NOT_SET_VALUE}
        />
      </div>

      {/* Day column */}
      <div className="flex-1">
        <div className="mb-2 text-center text-sm text-text-secondary">{t('user.profile.dayLabel')}</div>
        <ScrollColumn
          items={dayItems}
          selectedValue={selectedDay}
          onSelect={handleDayChange}
          disabled={selectedYear === null || selectedYear === NOT_SET_VALUE || selectedMonth === null}
        />
      </div>
    </div>
  );
};
