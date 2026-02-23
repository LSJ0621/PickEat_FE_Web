/**
 * 가게 선택 모달 컴포넌트
 * AI 추천 가게 목록에서 방문할 가게를 선택할 수 있는 다이얼로그
 */

import { Button } from '@/components/common/Button';
import { ModalCloseButton } from '@/components/common/ModalCloseButton';
import { useModalAnimation } from '@/hooks/common/useModalAnimation';
import { useModalScrollLock } from '@/hooks/common/useModalScrollLock';
import { useEscapeKey } from '@/hooks/common/useEscapeKey';
import { useFocusTrap } from '@/hooks/common/useFocusTrap';
import type { PlaceRecommendationItem, PlaceRecommendationItemV2 } from '@/types/menu';
import { Z_INDEX } from '@/utils/constants';
import { formatMultilingualName } from '@/utils/format';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PlaceSelectionModalProps {
  open: boolean;
  searchPlaces: PlaceRecommendationItem[];
  communityPlaces: PlaceRecommendationItemV2[];
  onClose: () => void;
  onSelect: (place: PlaceRecommendationItem) => Promise<void>;
  isSelecting: boolean;
}

export const PlaceSelectionModal = ({
  open,
  searchPlaces,
  communityPlaces,
  onClose,
  onSelect,
  isSelecting,
}: PlaceSelectionModalProps) => {
  const [selectedPlace, setSelectedPlace] = useState<PlaceRecommendationItem | null>(null);
  const { isAnimating, shouldRender } = useModalAnimation(open);
  useModalScrollLock(open);
  const focusTrapRef = useFocusTrap(open);

  // 모달 닫힐 때 선택 초기화
  useEffect(() => {
    if (!open) {
      setSelectedPlace(null);
    }
  }, [open]);

  useEscapeKey(onClose, open);

  const handleConfirm = useCallback(async () => {
    if (!selectedPlace || isSelecting) return;
    await onSelect(selectedPlace);
  }, [selectedPlace, isSelecting, onSelect]);

  if (!shouldRender) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 flex items-end md:items-center md:justify-center bg-black/40 backdrop-blur-sm p-4 ${
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
      }`}
      style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={focusTrapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-selection-title"
        className={`relative w-full max-w-md rounded-t-2xl md:rounded-2xl border border-border-default bg-bg-surface p-6 shadow-2xl ${
          isAnimating ? 'modal-content-enter' : 'modal-content-exit'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalCloseButton onClose={onClose} />

        <div className="space-y-4">
          {/* Mobile handle */}
          <div className="flex justify-center pb-2 md:hidden">
            <div className="h-1 w-12 rounded-full bg-border-default" />
          </div>

          <div>
            <h3 id="place-selection-title" className="text-xl font-semibold text-text-primary">
              가게 선택하기
            </h3>
            <p className="mt-1 text-sm text-text-tertiary">방문할 가게를 선택하세요</p>
          </div>

          <div className="max-h-72 space-y-4 overflow-y-auto custom-scroll">
            {/* 검색 추천 섹션 */}
            {searchPlaces.length > 0 && (
              <section className="space-y-2">
                <h4 className="flex items-center gap-2 text-xs font-semibold text-orange-200">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  검색 추천
                </h4>
                <div className="space-y-2">
                  {searchPlaces.map((place) => {
                    const selected = selectedPlace?.placeId === place.placeId;
                    return (
                      <button
                        key={place.placeId}
                        type="button"
                        onClick={() => setSelectedPlace(place)}
                        className={`w-full rounded-xl border p-4 text-left transition-all duration-150 ${
                          selected
                            ? 'border-brand-primary/60 bg-brand-primary/10'
                            : 'border-border-default bg-bg-surface hover:border-border-focus/40 hover:bg-bg-hover'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150 ${
                              selected
                                ? 'border-brand-primary bg-brand-primary'
                                : 'border-border-default bg-transparent'
                            }`}
                          >
                            {selected && <div className="h-2 w-2 rounded-full bg-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-text-primary">
                              {formatMultilingualName(place.name, place.localizedName)}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 커뮤니티 추천 섹션 */}
            {communityPlaces.length > 0 && (
              <section className="space-y-2">
                <h4 className="flex items-center gap-2 text-xs font-semibold text-blue-200">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  커뮤니티 추천
                </h4>
                <div className="space-y-2">
                  {communityPlaces.map((place) => {
                    const selected = selectedPlace?.placeId === place.placeId;
                    return (
                      <button
                        key={place.placeId}
                        type="button"
                        onClick={() => setSelectedPlace(place)}
                        className={`w-full rounded-xl border p-4 text-left transition-all duration-150 ${
                          selected
                            ? 'border-brand-primary/60 bg-brand-primary/10'
                            : 'border-border-default bg-bg-surface hover:border-border-focus/40 hover:bg-bg-hover'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150 ${
                              selected
                                ? 'border-brand-primary bg-brand-primary'
                                : 'border-border-default bg-transparent'
                            }`}
                          >
                            {selected && <div className="h-2 w-2 rounded-full bg-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-text-primary">
                              {formatMultilingualName(place.name, place.localizedName)}
                            </span>
                            {(place.rating !== undefined && place.rating !== null) && (
                              <div className="flex items-center gap-2 mt-0.5">
                                <div className="flex items-center gap-1">
                                  <svg
                                    className="h-3.5 w-3.5 text-yellow-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span className="text-xs font-medium text-text-secondary">
                                    {place.rating.toFixed(1)}
                                  </span>
                                </div>
                                {place.reviewCount !== undefined && place.reviewCount !== null && (
                                  <span className="text-xs text-text-tertiary">
                                    ({place.reviewCount})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="ghost" size="lg" onClick={onClose} className="flex-1">
              취소
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleConfirm}
              isLoading={isSelecting}
              disabled={!selectedPlace || isSelecting}
              className="flex-1"
            >
              선택 완료
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
