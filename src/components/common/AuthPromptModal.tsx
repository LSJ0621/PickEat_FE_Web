import { Button } from '@/components/common/Button';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AuthPromptModalProps {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
  message?: string;
}

export const AuthPromptModal = ({ open, onConfirm, onClose, message }: AuthPromptModalProps) => {
  const { t } = useTranslation();
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(open);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRender(true);
      // 다음 프레임에서 애니메이션 시작
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      // 애니메이션 완료 후 언마운트
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!shouldRender) {
    return null;
  }

  return createPortal(
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 ${
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
      }`}
    >
      <div
        className={`w-full max-w-md rounded-[28px] border border-white/10 bg-slate-900/95 p-8 shadow-2xl shadow-black/50 ${
          isAnimating ? 'modal-content-enter' : 'modal-content-exit'
        }`}
      >
        <p className="text-center text-lg font-semibold text-white">{t('auth.loginRequired.title')}</p>
        <p className="mt-3 text-center text-sm text-slate-300">
          {message ?? t('auth.loginRequired.message')}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button onClick={onConfirm} size="lg">
            {t('auth.loginRequired.goToLogin')}
          </Button>
          <Button variant="ghost" size="lg" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

