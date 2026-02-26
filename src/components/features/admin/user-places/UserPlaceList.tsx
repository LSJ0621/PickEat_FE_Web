/**
 * 유저 가게 목록 컴포넌트
 */

import type { AdminUserPlaceListItem } from '@/types/admin';
import { UserPlaceListItem } from './UserPlaceListItem';
import { useTranslation } from 'react-i18next';

interface UserPlaceListProps {
  places: AdminUserPlaceListItem[];
  onItemClick: (place: AdminUserPlaceListItem) => void;
}

export function UserPlaceList({ places, onItemClick }: UserPlaceListProps) {
  const { t } = useTranslation();

  if (places.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--border-default)] bg-bg-surface py-12">
        <svg
          className="mb-4 h-12 w-12 text-text-placeholder"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <p className="text-text-tertiary">{t('admin.userPlaces.list.empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {places.map((place) => (
        <UserPlaceListItem key={place.id} place={place} onClick={() => onItemClick(place)} />
      ))}
    </div>
  );
}
