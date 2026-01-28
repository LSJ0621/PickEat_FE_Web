/**
 * User Place 카드 컴포넌트
 */

import type { UserPlace } from '@/types/user-place';
import { UserPlaceStatusBadge } from './UserPlaceStatusBadge';
import { useTranslation } from 'react-i18next';

interface UserPlaceCardProps {
  place: UserPlace;
  onClick: () => void;
}

export function UserPlaceCard({ place, onClick }: UserPlaceCardProps) {
  const { t } = useTranslation();

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl border border-white/10 bg-slate-800/50 p-6 transition-all duration-200 hover:border-white/20 hover:bg-slate-800/70 hover:shadow-lg"
    >
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-xl font-bold text-white group-hover:text-orange-300">
          {place.name}
        </h3>
        <UserPlaceStatusBadge status={place.status} />
      </div>

      <p className="mb-2 text-sm text-slate-300">{place.address}</p>

      {place.category && (
        <p className="mb-2 text-sm text-slate-400">
          {t('userPlace.category')}: {place.category}
        </p>
      )}

      {place.phoneNumber && (
        <p className="mb-2 text-sm text-slate-400">
          {t('userPlace.phoneNumber')}: {place.phoneNumber}
        </p>
      )}

      {place.menuTypes && place.menuTypes.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {place.menuTypes.slice(0, 3).map((menu, idx) => (
            <span key={idx} className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs text-orange-300">
              {menu}
            </span>
          ))}
          {place.menuTypes.length > 3 && (
            <span className="text-xs text-slate-400">+{place.menuTypes.length - 3}</span>
          )}
        </div>
      )}

      {place.description && (
        <p className="mt-3 line-clamp-2 text-sm text-slate-400">
          {place.description}
        </p>
      )}
    </div>
  );
}
