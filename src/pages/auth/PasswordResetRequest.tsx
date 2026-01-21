import { authService } from '@/api/services/auth';
import { Button } from '@/components/common/Button';
import { StatusPopupCard } from '@/components/common/StatusPopupCard';
import { getApiSuccessMessage, getApiErrorMessage } from '@/utils/translateMessage';
import { isEmpty } from '@/utils/validation';
import { ERROR_MESSAGES } from '@/utils/constants';
import { isAxiosError } from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
    const minutes = Math.floor(cooldownRemaining / 60)
      .toString()
      .padStart(2, '0');
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
          response.remainCount !== undefined ? { count: response.remainCount } : undefined
        )
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
          if (typeof retryAfter === 'number') {
            setCooldownRemaining(Math.ceil(retryAfter));
          }
          if (typeof remain === 'number') {
            setRemainCount(remain);
          }
        } else {
          setPopup({
            open: true,
            title: t('passwordReset.request.sendCodeFailed'),
            message,
            variant: 'error',
          });
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
        setErrors((prev) => ({ ...prev, code: getApiErrorMessage(response, t('passwordReset.request.error.verifyFailed')) }));
      }
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        const status = error.response.status;
        const message = getApiErrorMessage(error, t('passwordReset.request.error.verifyFailed'));
        if (status === 400) {
          setErrors((prev) => ({ ...prev, code: message }));
        } else {
          setPopup({
            open: true,
            title: t('passwordReset.request.verifyFailed'),
            message,
            variant: 'error',
          });
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
    <div className="relative min-h-screen bg-slate-950 px-4 py-12 text-white">
      <StatusPopupCard
        open={popup.open}
        title={popup.title}
        message={popup.message}
        variant={popup.variant}
        onConfirm={closePopup}
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-orange-400/40 via-pink-500/30 to-purple-600/30 blur-3xl animate-gradient" />
        <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-sky-500/30 via-emerald-400/20 to-transparent blur-3xl animate-gradient" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-xl">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-pink-500 to-fuchsia-600 text-2xl font-bold text-slate-950 shadow-lg shadow-orange-500/30">
              P
            </div>
            <p className="text-sm uppercase tracking-[0.4em] text-orange-200/80">Password Reset</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">{t('passwordReset.request.title')}</h1>
            <p className="mt-2 text-sm text-slate-300">
              {t('passwordReset.request.description')}
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="reset-email" className="mb-2 block text-sm font-medium text-slate-200">
                {t('passwordReset.request.email.label')}
              </label>
              <div className="flex gap-2">
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder={t('passwordReset.request.email.placeholder')}
                  className={`flex-1 rounded-2xl border ${
                    errors.email ? 'border-red-500/60' : 'border-white/15'
                  } bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60`}
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
              {infoMessage && <p className="mt-2 text-sm text-emerald-200">{infoMessage}</p>}
              {remainCount !== null && remainCount <= 0 && (
                <p className="mt-1 text-sm text-red-400">{t('passwordReset.request.error.limitReached')}</p>
              )}
            </div>

            <div>
              <label htmlFor="reset-code" className="mb-2 block text-sm font-medium text-slate-200">
                {t('passwordReset.request.code.label')}
              </label>
              <div className="flex gap-2">
                <input
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
                  className={`flex-1 rounded-2xl border ${
                    errors.code ? 'border-red-500/60' : 'border-white/15'
                  } bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60`}
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
              <p className="mt-2 text-xs text-slate-400">
                {t('passwordReset.request.code.hint')}
              </p>
              {errors.code && <p className="mt-1 text-sm text-red-400">{errors.code}</p>}
            </div>

            <div className="text-center text-sm text-slate-300">
              {t('passwordReset.request.loginHint')}{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-semibold text-white transition hover:text-orange-200"
              >
                {t('passwordReset.request.backToLogin')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
