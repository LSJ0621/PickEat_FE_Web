import { PlaceBlogsSection } from './PlaceBlogsSection';
import { PlaceMiniMap } from './PlaceMiniMap';
import { PlaceReviewsSection } from './PlaceReviewsSection';
import { usePlaceDetails } from '@/hooks/place/usePlaceDetails';
import { ModalCloseButton } from '@/components/common/ModalCloseButton';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MAP_CONFIG } from '@/utils/constants';
import { useTranslation } from 'react-i18next';

interface PlaceDetailsModalProps {
  placeId: string | null;
  placeName?: string | null;
  onClose: () => void;
}

export const PlaceDetailsModal = ({ placeId, placeName, onClose }: PlaceDetailsModalProps) => {
  const { t } = useTranslation();
  const { status, errorMessage, placeDetail } = usePlaceDetails(placeId);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photoTransition, setPhotoTransition] = useState<'fade' | 'none'>('none');
  const naverClientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;
  const modalContentRef = useRef<HTMLDivElement>(null);

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
      // DOM이 완전히 렌더링된 후 스크롤 초기화
      const timer = setTimeout(() => {
        if (modalContentRef.current) {
          modalContentRef.current.scrollTop = 0;
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [placeId, status]); // placeId와 status 모두 감지

  // 데이터가 로드되어 ready 상태가 될 때도 스크롤 초기화
  useEffect(() => {
    if (status === 'ready' && placeId && modalContentRef.current) {
      // requestAnimationFrame을 사용하여 DOM 렌더링 완료 후 스크롤 초기화
      requestAnimationFrame(() => {
        if (modalContentRef.current) {
          modalContentRef.current.scrollTop = 0;
        }
      });
    }
  }, [status, placeId]);


  // 사진 네비게이션
  const handlePreviousPhoto = () => {
    if (placeDetail?.photos && placeDetail.photos.length > 0) {
      setPhotoTransition('fade');
      setTimeout(() => {
        setCurrentPhotoIndex((prev) => (prev === 0 ? placeDetail.photos!.length - 1 : prev - 1));
        setTimeout(() => setPhotoTransition('none'), MAP_CONFIG.TIMEOUT.PHOTO_TRANSITION);
      }, 150);
    }
  };

  const handleNextPhoto = () => {
    if (placeDetail?.photos && placeDetail.photos.length > 0) {
      setPhotoTransition('fade');
      setTimeout(() => {
        setCurrentPhotoIndex((prev) => (prev === placeDetail.photos!.length - 1 ? 0 : prev + 1));
        setTimeout(() => setPhotoTransition('none'), MAP_CONFIG.TIMEOUT.PHOTO_TRANSITION);
      }, 150);
    }
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!placeId) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [placeId, onClose]);

  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(!!placeId);

  useEffect(() => {
    if (placeId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [placeId]);

  if (!shouldRender) {
    return null;
  }

  return createPortal(
    <div 
      className={`fixed inset-0 z-[10000] flex items-start justify-center bg-black/70 p-4 pt-8 backdrop-blur overflow-y-auto ${
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
      }`}
      onClick={(e) => {
        // 배경 클릭 시 모달 닫기
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        ref={modalContentRef}
        className={`relative w-full max-w-2xl max-h-[calc(100vh-2rem)] rounded-[32px] border border-white/10 bg-slate-950/95 p-6 text-white shadow-2xl overflow-y-auto custom-scroll ${
          isAnimating ? 'modal-content-enter' : 'modal-content-exit'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalCloseButton onClose={onClose} />

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
            {/* 가게 이름 (제목) */}
            <div>
              <h3 className="text-2xl font-bold text-white">
                {placeName ?? placeDetail?.name ?? t('place.selectedStore')}
              </h3>
              {placeDetail?.rating != null && (
                <p className="mt-1 text-sm text-slate-300">
                  {t('place.rating')} {placeDetail.rating.toFixed(1)} · {t('place.reviews')} {placeDetail.userRatingCount ?? 0}{t('place.reviewCount')}
                </p>
              )}
              {placeDetail?.openNow !== null && placeDetail?.openNow !== undefined && (
                <span
                  className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    placeDetail.openNow
                      ? 'border border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                      : 'border border-rose-400/40 bg-rose-500/15 text-rose-200'
                  }`}
                >
                  {placeDetail.openNow ? t('place.openNow') : t('place.closedNow')}
                </span>
              )}
            </div>

            {/* 사진 슬라이드 */}
            {placeDetail?.photos && placeDetail.photos.length > 0 && (
              <div>
                <h4 className="mb-3 text-sm font-semibold text-slate-100">{t('place.photos')}</h4>
                <div className="relative">
                  <div className="relative h-64 w-full overflow-hidden rounded-xl bg-slate-800">
                    <img
                      src={placeDetail.photos[currentPhotoIndex]}
                      alt={`${placeDetail?.name ?? placeName ?? t('place.storePhoto')} ${currentPhotoIndex + 1}`}
                      className={`h-full w-full object-cover transition-opacity duration-300 ${
                        photoTransition === 'fade' ? 'opacity-0' : 'opacity-100'
                      }`}
                      loading="lazy"
                    />
                    {/* 사진 카운터 */}
                    <div className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                      {currentPhotoIndex + 1} / {placeDetail.photos.length}
                    </div>
                    {/* 이전 버튼 */}
                    {placeDetail.photos.length > 1 && (
                      <button
                        onClick={handlePreviousPhoto}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80 backdrop-blur-sm"
                        aria-label={t('place.previousPhoto')}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}
                    {/* 다음 버튼 */}
                    {placeDetail.photos.length > 1 && (
                      <button
                        onClick={handleNextPhoto}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80 backdrop-blur-sm"
                        aria-label={t('place.nextPhoto')}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {placeDetail.photos.length > 1 && (
                    <p className="mt-1 text-[11px] text-slate-500">
                      {t('place.photoNavTip')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 미니 네이버 지도 */}
            <PlaceMiniMap
              placeDetail={placeDetail}
              placeName={placeName}
              naverClientId={naverClientId}
            />

            {/* 리뷰 섹션 */}
            {placeDetail?.reviews && placeDetail.reviews.length > 0 && (
              <PlaceReviewsSection reviews={placeDetail.reviews} />
            )}

            {/* 블로그 섹션 */}
            <PlaceBlogsSection placeName={placeName} />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

