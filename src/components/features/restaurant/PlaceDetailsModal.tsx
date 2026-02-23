import { PlaceBlogsSection } from './PlaceBlogsSection';
import { PlaceMiniMap } from './PlaceMiniMap';
import { PlaceReviewsSection } from './PlaceReviewsSection';
import { usePlaceDetails } from '@/hooks/place/usePlaceDetails';
import { useModalAnimation } from '@/hooks/common/useModalAnimation';
import { useModalScrollLock } from '@/hooks/common/useModalScrollLock';
import { useEscapeKey } from '@/hooks/common/useEscapeKey';
import { useFocusTrap } from '@/hooks/common/useFocusTrap';
import { formatMultilingualName } from '@/utils/format';
import { MAP_CONFIG, Z_INDEX } from '@/utils/constants';
import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface PlaceDetailsModalProps {
  placeId: string | null;
  placeName?: string | null;
  localizedName?: string | null;
  searchName?: string | null;
  searchAddress?: string | null;
  onClose: () => void;
}

export const PlaceDetailsModal = ({
  placeId,
  placeName,
  localizedName,
  searchName,
  searchAddress,
  onClose,
}: PlaceDetailsModalProps) => {
  const { t } = useTranslation();
  const { status, errorMessage, placeDetail } = usePlaceDetails(placeId);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photoTransition, setPhotoTransition] = useState<'fade' | 'none'>('none');
  const photoTimerRef = useRef<number | null>(null);
  const photoTransitionTimerRef = useRef<number | null>(null);
  const isOpen = !!placeId;
  const { isAnimating, shouldRender } = useModalAnimation(isOpen);
  useModalScrollLock(isOpen);
  const modalContentRef = useFocusTrap(isOpen);

  // 사진 인덱스 초기화
  useEffect(() => {
    if (placeDetail?.photos && placeDetail.photos.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPhotoIndex(0);
    }
  }, [placeDetail?.photos]);

  // 모달이 열릴 때 스크롤 위치를 맨 위로 초기화
  useEffect(() => {
    if (placeId && modalContentRef.current) {
      if (status === 'ready') {
        requestAnimationFrame(() => {
          if (modalContentRef.current) {
            modalContentRef.current.scrollTop = 0;
          }
        });
      } else {
        const timer = setTimeout(() => {
          if (modalContentRef.current) {
            modalContentRef.current.scrollTop = 0;
          }
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [placeId, status]);

  // 사진 네비게이션
  const handlePreviousPhoto = useCallback(() => {
    if (placeDetail?.photos && placeDetail.photos.length > 0) {
      if (photoTimerRef.current !== null) clearTimeout(photoTimerRef.current);
      if (photoTransitionTimerRef.current !== null) clearTimeout(photoTransitionTimerRef.current);
      setPhotoTransition('fade');
      photoTimerRef.current = window.setTimeout(() => {
        setCurrentPhotoIndex((prev) => (prev === 0 ? placeDetail.photos!.length - 1 : prev - 1));
        photoTransitionTimerRef.current = window.setTimeout(
          () => setPhotoTransition('none'),
          MAP_CONFIG.TIMEOUT.PHOTO_TRANSITION
        );
      }, 150);
    }
  }, [placeDetail]);

  const handleNextPhoto = useCallback(() => {
    if (placeDetail?.photos && placeDetail.photos.length > 0) {
      if (photoTimerRef.current !== null) clearTimeout(photoTimerRef.current);
      if (photoTransitionTimerRef.current !== null) clearTimeout(photoTransitionTimerRef.current);
      setPhotoTransition('fade');
      photoTimerRef.current = window.setTimeout(() => {
        setCurrentPhotoIndex((prev) => (prev === placeDetail.photos!.length - 1 ? 0 : prev + 1));
        photoTransitionTimerRef.current = window.setTimeout(
          () => setPhotoTransition('none'),
          MAP_CONFIG.TIMEOUT.PHOTO_TRANSITION
        );
      }, 150);
    }
  }, [placeDetail]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (photoTimerRef.current !== null) clearTimeout(photoTimerRef.current);
      if (photoTransitionTimerRef.current !== null) clearTimeout(photoTransitionTimerRef.current);
    };
  }, []);

  useEscapeKey(onClose, !!placeId);

  if (!shouldRender) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 flex items-end md:items-center md:justify-center bg-black/40 backdrop-blur-sm p-4 md:p-6 overflow-y-auto ${
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
      }`}
      style={{ zIndex: Z_INDEX.PRIORITY_MODAL }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalContentRef}
        className={`relative w-full max-w-2xl max-h-[92vh] rounded-t-2xl md:rounded-2xl border border-border-default bg-bg-surface p-6 text-text-primary shadow-2xl overflow-y-auto custom-scroll ${
          isAnimating ? 'modal-content-enter' : 'modal-content-exit'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더: 가게 이름 + 닫기 버튼 */}
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

        {status === 'loading' && (
          <div className="flex items-center justify-center py-16">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500" />
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        {status === 'ready' && (
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
                          onClick={handlePreviousPhoto}
                          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2.5 text-white transition-all hover:bg-black/90 hover:scale-110 backdrop-blur-md border border-white/10"
                          aria-label={t('place.previousPhoto')}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={handleNextPhoto}
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
        )}
      </div>
    </div>,
    document.body
  );
};
