/**
 * 식당 리스트 아이템 컴포넌트
 * 개별 식당 정보를 표시합니다.
 */

import type { Restaurant } from '@/types/search';

interface RestaurantListItemProps {
  restaurant: Restaurant;
  index: number;
}

export const RestaurantListItem = ({ restaurant, index }: RestaurantListItemProps) => {
  return (
    <div
      key={index}
      className="cursor-default rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-5 shadow-xl shadow-black/30"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-xl font-bold text-white">{restaurant.name}</h4>
          <p className="mt-2 text-base text-slate-300">
            📍 {restaurant.roadAddress || restaurant.address}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-200">
        {restaurant.distance && (
          <span className="rounded-full border border-white/15 px-3 py-1">
            거리 {restaurant.distance.toFixed(1)}km
          </span>
        )}
        {restaurant.phone && (
          <span className="rounded-full border border-white/15 px-3 py-1">📞 {restaurant.phone}</span>
        )}
      </div>
    </div>
  );
};

