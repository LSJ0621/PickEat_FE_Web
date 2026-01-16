/**
 * 버그 제보 이미지 갤러리 컴포넌트
 */

import { MAP_CONFIG } from '@/utils/constants';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface BugReportImageGalleryProps {
  /**
   * S3 이미지 URL 리스트
   */
  images: string[];
}

export const BugReportImageGallery = ({ images }: BugReportImageGalleryProps) => {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageTransition, setImageTransition] = useState<'fade' | 'none'>('none');

  // 이미지가 변경되면 인덱스 초기화 (derived state pattern)
  useEffect(() => {
    if (images && images.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentImageIndex(0);
    }
  }, [images]);

  if (!images || images.length === 0) {
    return null;
  }

  const handlePreviousImage = () => {
    if (images.length > 0) {
      setImageTransition('fade');
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        setTimeout(() => setImageTransition('none'), MAP_CONFIG.TIMEOUT.PHOTO_TRANSITION);
      }, 150);
    }
  };

  const handleNextImage = () => {
    if (images.length > 0) {
      setImageTransition('fade');
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        setTimeout(() => setImageTransition('none'), MAP_CONFIG.TIMEOUT.PHOTO_TRANSITION);
      }, 150);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-100">{t('bugReport.gallery.title')}</h4>
      <div className="relative">
        <div className="relative h-64 w-full overflow-hidden rounded-xl bg-slate-800">
          <img
            src={images[currentImageIndex]}
            alt={t('bugReport.gallery.imageAlt', { index: currentImageIndex + 1 })}
            className={`h-full w-full object-contain transition-opacity duration-300 ${
              imageTransition === 'fade' ? 'opacity-0' : 'opacity-100'
            }`}
            loading="lazy"
            decoding="async"
          />
          {/* 이미지 카운터 */}
          <div className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
          {/* 이전 버튼 */}
          {images.length > 1 && (
            <button
              onClick={handlePreviousImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80 backdrop-blur-sm"
              aria-label={t('bugReport.gallery.previous')}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {/* 다음 버튼 */}
          {images.length > 1 && (
            <button
              onClick={handleNextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80 backdrop-blur-sm"
              aria-label={t('bugReport.gallery.next')}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        {/* 썸네일 인디케이터 (선택적) */}
        {images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {images.map((imageUrl, index) => (
              <button
                key={index}
                onClick={() => {
                  setImageTransition('fade');
                  setTimeout(() => {
                    setCurrentImageIndex(index);
                    setTimeout(() => setImageTransition('none'), MAP_CONFIG.TIMEOUT.PHOTO_TRANSITION);
                  }, 150);
                }}
                className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  index === currentImageIndex
                    ? 'border-pink-500'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <img
                  src={imageUrl}
                  alt={t('bugReport.gallery.thumbnailAlt', { index: index + 1 })}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

