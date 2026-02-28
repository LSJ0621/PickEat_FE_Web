/**
 * 버그 제보 필터 컴포넌트
 */

import { useDebounce } from '@shared/hooks/useDebounce';
import type { BugReportStatus, BugReportCategory } from '@features/bug-report/types';
import { BUG_REPORT } from '@shared/utils/constants';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BugReportFiltersProps {
  status: BugReportStatus | 'ALL' | undefined;
  date: string;
  category: BugReportCategory | 'ALL' | undefined;
  search: string;
  onStatusChange: (status: BugReportStatus | 'ALL' | undefined) => void;
  onDateChange: (date: string) => void;
  onCategoryChange: (category: BugReportCategory | 'ALL' | undefined) => void;
  onSearchChange: (search: string) => void;
  onReset: () => void;
}

export const BugReportFilters = ({
  status,
  date,
  category,
  search,
  onStatusChange,
  onDateChange,
  onCategoryChange,
  onSearchChange,
  onReset,
}: BugReportFiltersProps) => {
  const { t } = useTranslation();
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  // Reset local search when parent search changes (e.g., on reset)
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 rounded-lg border border-border-default bg-bg-primary p-4">
        {/* 상태 필터 */}
        <div className="flex-1 min-w-[150px]">
          <label className="mb-2 block text-sm font-medium text-text-secondary">{t('bugReport.filter.status')}</label>
          <div className="relative">
            <select
              value={status || 'UNCONFIRMED'}
              onChange={(e) => {
                const value = e.target.value;
                onStatusChange(value as BugReportStatus | 'ALL');
              }}
              className="w-full appearance-none rounded-lg border border-border-default bg-bg-surface px-4 pr-10 py-2 text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            >
              <option value="UNCONFIRMED">{t('bugReport.status.unconfirmed')}</option>
              <option value="CONFIRMED">{t('bugReport.status.confirmed')}</option>
              <option value="FIXED">{t('bugReport.status.fixed')}</option>
              <option value="ALL">{t('common.all')}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg
                className="h-4 w-4 text-text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex-1 min-w-[150px]">
          <label className="mb-2 block text-sm font-medium text-text-secondary">{t('bugReport.filter.category')}</label>
          <div className="relative">
            <select
              value={category || 'ALL'}
              onChange={(e) => {
                const value = e.target.value;
                onCategoryChange(value === 'ALL' ? 'ALL' : (value as BugReportCategory));
              }}
              className="w-full appearance-none rounded-lg border border-border-default bg-bg-surface px-4 pr-10 py-2 text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            >
              {BUG_REPORT.CATEGORY_KEYS.map((key) => (
                <option key={key} value={key.toUpperCase()}>{t(`bugReport.categories.${key}`)}</option>
              ))}
              <option value="ALL">{t('common.all')}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg
                className="h-4 w-4 text-text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* 날짜 필터 */}
        <div className="flex-1 min-w-[180px]">
          <label className="mb-2 block text-sm font-medium text-text-secondary">{t('bugReport.filter.date')}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full rounded-lg border border-border-default bg-bg-surface px-4 py-2 text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        {/* 필터 초기화 */}
        <div className="flex items-end">
          <button
            onClick={onReset}
            className="rounded-lg border border-border-default bg-bg-surface px-4 py-2 text-sm text-text-secondary transition hover:bg-bg-hover"
          >
            {t('common.reset')}
          </button>
        </div>
      </div>

      {/* 검색 */}
      <div className="relative">
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder={t('bugReport.filter.searchPlaceholder')}
          className="w-full rounded-lg border border-border-default bg-bg-surface px-4 pl-10 py-3 text-text-primary placeholder-text-placeholder focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        />
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          <svg
            className="h-5 w-5 text-text-tertiary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
