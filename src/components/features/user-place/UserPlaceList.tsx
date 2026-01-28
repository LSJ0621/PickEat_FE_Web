/**
 * User Place 목록 컴포넌트
 */

import type { UserPlace, UserPlaceStatus } from '@/types/user-place';
import { UserPlaceCard } from './UserPlaceCard';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/Button';

interface UserPlaceListProps {
  places: UserPlace[];
  isLoading: boolean;
  status: UserPlaceStatus | undefined;
  search: string;
  page: number;
  totalPages: number;
  onStatusFilter: (status: UserPlaceStatus | undefined) => void;
  onSearch: (search: string) => void;
  onPageChange: (page: number) => void;
  onPlaceClick: (place: UserPlace) => void;
}

export function UserPlaceList({
  places,
  isLoading,
  status,
  search,
  page,
  totalPages,
  onStatusFilter,
  onSearch,
  onPageChange,
  onPlaceClick,
}: UserPlaceListProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* 필터 및 검색 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* 상태 필터 */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={status === undefined ? 'primary' : 'ghost'}
            onClick={() => onStatusFilter(undefined)}
          >
            {t('common.all')}
          </Button>
          <Button
            size="sm"
            variant={status === 'PENDING' ? 'primary' : 'ghost'}
            onClick={() => onStatusFilter('PENDING')}
          >
            {t('userPlace.status.PENDING')}
          </Button>
          <Button
            size="sm"
            variant={status === 'APPROVED' ? 'primary' : 'ghost'}
            onClick={() => onStatusFilter('APPROVED')}
          >
            {t('userPlace.status.APPROVED')}
          </Button>
          <Button
            size="sm"
            variant={status === 'REJECTED' ? 'primary' : 'ghost'}
            onClick={() => onStatusFilter('REJECTED')}
          >
            {t('userPlace.status.REJECTED')}
          </Button>
        </div>

        {/* 검색 */}
        <div className="flex-1 sm:max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t('userPlace.searchPlaceholder')}
            className="w-full rounded-lg border border-white/10 bg-slate-800/50 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
          />
        </div>
      </div>

      {/* 목록 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-400">{t('common.loading')}</p>
        </div>
      ) : places.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="mb-4 text-lg text-slate-400">{t('userPlace.noPlaces')}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((place) => (
              <UserPlaceCard
                key={place.id}
                place={place}
                onClick={() => onPlaceClick(place)}
              />
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
              >
                {t('common.previous')}
              </Button>
              <span className="px-4 text-sm text-slate-300">
                {page} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
              >
                {t('common.next')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
