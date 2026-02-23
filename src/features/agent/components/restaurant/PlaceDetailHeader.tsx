import type { PlaceDetail } from '@features/agent/types';
import { formatMultilingualName } from '@shared/utils/format';
import { useTranslation } from 'react-i18next';

export interface PlaceDetailHeaderProps {
  placeName?: string | null;
  localizedName?: string | null;
  placeDetail: PlaceDetail | null;
  onClose: () => void;
}

export const PlaceDetailHeader = ({
  placeName,
  localizedName,
  placeDetail,
  onClose,
}: PlaceDetailHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      {/* Mobile handle */}
      <div className="absolute left-1/2 top-3 -translate-x-1/2 md:hidden">
        <div className="h-1 w-12 rounded-full bg-border-default" />
      </div>

      <div className="flex items-center gap-2 min-w-0 flex-1 pt-4 md:pt-0">
        <h3 className="text-xl font-bold text-text-primary truncate">
          {formatMultilingualName(
            placeName ?? placeDetail?.name ?? t('place.selectedStore'),
            localizedName
          )}
        </h3>
        {placeDetail?.source === 'USER' && (
          <span className="inline-flex items-center rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-300 border border-blue-500/30 whitespace-nowrap flex-shrink-0">
            {t('place.communityRegistered')}
          </span>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 rounded-full p-1.5 text-text-tertiary transition-all duration-150 hover:bg-bg-hover hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        aria-label={t('common.close')}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
