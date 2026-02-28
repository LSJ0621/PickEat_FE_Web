/**
 * User Place 카드 컴포넌트
 */

import type { UserPlace } from '@features/user-place/types';
import { UserPlaceStatusBadge } from './UserPlaceStatusBadge';
import { Badge } from '@shared/ui/badge';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Tag, ChevronRight } from 'lucide-react';

interface UserPlaceCardProps {
  place: UserPlace;
  onClick: () => void;
}

export function UserPlaceCard({ place, onClick }: UserPlaceCardProps) {
  const { t } = useTranslation();

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl border border-border-default bg-bg-surface p-5 shadow-sm transition-all duration-200 hover:border-brand-primary/30 hover:shadow-md"
    >
      {/* 헤더 */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-base font-bold text-text-primary transition-colors group-hover:text-brand-primary">
          {place.name}
        </h3>
        <div className="flex shrink-0 items-center gap-1">
          <UserPlaceStatusBadge status={place.status} />
          <ChevronRight className="h-4 w-4 text-text-tertiary transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>

      {/* 주소 */}
      <div className="mb-2 flex items-start gap-1.5">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-tertiary" />
        <p className="text-xs text-text-secondary leading-relaxed">{place.address}</p>
      </div>

      {/* 카테고리 */}
      {place.category && (
        <div className="mb-2 flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
          <p className="text-xs text-text-tertiary">{t(`userPlace.categories.${place.category}`, { defaultValue: place.category })}</p>
        </div>
      )}

      {/* 전화번호 */}
      {place.phoneNumber && (
        <div className="mb-2 flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
          <p className="text-xs text-text-tertiary">{place.phoneNumber}</p>
        </div>
      )}

      {/* 메뉴 태그 */}
      {place.menuTypes && place.menuTypes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {place.menuTypes.slice(0, 3).map((menu, idx) => (
            <Badge key={idx} variant="menu">{menu}</Badge>
          ))}
          {place.menuTypes.length > 3 && (
            <span className="rounded-full bg-bg-secondary px-2.5 py-0.5 text-xs text-text-tertiary">
              +{place.menuTypes.length - 3}
            </span>
          )}
        </div>
      )}

      {/* 설명 */}
      {place.description && (
        <p className="mt-3 line-clamp-2 text-xs text-text-tertiary leading-relaxed">
          {place.description}
        </p>
      )}

      {/* 카테고리 없고 메뉴도 없을 때 빈 여백 방지용 안내 */}
      {!place.category && (!place.menuTypes || place.menuTypes.length === 0) && !place.description && (
        <p className="mt-2 text-xs text-text-placeholder italic">
          {t('userPlace.noDetails')}
        </p>
      )}
    </div>
  );
}
