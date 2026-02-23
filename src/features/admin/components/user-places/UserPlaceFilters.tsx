/**
 * 유저 가게 목록 필터 컴포넌트
 */

import { useDebounce } from '@shared/hooks/useDebounce';
import type { AdminUserPlaceListItem } from '@features/admin/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UserPlaceFiltersProps {
  search: string;
  status: AdminUserPlaceListItem['status'] | 'ALL';
  onSearchChange: (value: string) => void;
  onStatusChange: (value: AdminUserPlaceListItem['status'] | 'ALL') => void;
  onReset: () => void;
}

export const UserPlaceFilters = ({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onReset,
}: UserPlaceFiltersProps) => {
  const { t } = useTranslation();
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  const statusOptions: Array<{ value: AdminUserPlaceListItem['status'] | 'ALL'; label: string }> =
    [
      { value: 'ALL', label: t('admin.userPlaces.filter.all') },
      { value: 'PENDING', label: t('admin.userPlaces.status.pending') },
      { value: 'APPROVED', label: t('admin.userPlaces.status.approved') },
      { value: 'REJECTED', label: t('admin.userPlaces.status.rejected') },
    ];

  return (
    <div className="rounded-lg border border-border-default bg-bg-primary p-4">
      <div className="space-y-4">
        {/* 상태 필터 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            {t('common.status')}
          </label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onStatusChange(option.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  status === option.value
                    ? 'bg-brand-primary text-text-inverse'
                    : 'border border-border-default bg-bg-surface text-text-secondary hover:bg-bg-hover'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 검색 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            {t('common.search')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={t('admin.userPlaces.filter.searchPlaceholder')}
              className="flex-1 rounded-lg border border-border-default bg-bg-surface px-4 py-2 text-text-primary placeholder-text-placeholder focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
            <button
              onClick={onReset}
              className="rounded-lg border border-border-default bg-bg-surface px-4 py-2 text-sm text-text-secondary transition hover:bg-bg-hover"
            >
              {t('common.reset')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
