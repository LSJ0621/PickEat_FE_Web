import { PlaceBlogsSection } from './PlaceBlogsSection';
import { PlaceMiniMap } from './PlaceMiniMap';
import { PlaceReviewsSection } from './PlaceReviewsSection';
import type { PlaceDetail } from '@features/agent/types';
import { useTranslation } from 'react-i18next';

export interface PlaceDetailBodyProps {
  placeDetail: PlaceDetail | null;
  placeName?: string | null;
  searchName?: string | null;
  searchAddress?: string | null;
  currentPhotoIndex: number;
  photoTransition: 'fade' | 'none';
  onPreviousPhoto: () => void;
  onNextPhoto: () => void;
}

export const PlaceDetailBody = ({
  placeDetail,
  placeName,
  searchName,
  searchAddress,
  currentPhotoIndex,
  photoTransition,
  onPreviousPhoto,
  onNextPhoto,
}: PlaceDetailBodyProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Empty state */}
      {!placeDetail?.rating &&
        placeDetail?.openNow === null &&
        (!placeDetail?.photos || placeDetail.photos.length === 0) &&
        placeDetail?.source !== 'USER' &&
        (!placeDetail?.reviews || placeDetail.reviews.length === 0) && (
          <div className="rounded-xl border border-border-default bg-bg-secondary p-4 text-center">
            <p className="text-sm text-text-tertiary">{t('place.noDetailsAvailable')}</p>
          </div>
        )}

      {/* 평점 및 영업 상태 - Google 가게(source: 'GOOGLE')는 평점 숨김 */}
      {(placeDetail?.rating != null || placeDetail?.openNow !== null) && (
        <div className="flex items-center gap-3 flex-wrap">
          {placeDetail?.rating != null && placeDetail?.source !== 'GOOGLE' && (
            <p className="text-sm text-text-secondary">
              {t('place.rating')} {placeDetail.rating.toFixed(1)} · {t('place.reviews')}{' '}
              {placeDetail.userRatingCount ?? 0}
              {t('place.reviewCount')}
            </p>
          )}
          {placeDetail?.openNow !== null && placeDetail?.openNow !== undefined && (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                placeDetail.openNow
                  ? 'border border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                  : 'border border-rose-400/40 bg-rose-500/15 text-rose-200'
              }`}
            >
              {placeDetail.openNow ? t('place.openNow') : t('place.closedNow')}
            </span>
          )}
        </div>
      )}

      {/* 사진 슬라이드 */}
      {placeDetail?.photos && placeDetail.photos.length > 0 && (
        <div>
          <div className="relative">
            <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-bg-secondary">
              <img
                src={placeDetail.photos[currentPhotoIndex]}
                alt={`${placeDetail?.name ?? placeName ?? t('place.storePhoto')} ${currentPhotoIndex + 1}`}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  photoTransition === 'fade' ? 'opacity-0' : 'opacity-100'
                }`}
                loading="lazy"
              />
              <div className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md border border-white/10">
                {currentPhotoIndex + 1} / {placeDetail.photos.length}
              </div>
              {placeDetail.photos.length > 1 && (
                <>
                  <button
                    onClick={onPreviousPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2.5 text-white transition-all hover:bg-black/90 hover:scale-110 backdrop-blur-md border border-white/10"
                    aria-label={t('place.previousPhoto')}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={onNextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2.5 text-white transition-all hover:bg-black/90 hover:scale-110 backdrop-blur-md border border-white/10"
                    aria-label={t('place.nextPhoto')}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            {placeDetail.photos.length > 1 && (
              <p className="mt-2 text-center text-xs text-text-placeholder">{t('place.photoNavTip')}</p>
            )}
          </div>
        </div>
      )}

      {/* 커뮤니티 가게 추가 정보 */}
      {placeDetail?.source === 'USER' && (
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
          <h4 className="text-sm font-semibold text-blue-200">{t('place.communityInfo')}</h4>
          {placeDetail.phoneNumber && (
            <div className="space-y-1">
              <p className="text-xs text-text-tertiary">{t('place.phoneNumber')}</p>
              <p className="text-sm text-text-primary">{placeDetail.phoneNumber}</p>
            </div>
          )}
          {placeDetail.openingHours && (
            <div className="space-y-1">
              <p className="text-xs text-text-tertiary">{t('place.openingHoursLabel')}</p>
              <p className="text-sm text-text-primary whitespace-pre-line">{placeDetail.openingHours}</p>
            </div>
          )}
          {placeDetail.menuTypes && placeDetail.menuTypes.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-text-tertiary">{t('place.menuTypesLabel')}</p>
              <div className="flex flex-wrap gap-2">
                {placeDetail.menuTypes.map((menu, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-lg bg-bg-secondary px-3 py-1.5 text-xs text-text-secondary"
                  >
                    {menu}
                  </span>
                ))}
              </div>
            </div>
          )}
          {placeDetail.description && (
            <div className="space-y-1">
              <p className="text-xs text-text-tertiary">{t('fields.description')}</p>
              <p className="text-sm text-text-primary whitespace-pre-line">{placeDetail.description}</p>
            </div>
          )}
        </div>
      )}

      {/* 미니 Google 지도 */}
      <PlaceMiniMap placeDetail={placeDetail} placeName={placeName} />

      {/* 리뷰 섹션 */}
      {placeDetail?.reviews && placeDetail.reviews.length > 0 && (
        <PlaceReviewsSection reviews={placeDetail.reviews} />
      )}

      {/* 블로그 섹션 */}
      <PlaceBlogsSection placeName={placeName} searchName={searchName} searchAddress={searchAddress} />
    </div>
  );
};
