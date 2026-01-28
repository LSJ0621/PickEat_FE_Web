/**
 * 유저 가게 목록 필터 컴포넌트
 */

import { useDebounce } from '@/hooks/common/useDebounce';
import type { AdminUserPlaceListItem } from '@/types/admin';
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
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
      <div className="space-y-4">
        {/* 상태 필터 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            {t('common.status')}
          </label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onStatusChange(option.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  status === option.value
                    ? 'bg-orange-500 text-white'
                    : 'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 검색 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            {t('common.search')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={t('admin.userPlaces.filter.searchPlaceholder')}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
            <button
              onClick={onReset}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
            >
              {t('common.reset')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
