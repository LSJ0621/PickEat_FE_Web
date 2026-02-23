import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isAxiosError } from 'axios';
import { authService } from '@features/auth/api';
import { Button } from '@shared/components/Button';
import { PageContainer } from '@shared/components/PageContainer';
import { StatusPopupCard } from '@shared/components/StatusPopupCard';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { getApiSuccessMessage, getApiErrorMessage } from '@shared/utils/translateMessage';
import { isEmpty } from '@shared/utils/validation';
import { ERROR_MESSAGES } from '@shared/utils/constants';

const RESET_EMAIL_STORAGE_KEY = 'resetPasswordEmail';

export const PasswordResetRequestPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => sessionStorage.getItem(RESET_EMAIL_STORAGE_KEY) ?? '');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [remainCount, setRemainCount] = useState<number | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; code?: string }>({});
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [popup, setPopup] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant?: 'error' | 'info';
  }>({ open: false, title: '', message: '', variant: 'info' });

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  useEffect(() => {
    if (email.trim()) {
      sessionStorage.setItem(RESET_EMAIL_STORAGE_KEY, email.trim());
    }
  }, [email]);

  const formattedCooldown = useMemo(() => {
    if (cooldownRemaining <= 0) return '';
    const minutes = Math.floor(cooldownRemaining / 60).toString().padStart(2, '0');
    const seconds = (cooldownRemaining % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [cooldownRemaining]);

  const handleSendCode = async () => {
    if (isEmpty(email)) {
      setErrors((prev) => ({ ...prev, email: ERROR_MESSAGES.EMAIL_REQUIRED }));
      return;
    }
    setErrors((prev) => ({ ...prev, email: undefined }));
    setInfoMessage(null);
    setSendingCode(true);
    try {
      const response = await authService.sendPasswordResetCode(email.trim());
      setIsCodeSent(true);
      setInfoMessage(
        getApiSuccessMessage(
          response,
          response.remainCount !== undefined ? { count: response.remainCount } : undefined,
        ),
      );
      if (typeof response.retryAfter === 'number') {
        setCooldownRemaining(Math.ceil(response.retryAfter));
      }
      if (typeof response.remainCount === 'number') {
        setRemainCount(response.remainCount);
      }
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        const status = error.response.status;
        const message = getApiErrorMessage(error, t('passwordReset.request.error.sendFailed'));
        if (status === 400) {
          setErrors((prev) => ({ ...prev, email: message }));
        } else if (status === 429) {
          setInfoMessage(message);
          const retryAfter = error.response.data?.retryAfter;
          const remain = error.response.data?.remainCount;
          if (typeof retryAfter === 'number') setCooldownRemaining(Math.ceil(retryAfter));
          if (typeof remain === 'number') setRemainCount(remain);
        } else {
          setPopup({ open: true, title: t('passwordReset.request.sendCodeFailed'), message, variant: 'error' });
        }
      } else {
        setPopup({
          open: true,
          title: t('passwordReset.request.sendCodeFailed'),
          message: getApiErrorMessage(error, t('passwordReset.request.error.sendFailed')),
          variant: 'error',
        });
      }
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (isEmpty(email)) {
      setErrors((prev) => ({ ...prev, email: ERROR_MESSAGES.EMAIL_REQUIRED }));
      return;
    }
    if (isEmpty(code)) {
      setErrors((prev) => ({ ...prev, code: ERROR_MESSAGES.VERIFICATION_CODE_REQUIRED }));
      return;
    }
    setErrors((prev) => ({ ...prev, code: undefined }));
    setVerifying(true);
    try {
      const response = await authService.verifyPasswordResetCode(email.trim(), code.trim());
      if (response.success) {
        sessionStorage.setItem(RESET_EMAIL_STORAGE_KEY, email.trim());
        navigate(`/password/reset?email=${encodeURIComponent(email.trim())}`);
      } else {
        setErrors((prev) => ({
          ...prev,
          code: getApiErrorMessage(response, t('passwordReset.request.error.verifyFailed')),
        }));
      }
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        const status = error.response.status;
        const message = getApiErrorMessage(error, t('passwordReset.request.error.verifyFailed'));
        if (status === 400) {
          setErrors((prev) => ({ ...prev, code: message }));
        } else {
          setPopup({ open: true, title: t('passwordReset.request.verifyFailed'), message, variant: 'error' });
        }
      } else {
        setPopup({
          open: true,
          title: t('passwordReset.request.verifyFailed'),
          message: getApiErrorMessage(error, t('passwordReset.request.error.verifyFailed')),
          variant: 'error',
        });
      }
    } finally {
      setVerifying(false);
    }
  };

  const closePopup = () => setPopup((prev) => ({ ...prev, open: false }));

  const sendButtonDisabled =
    sendingCode || cooldownRemaining > 0 || (remainCount !== null && remainCount <= 0);

  return (
    <PageContainer maxWidth="max-w-md" className="flex min-h-screen flex-col items-center justify-center py-12">
      <StatusPopupCard
        open={popup.open}
        title={popup.title}
        message={popup.message}
        variant={popup.variant}
        onConfirm={closePopup}
      />

      <div className="w-full">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-3xl font-bold text-white shadow-lg shadow-orange-500/30">
            P
          </div>
          <p className="text-xs uppercase tracking-widest text-brand-primary">Password Reset</p>
          <h1 className="mt-2 text-2xl font-bold text-text-primary">
            {t('passwordReset.request.title')}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">{t('passwordReset.request.description')}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border-default bg-bg-surface p-6 shadow-lg sm:p-8">
          <div className="space-y-5">
            {/* Email */}
            <div>
              <Label htmlFor="reset-email" className="mb-1.5 block text-text-primary">
                {t('passwordReset.request.email.label')}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder={t('passwordReset.request.email.placeholder')}
                  className={`flex-1 rounded-xl border ${
                    errors.email ? 'border-red-500/60' : 'border-border-default'
                  } bg-bg-primary px-4 py-3 text-text-primary placeholder-text-placeholder transition focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary/30 focus-visible:ring-offset-0`}
                />
                <Button
                  onClick={handleSendCode}
                  disabled={sendButtonDisabled}
                  isLoading={sendingCode}
                  size="sm"
                  className="shrink-0"
                >
                  {cooldownRemaining > 0
                    ? t('passwordReset.request.button.waiting', { time: formattedCooldown })
                    : remainCount !== null
                    ? t('passwordReset.request.button.resendWithCount', { count: remainCount })
                    : isCodeSent
                    ? t('passwordReset.request.button.resend')
                    : t('passwordReset.request.button.sendCode')}
                </Button>
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
              {infoMessage && <p className="mt-2 text-sm text-emerald-600">{infoMessage}</p>}
              {remainCount !== null && remainCount <= 0 && (
                <p className="mt-1 text-sm text-red-400">
                  {t('passwordReset.request.error.limitReached')}
                </p>
              )}
            </div>

            {/* Code */}
            <div>
              <Label htmlFor="reset-code" className="mb-1.5 block text-text-primary">
                {t('passwordReset.request.code.label')}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="reset-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setErrors((prev) => ({ ...prev, code: undefined }));
                  }}
                  placeholder={t('passwordReset.request.code.placeholder')}
                  className={`flex-1 rounded-xl border ${
                    errors.code ? 'border-red-500/60' : 'border-border-default'
                  } bg-bg-primary px-4 py-3 text-text-primary placeholder-text-placeholder transition focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary/30 focus-visible:ring-offset-0`}
                />
                <Button
                  onClick={handleVerifyCode}
                  disabled={!isCodeSent || verifying}
                  isLoading={verifying}
                  size="sm"
                  className="shrink-0"
                >
                  {t('passwordReset.request.button.verify')}
                </Button>
              </div>
              <p className="mt-2 text-xs text-text-tertiary">
                {t('passwordReset.request.code.hint')}
              </p>
              {errors.code && <p className="mt-1 text-sm text-red-400">{errors.code}</p>}
            </div>

            <p className="text-center text-sm text-text-secondary">
              {t('passwordReset.request.loginHint')}{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-semibold text-brand-primary transition hover:text-orange-600"
              >
                {t('passwordReset.request.backToLogin')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
