import { Button } from '@shared/components/Button';
import { useModalAnimation } from '@shared/hooks/useModalAnimation';
import { useModalScrollLock } from '@shared/hooks/useModalScrollLock';
import { Z_INDEX } from '@shared/utils/constants';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'info';
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
  variant = 'info',
}: ConfirmDialogProps) => {
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
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <div className="space-y-4">
          {/* 제목과 메시지 */}
          <div className="text-center">
            <p id="confirm-dialog-title" className="text-xl font-semibold text-text-primary">
              {title || t('common.confirm')}
            </p>
            <p id="confirm-dialog-message" className="mt-3 text-base text-text-secondary leading-relaxed">
              {message}
            </p>
          </div>

          {/* 버튼들 */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onCancel}
              size="lg"
              variant="ghost"
              className="flex-1"
            >
              {cancelLabel || t('common.cancel')}
            </Button>
            <Button
              onClick={onConfirm}
              size="lg"
              variant={variant === 'danger' ? 'secondary' : 'primary'}
              className={variant === 'danger' ? 'flex-1 bg-red-600 hover:bg-red-700 text-white' : 'flex-1'}
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
