/**
 * iOS-style drum scroll year picker component
 * Uses CSS scroll-snap for smooth year selection
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface YearScrollPickerProps {
  value: number | null;
  onChange: (year: number | null) => void;
  minYear?: number;
  maxYear?: number;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 3;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

export const YearScrollPicker = ({
  value,
  onChange,
  minYear = 1940,
  maxYear = new Date().getFullYear(),
}: YearScrollPickerProps) => {
  const { t } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Generate years array (descending) - memoized to avoid recreating on every render
  const years = useMemo(
    () => Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i),
    [minYear, maxYear]
  );

  const handleScroll = useCallback(() => {
    if (scrollEndTimerRef.current) {
      clearTimeout(scrollEndTimerRef.current);
    }

    scrollEndTimerRef.current = setTimeout(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const itemIndex = Math.round(container.scrollTop / ITEM_HEIGHT);

      // Handle "미설정" option (index 0)
      if (itemIndex === 0) {
        onChange(null);
      } else {
        const selectedYear = years[itemIndex - 1]; // -1 because first item is "미설정"
        if (selectedYear !== value) {
          onChange(selectedYear);
        }
      }
    }, 150);
  }, [onChange, value, years]);

  // Set initial scroll position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let targetIndex = 0;
    if (value !== null) {
      const yearIndex = years.indexOf(value);
      if (yearIndex !== -1) {
        targetIndex = yearIndex + 1; // +1 because first item is "미설정"
      }
    }

    // Use setTimeout to ensure DOM is ready
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
    <div className="relative">
      {/* Gradient overlay - top */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-11 bg-gradient-to-b from-bg-primary to-transparent" />

      {/* Scroll container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          height: `${CONTAINER_HEIGHT}px`,
          scrollSnapType: 'y mandatory',
          paddingTop: `${ITEM_HEIGHT}px`,
          paddingBottom: `${ITEM_HEIGHT}px`,
          willChange: 'scroll-position',
          transform: 'translateZ(0)',
        }}
      >
        {/* "미설정" option */}
        <div
          className="flex items-center justify-center text-sm text-text-tertiary transition-colors duration-150"
          style={{
            height: `${ITEM_HEIGHT}px`,
            scrollSnapAlign: 'center',
          }}
        >
          {t('user.profile.notSet')}
        </div>

        {/* Year options */}
        {years.map((year) => {
          const isSelected = year === value;
          return (
            <div
              key={year}
              className={`flex items-center justify-center transition-colors duration-150 ${
                isSelected ? 'text-lg font-semibold text-text-primary' : 'text-sm text-text-tertiary'
              }`}
              style={{
                height: `${ITEM_HEIGHT}px`,
                scrollSnapAlign: 'center',
              }}
            >
              {year}
            </div>
          );
        })}
      </div>

      {/* Gradient overlay - bottom */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-11 bg-gradient-to-t from-bg-primary to-transparent" />

      {/* Center highlight line (optional) */}
      <div className="pointer-events-none absolute left-0 right-0 z-10 border-y border-border-default" style={{ top: `${ITEM_HEIGHT}px`, height: `${ITEM_HEIGHT}px` }} />

    </div>
  );
};
