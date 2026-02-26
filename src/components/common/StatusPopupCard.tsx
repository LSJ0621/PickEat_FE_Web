import { Button } from '@/components/common/Button';
import { useModalAnimation } from '@/hooks/common/useModalAnimation';
import { useModalScrollLock } from '@/hooks/common/useModalScrollLock';
import { Z_INDEX } from '@/utils/constants';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface StatusPopupCardProps {
  open: boolean;
  title?: string;
  message: string;
  code?: string | number;
  onConfirm: () => void;
  confirmLabel?: string;
  variant?: 'error' | 'info';
}

export const StatusPopupCard = ({
  open,
  title,
  message,
  onConfirm,
  confirmLabel,
}: StatusPopupCardProps) => {
  const { t } = useTranslation();
  const { isAnimating, shouldRender } = useModalAnimation(open);
  useModalScrollLock(open);

  if (!shouldRender) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}
    >
      <div
        className={`relative w-full max-w-md rounded-[32px] border border-border-default bg-bg-surface p-8 shadow-2xl shadow-black/20 transition-all duration-300 ${
          isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{ zIndex: Z_INDEX.MODAL_CONTENT }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-popup-title"
        aria-describedby="status-popup-message"
      >
        <div className="space-y-4">
          {/* 제목과 메시지 */}
          <div className="text-center">
            <p id="status-popup-title" className="text-xl font-semibold text-text-primary">
              {title || t('common.notification')}
            </p>
            <p id="status-popup-message" className="mt-3 text-base text-text-secondary leading-relaxed">
              {message}
            </p>
          </div>

          {/* 확인 버튼 */}
          <div className="pt-2">
            <Button
              onClick={onConfirm}
              size="lg"
              className="w-full"
            >
              {confirmLabel || t('common.confirm')}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
