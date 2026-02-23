/**
 * RatingPromptModal 컴포넌트
 * 사용자가 선택한 가게를 평가하도록 유도하는 모달
 */

import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@shared/components/Button';
import { useModalAnimation } from '@shared/hooks/useModalAnimation';
import { useModalScrollLock } from '@shared/hooks/useModalScrollLock';
import { useFocusTrap } from '@shared/hooks/useFocusTrap';
import { useEscapeKey } from '@shared/hooks/useEscapeKey';
import { Z_INDEX } from '@shared/utils/constants';

interface RatingPromptModalProps {
  open: boolean;
  placeName: string;
  onGoToHistory: () => void;
  onSkipPlace: () => void;
  onDismiss: () => void;
  onNeverShow: () => void;
  isSubmitting: boolean;
}

export function RatingPromptModal({
  open,
  placeName,
  onGoToHistory,
  onSkipPlace,
  onDismiss,
  onNeverShow,
  isSubmitting,
}: RatingPromptModalProps) {
  const { t } = useTranslation();
  const { isAnimating, shouldRender } = useModalAnimation(open);
  useModalScrollLock(open);
  const focusTrapRef = useFocusTrap(open);

  useEscapeKey(onDismiss, open);

  if (!shouldRender) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 flex items-end md:items-center md:justify-center bg-black/40 backdrop-blur-sm p-4 ${
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
      }`}
      style={{ zIndex: Z_INDEX.PRIORITY_MODAL }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onDismiss();
      }}
    >
      <div
        ref={focusTrapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rating-prompt-title"
        className={`relative w-full max-w-md rounded-t-2xl md:rounded-2xl bg-bg-surface p-6 shadow-xl md:border md:border-border-default ${
          isAnimating ? 'modal-content-enter' : 'modal-content-exit'
        }`}
      >
        {/* Close button */}
        <button
          onClick={onDismiss}
          disabled={isSubmitting}
          className="absolute right-4 top-4 rounded-full p-1.5 text-text-tertiary transition-all duration-150 hover:bg-bg-hover hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          aria-label={t('common.close')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="space-y-5">
          {/* Mobile handle */}
          <div className="flex justify-center pb-1 md:hidden">
            <div className="h-1 w-12 rounded-full bg-border-default" />
          </div>

          {/* Title */}
          <div className="text-center pt-2 pr-6">
            <h2 id="rating-prompt-title" className="text-xl font-bold text-text-primary">
              {placeName}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">{t('rating.promptMessage')}</p>
          </div>

          {/* Main action buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onSkipPlace}
              disabled={isSubmitting}
              size="lg"
              variant="outline"
              className="flex-1"
            >
              {t('rating.didNotVisit')}
            </Button>
            <Button
              onClick={onGoToHistory}
              disabled={isSubmitting}
              size="lg"
              variant="primary"
              className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white"
            >
              {t('rating.goToRate')}
            </Button>
          </div>

          {/* Dismiss links */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={onDismiss}
              disabled={isSubmitting}
              className="text-sm text-gray-400 underline transition-colors hover:text-gray-500 focus:outline-none disabled:opacity-50"
            >
              {t('rating.dismiss')}
            </button>
            <button
              type="button"
              onClick={onNeverShow}
              disabled={isSubmitting}
              className="text-xs text-gray-400 transition-colors hover:text-gray-500 focus:outline-none disabled:opacity-50"
            >
              {t('rating.neverShowAgain')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
