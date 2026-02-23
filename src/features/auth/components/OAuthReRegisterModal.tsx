/**
 * OAuth 재가입 모달 컴포넌트
 * 카카오/구글 OAuth 리다이렉트 페이지에서 공통으로 사용하는 재가입 확인 모달
 */

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface OAuthReRegisterModalProps {
  pendingEmail: string | null;
  reRegisterMessage: string;
  isReRegistering: boolean;
  onConfirm: () => void;
}

export const OAuthReRegisterModal = ({
  pendingEmail,
  reRegisterMessage,
  isReRegistering,
  onConfirm,
}: OAuthReRegisterModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg-primary px-4 py-10 text-text-primary">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-orange-300/30 via-orange-200/20 to-amber-100/20 blur-3xl animate-gradient" />
        <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-orange-200/20 via-amber-100/15 to-transparent blur-3xl animate-gradient" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[32px] border border-border-default bg-bg-surface p-8 shadow-2xl shadow-black/10">
          <h2 className="mb-4 text-2xl font-bold text-text-primary text-center">{t('oauth.reRegister.title')}</h2>
          <p className="mb-6 text-text-secondary text-center">
            {reRegisterMessage}
          </p>
          <div className="mb-6 rounded-2xl border border-border-default bg-bg-primary p-4">
            <p className="text-sm text-text-secondary">{t('oauth.reRegister.emailLabel')}</p>
            <p className="text-lg font-semibold text-text-primary">
              {pendingEmail ?? t('oauth.reRegister.emailNotFound')}
            </p>
            <p className="mt-2 text-xs text-text-tertiary">
              {t('oauth.reRegister.confirmDescription')}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/login')}
              disabled={isReRegistering}
              className="flex-1 rounded-2xl border border-border-default bg-transparent px-4 py-3 text-text-primary hover:bg-bg-hover transition disabled:opacity-50"
            >
              {t('oauth.reRegister.cancel')}
            </button>
            <button
              onClick={onConfirm}
              disabled={isReRegistering}
              className="flex-1 rounded-2xl bg-brand-primary px-4 py-3 text-text-inverse shadow-[0_10px_40px_rgba(255,107,53,0.35)] hover:shadow-[0_15px_45px_rgba(255,107,53,0.45)] hover:-translate-y-0.5 transition disabled:opacity-50"
            >
              {isReRegistering ? t('oauth.reRegister.processing') : t('oauth.reRegister.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
