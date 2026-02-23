import type { MenuRecommendationItemData } from '@features/agent/types';
import { ChevronRight } from 'lucide-react';

export interface MenuRecommendationCardProps {
  item: MenuRecommendationItemData;
  index: number;
  isSelected: boolean;
  shouldAnimate: boolean;
  menuHistoryId: number | null;
  requestAddress: string | null;
  onMenuSelect?: (
    menuName: string,
    historyId: number,
    meta: { requestAddress: string | null }
  ) => void;
}

export const MenuRecommendationCard = ({
  item,
  index,
  isSelected,
  shouldAnimate,
  menuHistoryId,
  requestAddress,
  onMenuSelect,
}: MenuRecommendationCardProps) => {
  return (
    <button
      onClick={() =>
        menuHistoryId &&
        onMenuSelect?.(item.menu, menuHistoryId, { requestAddress })
      }
      aria-label={`${item.menu} 선택`}
      aria-pressed={isSelected}
      className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border px-4 py-5 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 sm:py-6 ${
        isSelected
          ? 'border-brand-primary/50 bg-gradient-to-b from-brand-primary/10 via-rose-500/5 to-transparent hover:border-brand-primary/70'
          : 'border-border-default bg-bg-surface hover:border-border-focus/40 hover:bg-bg-hover'
      } ${shouldAnimate ? 'menu-card-enter' : 'opacity-0'}`}
      style={{ animationDelay: shouldAnimate ? `${index * 100}ms` : '0ms' }}
    >
      <span
        className={`absolute left-0 top-0 h-full w-1.5 ${
          isSelected
            ? 'bg-gradient-to-b from-orange-400 via-rose-400 to-fuchsia-500'
            : 'bg-gradient-to-b from-border-default via-border-light to-transparent'
        }`}
      />
      <span className="text-xs text-text-tertiary sm:text-sm" aria-hidden="true">
        {index + 1}
      </span>
      <div className="mt-2 flex items-center gap-1.5">
        <p
          className={`text-base font-semibold sm:text-lg ${
            isSelected ? 'text-brand-primary' : 'text-text-primary'
          }`}
        >
          {item.menu}
        </p>
        {isSelected && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary/15 text-[10px] text-brand-primary">
            <ChevronRight className="h-3 w-3" />
          </span>
        )}
      </div>
    </button>
  );
};
