import type { PlaceRecommendationItemV2 } from '@features/agent/types';
import { formatMultilingualName } from '@shared/utils/format';
import { cn } from '@shared/utils/cn';
import { ChevronRight, Search, Users, Star } from 'lucide-react';
import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface CompactPlaceCardProps {
  place: PlaceRecommendationItemV2;
  index: number;
  source?: 'search' | 'community';
  onSelect: () => void;
}

export function CompactPlaceCard({ place, index, source, onSelect }: CompactPlaceCardProps) {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  const hasPhoto = Boolean(place.photoUrl) && !imageError;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={place.name}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={cn(
        'group relative flex overflow-hidden rounded-2xl border',
        source === 'community'
          ? 'border-success/20 bg-success/[0.02]'
          : 'border-border-default bg-bg-surface',
        'cursor-pointer transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-md',
        source === 'community'
          ? 'hover:border-success/40 hover:shadow-success/10'
          : 'hover:border-border-focus/40 hover:shadow-brand-primary/10',
        'active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary'
      )}
    >
      {/* Left: Accent Bar or Photo Thumbnail */}
      {hasPhoto ? (
        <div className="h-auto w-14 shrink-0 overflow-hidden bg-bg-secondary">
          <img
            src={place.photoUrl!}
            alt={place.name}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div
          className={cn(
            'w-1 shrink-0 rounded-l-2xl bg-gradient-to-b',
            source === 'community'
              ? 'from-success to-success/80'
              : 'from-brand-primary to-brand-secondary'
          )}
        />
      )}

      {/* Content */}
      <div className="min-w-0 flex-1 px-3.5 py-3">
        {/* Row 1: Number + Name + Source Badge */}
        <div className="flex items-center gap-2.5">
          <span className="text-lg font-black leading-none text-brand-primary/30">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h4 className="min-w-0 flex-1 truncate text-sm font-bold tracking-tight text-text-primary">
            {formatMultilingualName(place.name, place.localizedName)}
          </h4>
          {source && (
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold',
                source === 'search'
                  ? 'border-brand-primary/20 bg-brand-primary/10 text-brand-primary'
                  : 'border-success/20 bg-success/10 text-success'
              )}
            >
              {source === 'search' ? (
                <Search className="h-3 w-3" />
              ) : (
                <Users className="h-3 w-3" />
              )}
              {source === 'search'
                ? t('restaurant.searchBadge')
                : t('restaurant.communityBadge')}
            </span>
          )}
        </div>

        {/* Row 1.5: Rating - Google 가게는 평점 표시 숨김 */}
        {place.rating != null && place.source !== 'GOOGLE' && (
          <div className="mt-1 flex items-center gap-1">
            <Star className="h-3 w-3 fill-warning text-warning" aria-hidden="true" />
            <span className="text-xs font-medium text-warning">{place.rating.toFixed(1)}</span>
            {place.reviewCount != null && (
              <span className="text-[10px] text-text-tertiary">({place.reviewCount})</span>
            )}
          </div>
        )}

        {/* Row 2: Reason Tags */}
        {place.reasonTags && place.reasonTags.length > 0 && (
          <p className="mt-1.5 text-xs font-medium text-brand-primary/70">
            {place.reasonTags.slice(0, 3).join(' · ')}
          </p>
        )}

        {/* Row 3: Reason */}
        {place.reason && (
          <p className="mt-1 line-clamp-2 text-xs italic leading-relaxed text-text-tertiary">
            &ldquo;{place.reason}&rdquo;
          </p>
        )}
      </div>

      {/* Right Chevron */}
      <div className="flex items-center pr-3 text-text-tertiary/50 transition-transform duration-200 group-hover:translate-x-0.5">
        <ChevronRight className="h-4 w-4" />
      </div>
    </div>
  );
}
