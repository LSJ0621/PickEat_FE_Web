/**
 * 식당 리스트 아이템 컴포넌트
 * 개별 식당 정보를 표시합니다.
 */

import type { Restaurant } from '@/types/search';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Navigation } from 'lucide-react';

interface RestaurantListItemProps {
  restaurant: Restaurant;
  index: number;
}

export const RestaurantListItem = ({ restaurant, index }: RestaurantListItemProps) => {
  const { t } = useTranslation();

  return (
    <div
      key={index}
      className="group relative overflow-hidden rounded-2xl border border-border-default bg-bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-border-focus/40 hover:shadow-md sm:rounded-2xl sm:p-5"
    >
      {/* Index accent bar */}
      <span className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-orange-400/60 via-rose-400/40 to-transparent" />

      <div className="flex items-start justify-between gap-4 pl-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-primary/40">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h4 className="truncate text-base font-bold text-text-primary sm:text-lg">
              {restaurant.name}
            </h4>
          </div>
          <div className="mt-2 flex items-start gap-1.5 text-sm text-text-secondary">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-tertiary" />
            <p className="leading-relaxed">{restaurant.roadAddress || restaurant.address}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 pl-2 text-xs text-text-secondary">
        {restaurant.distance && (
          <span className="inline-flex items-center gap-1 rounded-full border border-border-default bg-bg-secondary px-2.5 py-1">
            <Navigation className="h-3 w-3 text-brand-primary/70" />
            {t('restaurant.distanceKm', { distance: restaurant.distance.toFixed(1) })}
          </span>
        )}
        {restaurant.phone && (
          <span className="inline-flex items-center gap-1 rounded-full border border-border-default bg-bg-secondary px-2.5 py-1">
            <Phone className="h-3 w-3 text-text-tertiary" />
            {restaurant.phone}
          </span>
        )}
      </div>
    </div>
  );
};
