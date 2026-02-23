import { Button } from '@shared/components/Button';
import type { MenuRecommendationItemData } from '@features/agent/types';
import { MenuRecommendationCard } from './MenuRecommendationCard';
import { useTranslation } from 'react-i18next';

export interface MenuRecommendationListProps {
  recommendations: MenuRecommendationItemData[];
  intro: string | null;
  closing: string | null;
  selectedMenu?: string | null;
  hasMenuSelectionCompleted: boolean;
  menuHistoryId: number | null;
  requestAddress: string | null;
  animatedMenus: Set<number>;
  onMenuSelect?: (
    menuName: string,
    historyId: number,
    meta: { requestAddress: string | null }
  ) => void;
  onOpenSelectionModal: () => void;
}

export const MenuRecommendationList = ({
  recommendations,
  intro,
  closing,
  selectedMenu,
  hasMenuSelectionCompleted,
  menuHistoryId,
  requestAddress,
  animatedMenus,
  onMenuSelect,
  onOpenSelectionModal,
}: MenuRecommendationListProps) => {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-text-primary sm:text-lg">
          {t('menu.recommendation.result')}
        </h3>
        {!hasMenuSelectionCompleted && (
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenSelectionModal}
            className="bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/40 text-xs sm:text-sm"
          >
            {t('menu.recommendation.select')}
          </Button>
        )}
      </div>

      <div className="mt-3 space-y-3 sm:mt-4">
        {(intro || closing) && (
          <div className="rounded-2xl border border-border-default bg-bg-secondary p-4 text-sm text-text-secondary shadow-sm sm:p-5 sm:text-base">
            {intro && <p className="leading-relaxed whitespace-pre-line">{intro}</p>}
            {recommendations.length > 0 && (
              <ul className="mt-4 space-y-1.5">
                {recommendations.map((item, index) => (
                  <li key={index} className="text-text-secondary">
                    • {item.condition} →{' '}
                    <span className="font-medium text-text-primary">{item.menu}</span>
                  </li>
                ))}
              </ul>
            )}
            {closing && <p className="mt-4 leading-relaxed">{closing}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {recommendations.map((item, index) => (
            <MenuRecommendationCard
              key={index}
              item={item}
              index={index}
              isSelected={selectedMenu === item.menu}
              shouldAnimate={animatedMenus.has(index)}
              menuHistoryId={menuHistoryId}
              requestAddress={requestAddress}
              onMenuSelect={onMenuSelect}
            />
          ))}
        </div>

        <p className="text-center text-xs text-text-tertiary sm:text-sm">
          {t('menu.recommendation.clickHint')}
        </p>
      </div>
    </div>
  );
};
