/**
 * 이메일 인증 섹션 컴포넌트
 * 이메일 입력, 중복 확인, 인증번호 발송 및 검증 UI를 제공합니다.
 */

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UseEmailVerificationReturn } from '@/hooks/auth/useEmailVerification';

interface EmailVerificationSectionProps {
  emailVerification: UseEmailVerificationReturn;
  emailError?: string;
  verificationCodeError?: string;
  onEmailChange?: (email: string) => void;
  onVerificationCodeChange?: (code: string) => void;
}

export const EmailVerificationSection = ({
  emailVerification,
  emailError,
  verificationCodeError,
  onEmailChange,
  onVerificationCodeChange,
}: EmailVerificationSectionProps) => {
  const { t } = useTranslation();

  const handleEmailChange = (newEmail: string) => {
    emailVerification.setEmail(newEmail);
    if (onEmailChange) {
      onEmailChange(newEmail);
    }
  };

  const handleVerificationCodeChange = (code: string) => {
    emailVerification.setVerificationCode(code);
    if (onVerificationCodeChange) {
      onVerificationCodeChange(code);
    }
  };

  const isVerifyButtonDisabled =
    emailVerification.verifyCodeLoading ||
    !emailVerification.isCodeSent ||
    emailVerification.isEmailVerified ||
    !emailVerification.verificationCode.trim();

  const verifyButtonClass = isVerifyButtonDisabled
    ? 'rounded-2xl bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-placeholder cursor-not-allowed transition'
    : 'rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/30 hover:brightness-110 transition';

  return (
    <>
      {/* 이메일 입력 */}
      <div>
        <Label htmlFor="email" className="mb-2 block text-text-primary">
          {t('auth.email')}
        </Label>
        <div className="flex gap-2">
          <Input
            id="email"
            type="email"
            value={emailVerification.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder={t('auth.emailPlaceholder')}
            className={`flex-1 rounded-2xl border ${
              emailError || emailVerification.emailError
                ? 'border-red-500/60'
                : emailVerification.emailAvailable === true
                ? 'border-green-400'
                : 'border-border-default'
            } bg-bg-secondary px-4 py-3 text-text-primary placeholder-text-placeholder transition focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-0`}
          />
          <button
            onClick={emailVerification.handleEmailAction}
            disabled={emailVerification.isEmailActionDisabled()}
            className={`shrink-0 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              emailVerification.emailChecked && emailVerification.emailAvailable === true
                ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-md shadow-pink-500/30 hover:brightness-110 disabled:opacity-60 disabled:brightness-100'
                : 'border border-border-default bg-bg-secondary text-text-primary hover:bg-bg-hover disabled:opacity-50'
            }`}
          >
            {emailVerification.getEmailActionLabel()}
          </button>
        </div>
        {(emailError || emailVerification.emailError) && (
          <p className="mt-1 text-sm text-red-400">{emailError || emailVerification.emailError}</p>
        )}
        {emailVerification.emailAvailable === true && (
          <p className="mt-1 text-sm text-green-400">{t('emailVerification.emailAvailable')}</p>
        )}
      </div>

      {/* 이메일 인증 */}
      <div>
        {emailVerification.isCodeSent && !emailVerification.isEmailVerified && (
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
            <span>{t('emailVerification.didNotReceive')}</span>
            <button
              type="button"
              onClick={emailVerification.handleSendVerificationCode}
              className="font-medium text-pink-300 underline decoration-2 decoration-pink-400/50 underline-offset-4 transition hover:text-pink-100 hover:decoration-pink-300 hover:decoration-2"
            >
              {t('emailVerification.resendLink')}
            </button>
          </div>
        )}
        <div className="text-sm font-medium text-text-primary">{t('emailVerification.title')}</div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={emailVerification.verificationCode}
            onChange={(e) => handleVerificationCodeChange(e.target.value)}
            placeholder={t('emailVerification.codePlaceholder')}
            disabled={!emailVerification.isCodeSent || emailVerification.isEmailVerified}
            className={`min-w-0 flex-1 rounded-2xl border ${
              verificationCodeError || emailVerification.emailError
                ? 'border-red-500/60'
                : emailVerification.isEmailVerified
                ? 'border-green-400'
                : 'border-border-default'
            } bg-bg-secondary px-4 py-3 text-text-primary placeholder-text-placeholder transition focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-0 disabled:opacity-60`}
          />
          <Button
            onClick={emailVerification.handleVerifyCode}
            isLoading={emailVerification.verifyCodeLoading}
            disabled={isVerifyButtonDisabled}
            size="sm"
            className={verifyButtonClass}
          >
            {t('common.confirm')}
          </Button>
        </div>
        {emailVerification.verificationMessage && (
          <p
            className={`mt-2 text-sm ${
              emailVerification.verificationMessageVariant === 'error'
                ? 'text-red-400'
                : 'text-green-400'
            }`}
          >
            {emailVerification.verificationMessage}
          </p>
        )}
        {verificationCodeError && (
          <p className="mt-2 text-sm text-red-400">{verificationCodeError}</p>
        )}
      </div>
    </>
  );
};
