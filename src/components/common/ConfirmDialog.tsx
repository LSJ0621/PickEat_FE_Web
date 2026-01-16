import { Button } from '@/components/common/Button';
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
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-slate-900/95 p-8 shadow-2xl shadow-black/50 backdrop-blur">
        <div className="space-y-4">
          {/* 제목과 메시지 */}
          <div className="text-center">
            <p className="text-xl font-semibold text-white">{title || t('common.confirm')}</p>
            <p className="mt-3 text-base text-slate-200 leading-relaxed">{message}</p>
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
    </div>
  );
};
