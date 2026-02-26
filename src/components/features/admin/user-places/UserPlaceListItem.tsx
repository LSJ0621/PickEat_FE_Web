/**
 * 유저 가게 목록 항목 컴포넌트
 */

import type { AdminUserPlaceListItem } from '@/types/admin';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface UserPlaceListItemProps {
  place: AdminUserPlaceListItem;
  onClick: () => void;
}

export const UserPlaceListItem = memo(({ place, onClick }: UserPlaceListItemProps) => {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getStatusBadge = (status: AdminUserPlaceListItem['status']) => {
    const badges = {
      PENDING: { label: t('admin.userPlaces.status.pending'), bg: 'bg-warning-bg', text: 'text-warning' },
      APPROVED: { label: t('admin.userPlaces.status.approved'), bg: 'bg-success-bg', text: 'text-success' },
      REJECTED: { label: t('admin.userPlaces.status.rejected'), bg: 'bg-error-bg', text: 'text-error' },
    };

    const badge = badges[status];
    return (
      <span className={`rounded-full ${badge.bg} px-3 py-1 text-xs font-medium ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border border-[var(--border-default)] bg-bg-surface p-4 text-left transition hover:border-[var(--border-default)] hover:bg-bg-hover"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-text-tertiary">ID: {place.id}</span>
            {getStatusBadge(place.status)}
            {place.rejectionCount > 0 && (
              <span className="rounded-full bg-brand-tertiary px-3 py-1 text-xs font-medium text-brand-primary">
                {t('admin.userPlaces.detail.rejectionCount')}: {place.rejectionCount}
              </span>
            )}
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-text-primary">{place.name}</h3>
            <p className="text-sm text-text-tertiary">{place.address}</p>
            <p className="text-sm text-text-placeholder">{place.category}</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-text-placeholder">
            <span>{t('admin.userPlaces.list.registeredBy')}: {place.user.email}</span>
            <span>{formatDate(place.createdAt)}</span>
          </div>
        </div>
        <svg
          className="h-5 w-5 flex-shrink-0 text-text-tertiary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
});

UserPlaceListItem.displayName = 'UserPlaceListItem';
