import { Button } from '@shared/components/Button';
import { useModalAnimation } from '@shared/hooks/useModalAnimation';
import { useModalScrollLock } from '@shared/hooks/useModalScrollLock';
import { Z_INDEX } from '@shared/utils/constants';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface AuthPromptModalProps {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
  message?: string;
}

export const AuthPromptModal = ({ open, onConfirm, onClose, message }: AuthPromptModalProps) => {
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
        className={`w-full max-w-md rounded-[28px] border border-border-default bg-bg-surface p-8 shadow-2xl shadow-black/20 transition-all duration-300 ${
          isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{ zIndex: Z_INDEX.MODAL_CONTENT }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-prompt-title"
        aria-describedby="auth-prompt-message"
      >
        <p id="auth-prompt-title" className="text-center text-lg font-semibold text-text-primary">
          {t('auth.loginRequired.title')}
        </p>
        <p id="auth-prompt-message" className="mt-3 text-center text-sm text-text-secondary">
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
