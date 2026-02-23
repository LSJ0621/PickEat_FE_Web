/**
 * 재가입 폼 섹션 컴포넌트
 * 이름 입력 및 재가입 버튼을 제공합니다.
 */

import { useTranslation } from 'react-i18next';
import { Button } from '@shared/components/Button';

interface ReRegisterFormSectionProps {
  name: string;
  nameError?: string;
  onNameChange: (name: string) => void;
  onReRegister: () => void;
  isLoading: boolean;
  isEmailVerified: boolean;
  onBackToLogin?: () => void;
}

export const ReRegisterFormSection = ({
  name,
  nameError,
  onNameChange,
  onReRegister,
  isLoading,
  isEmailVerified,
  onBackToLogin,
}: ReRegisterFormSectionProps) => {
  const { t } = useTranslation();

  return (
    <>
      {/* 이름 */}
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-text-primary">
          {t('auth.name')}
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t('auth.namePlaceholder')}
          className="w-full rounded-2xl border border-border-default bg-bg-secondary px-4 py-3 text-text-primary placeholder-text-placeholder transition focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
        />
        {nameError && <p className="mt-1 text-sm text-red-400">{nameError}</p>}
      </div>

      {/* 재가입 버튼 */}
      <Button
        onClick={onReRegister}
        isLoading={isLoading}
        disabled={!isEmailVerified}
        size="lg"
        className="w-full bg-gradient-to-r from-brand-primary to-rose-500 text-text-inverse shadow-md shadow-brand-primary/30 disabled:opacity-50"
      >
        {t('oauth.reRegister.confirm')}
      </Button>

      {/* 로그인 링크 */}
      {onBackToLogin && (
        <div className="text-center">
          <button
            onClick={onBackToLogin}
            className="text-sm text-text-tertiary hover:text-text-primary transition"
          >
            {t('oauth.reRegister.backToLogin')}
          </button>
        </div>
      )}
    </>
  );
};
