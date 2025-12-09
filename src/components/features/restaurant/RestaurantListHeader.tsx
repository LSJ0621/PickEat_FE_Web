/**
 * 식당 리스트 헤더 컴포넌트
 * 제목, 주소 표시 및 액션 버튼을 제공합니다.
 */

import { Button } from '@/components/common/Button';

interface RestaurantListHeaderProps {
  address?: string;
  hasRestaurants: boolean;
  onOpenMapModal: () => void;
  onOpenNaverMap: () => void;
}

export const RestaurantListHeader = ({
  address,
  hasRestaurants,
  onOpenMapModal,
  onOpenNaverMap,
}: RestaurantListHeaderProps) => {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-orange-200/80">Nearby Restaurants</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">주변 식당 검색 결과</h2>
        </div>
        {address && (
          <span className="hidden rounded-full border border-white/15 px-3 py-1 text-xs text-slate-300 sm:inline-flex">
            {address}
          </span>
        )}
      </div>

      {hasRestaurants && (
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onOpenMapModal}>
            네이버 지도에서 보기
          </Button>
          <Button variant="ghost" size="sm" onClick={onOpenNaverMap}>
            네이버 맵 사이트에서 보기
          </Button>
        </div>
      )}
    </>
  );
};

