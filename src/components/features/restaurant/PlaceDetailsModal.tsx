import { PlaceBlogsSection } from './PlaceBlogsSection';
import { PlaceMiniMap } from './PlaceMiniMap';
import { PlaceReviewsSection } from './PlaceReviewsSection';
import { usePlaceDetails } from '@/hooks/usePlaceDetails';
import { ModalCloseButton } from '@/components/common/ModalCloseButton';
import { useEffect, useState } from 'react';
import { MAP_CONFIG } from '@/utils/constants';

interface PlaceDetailsModalProps {
  placeId: string | null;
  placeName?: string | null;
  onClose: () => void;
}

export const PlaceDetailsModal = ({ placeId, placeName, onClose }: PlaceDetailsModalProps) => {
  const { status, errorMessage, placeDetail } = usePlaceDetails(placeId);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photoTransition, setPhotoTransition] = useState<'fade' | 'none'>('none');
  const naverClientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;


  // 사진 인덱스 초기화
  useEffect(() => {
    if (placeDetail?.photos && placeDetail.photos.length > 0) {
      setCurrentPhotoIndex(0);
    }
  }, [placeDetail?.photos]);


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

  if (!placeId) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur">
      <div className="relative w-full max-w-2xl rounded-[32px] border border-white/10 bg-slate-950/95 p-6 text-white shadow-2xl">
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
          <div className="max-h-[80vh] overflow-y-auto rounded-xl custom-scroll space-y-6">
            {/* 가게 이름 (제목) */}
            <div>
              <h3 className="text-2xl font-bold text-white">
                {placeName ?? placeDetail?.name ?? '선택된 가게'}
              </h3>
              {placeDetail?.rating != null && (
                <p className="mt-1 text-sm text-slate-300">
                  평점 {placeDetail.rating.toFixed(1)} · 리뷰 {placeDetail.userRatingCount ?? 0}개
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
                  {placeDetail.openNow ? '현재 영업 중' : '현재 영업 종료'}
                </span>
              )}
            </div>

            {/* 사진 슬라이드 */}
            {placeDetail?.photos && placeDetail.photos.length > 0 && (
              <div>
                <h4 className="mb-3 text-sm font-semibold text-slate-100">사진</h4>
                <div className="relative">
                  <div className="relative h-64 w-full overflow-hidden rounded-xl bg-slate-800">
                    <img
                      src={placeDetail.photos[currentPhotoIndex]}
                      alt={`${placeDetail?.name ?? placeName ?? '가게 사진'} ${currentPhotoIndex + 1}`}
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
                        aria-label="이전 사진"
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
                        aria-label="다음 사진"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {placeDetail.photos.length > 1 && (
                    <p className="mt-1 text-[11px] text-slate-500">
                      좌우 버튼을 눌러 다른 사진을 확인할 수 있습니다.
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
    </div>
  );
};

