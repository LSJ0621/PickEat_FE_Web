/**
 * 유저 가게 목록 항목 컴포넌트
 */

import type { AdminUserPlaceListItem } from '@features/admin/types';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDateStandard } from '@shared/utils/format';

interface UserPlaceListItemProps {
  place: AdminUserPlaceListItem;
  onClick: () => void;
}

export const UserPlaceListItem = memo(({ place, onClick }: UserPlaceListItemProps) => {
  const { t } = useTranslation();

  const getStatusBadge = (status: AdminUserPlaceListItem['status']) => {
    const badges = {
      PENDING: { label: t('admin.userPlaces.status.pending'), bg: 'bg-yellow-500/20', text: 'text-yellow-600' },
      APPROVED: { label: t('admin.userPlaces.status.approved'), bg: 'bg-green-500/20', text: 'text-green-600' },
      REJECTED: { label: t('admin.userPlaces.status.rejected'), bg: 'bg-red-500/20', text: 'text-red-600' },
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
      className="w-full rounded-lg border border-border-default bg-bg-surface p-4 text-left transition hover:border-border-focus hover:bg-bg-hover"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-text-tertiary">ID: {place.id}</span>
            {getStatusBadge(place.status)}
            {place.rejectionCount > 0 && (
              <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-medium text-brand-primary">
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
            <span>{formatDateStandard(place.createdAt)}</span>
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
