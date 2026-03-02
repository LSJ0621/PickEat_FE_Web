import { PlaceDetailHeader } from './PlaceDetailHeader';
import { PlaceDetailBody } from './PlaceDetailBody';
import { usePlaceDetails } from '@features/agent/hooks/usePlaceDetails';
import { useModalAnimation } from '@shared/hooks/useModalAnimation';
import { useModalScrollLock } from '@shared/hooks/useModalScrollLock';
import { useEscapeKey } from '@shared/hooks/useEscapeKey';
import { useFocusTrap } from '@shared/hooks/useFocusTrap';
import { MAP_CONFIG, Z_INDEX } from '@shared/utils/constants';
import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

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
  const { status, errorMessage, placeDetail } = usePlaceDetails(placeId);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photoTransition, setPhotoTransition] = useState<'fade' | 'none'>('none');
  const photoTimerRef = useRef<number | null>(null);
  const photoTransitionTimerRef = useRef<number | null>(null);
  const isOpen = !!placeId;
  const { isAnimating, shouldRender, isClosing } = useModalAnimation(isOpen);
  useModalScrollLock(isOpen);
  const modalContentRef = useFocusTrap(isOpen);
  const scrollContentRef = useRef<HTMLDivElement>(null);

  // 사진 인덱스 초기화
  useEffect(() => {
    if (placeDetail?.photos && placeDetail.photos.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPhotoIndex(0);
    }
  }, [placeDetail?.photos]);

  // 모달이 열릴 때 스크롤 위치를 맨 위로 초기화
  useEffect(() => {
    if (placeId && scrollContentRef.current) {
      if (status === 'ready') {
        requestAnimationFrame(() => {
          if (scrollContentRef.current) {
            scrollContentRef.current.scrollTop = 0;
          }
        });
      } else {
        const timer = setTimeout(() => {
          if (scrollContentRef.current) {
            scrollContentRef.current.scrollTop = 0;
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
      className={`fixed inset-0 flex items-end md:items-center md:justify-center bg-black/40 backdrop-blur-sm p-0 md:p-6 ${
        isAnimating ? 'modal-backdrop-enter' : isClosing ? 'modal-backdrop-exit' : 'opacity-0'
      }`}
      style={{ zIndex: Z_INDEX.PRIORITY_MODAL }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalContentRef}
        className={`relative w-full max-w-2xl max-h-[90dvh] md:max-h-[90vh] rounded-t-2xl md:rounded-2xl border border-border-default bg-bg-surface text-text-primary shadow-2xl flex flex-col ${
          isAnimating ? 'modal-content-responsive-enter' : isClosing ? 'modal-content-responsive-exit' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더: 항상 고정 표시 */}
        <div className="flex-shrink-0 px-6 pt-6 pb-2">
          <PlaceDetailHeader
            placeName={placeName}
            localizedName={localizedName}
            placeDetail={placeDetail}
            onClose={onClose}
          />
        </div>

        {/* 스크롤 영역 */}
        <div ref={scrollContentRef} className="flex-1 overflow-y-auto px-6 pb-6 custom-scroll">
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
            <PlaceDetailBody
              placeDetail={placeDetail}
              placeName={placeName}
              searchName={searchName}
              searchAddress={searchAddress}
              currentPhotoIndex={currentPhotoIndex}
              photoTransition={photoTransition}
              onPreviousPhoto={handlePreviousPhoto}
              onNextPhoto={handleNextPhoto}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
