import { Button } from '@/components/common/Button';
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
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-slate-900/95 p-8 shadow-2xl shadow-black/50 backdrop-blur">
        <div className="space-y-4">
          {/* 제목과 메시지 */}
          <div className="text-center">
            <p className="text-xl font-semibold text-white">{title || t('common.notification')}</p>
            <p className="mt-3 text-base text-slate-200 leading-relaxed">{message}</p>
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
    </div>
  );
};
