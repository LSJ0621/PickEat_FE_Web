/**
 * User Place 목록 컴포넌트
 */

import type { UserPlace, UserPlaceStatus } from '@/types/user-place';
import { UserPlaceCard } from './UserPlaceCard';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { MapPin, Search } from 'lucide-react';

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* 상태 필터 */}
        <div className="flex flex-wrap gap-2">
          {([undefined, 'PENDING', 'APPROVED', 'REJECTED'] as (UserPlaceStatus | undefined)[]).map(
            (s) => (
              <button
                key={s ?? 'all'}
                onClick={() => onStatusFilter(s)}
                className={[
                  'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                  status === s
                    ? 'bg-brand-primary text-text-inverse shadow-sm'
                    : 'bg-bg-secondary text-text-secondary hover:bg-bg-hover',
                ].join(' ')}
              >
                {s === undefined
                  ? t('common.all')
                  : t(`userPlace.status.${s}`)}
              </button>
            )
          )}
        </div>

        {/* 검색 */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <Input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t('userPlace.searchPlaceholder')}
            className="rounded-2xl pl-9"
          />
        </div>
      </div>

      {/* 목록 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
        </div>
      ) : places.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-default bg-bg-secondary py-16">
          <MapPin className="mb-3 h-10 w-10 text-text-tertiary" />
          <p className="text-base font-medium text-text-tertiary">{t('userPlace.noPlaces')}</p>
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
              <span className="px-4 text-sm text-text-secondary">
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
