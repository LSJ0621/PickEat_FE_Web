import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { isAxiosError } from 'axios';
import { authService } from '@/api/services/auth';
import { Button } from '@/components/common/Button';
import { PageContainer } from '@/components/common/PageContainer';
import { StatusPopupCard } from '@/components/common/StatusPopupCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ERROR_MESSAGES } from '@/utils/constants';
import { extractErrorMessage } from '@/utils/error';
import { isEmpty, isPasswordMatch } from '@/utils/validation';

const RESET_EMAIL_STORAGE_KEY = 'resetPasswordEmail';

export const PasswordResetPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const validatePassword = (password: string) => {
    if (!password.trim()) return t('passwordReset.validation.required');
    if (password.length < 8) return t('passwordReset.validation.minLength');
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    if (!hasLetter || !hasNumber) return t('passwordReset.validation.combination');
    return '';
  };

  const queryEmail = useMemo(
    () => new URLSearchParams(location.search).get('email') ?? '',
    [location.search],
  );
  const initialEmail = useMemo(
    () => sessionStorage.getItem(RESET_EMAIL_STORAGE_KEY) ?? queryEmail,
    [queryEmail],
  );
  const [email] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant?: 'error' | 'info';
    onConfirm?: () => void;
  }>({ open: false, title: '', message: '', variant: 'info' });

  const closePopup = () => setPopup((prev) => ({ ...prev, open: false, onConfirm: undefined }));

  const goToRequest = () => {
    closePopup();
    navigate('/password/reset/request');
  };

  const goToLogin = () => {
    closePopup();
    navigate('/login');
  };

  const handleSubmit = async () => {
    if (!email) {
      setPopup({
        open: true,
        title: t('passwordReset.error.emailNotFound'),
        message: t('passwordReset.error.restartRequired'),
        variant: 'error',
        onConfirm: goToRequest,
      });
      return;
    }

    const newErrors: typeof errors = {};
    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;
    if (isEmpty(confirmPassword)) {
      newErrors.confirmPassword = ERROR_MESSAGES.CONFIRM_PASSWORD_REQUIRED;
    } else if (!isPasswordMatch(password, confirmPassword)) {
      newErrors.confirmPassword = ERROR_MESSAGES.PASSWORD_MISMATCH;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      const response = await authService.resetPassword({ email, newPassword: password });
      sessionStorage.removeItem(RESET_EMAIL_STORAGE_KEY);
      setPopup({
        open: true,
        title: t('passwordReset.success.title'),
        message: response.message,
        variant: 'info',
        onConfirm: goToLogin,
      });
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        const status = error.response.status;
        const message = error.response.data?.message ?? t('passwordReset.error.changeFailed');
        if (status === 400) {
          setErrors({ password: message });
        } else {
          setPopup({ open: true, title: t('passwordReset.error.title'), message, variant: 'error' });
        }
      } else {
        setPopup({
          open: true,
          title: t('passwordReset.error.title'),
          message: extractErrorMessage(error, t('passwordReset.error.changeFailed')),
          variant: 'error',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer maxWidth="max-w-md" className="flex min-h-screen flex-col items-center justify-center py-12">
      <StatusPopupCard
        open={popup.open}
        title={popup.title}
        message={popup.message}
        variant={popup.variant}
        onConfirm={popup.onConfirm ?? closePopup}
      />

      <div className="w-full">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-3xl font-bold text-white shadow-lg shadow-orange-500/30">
            P
          </div>
          <p className="text-xs uppercase tracking-widest text-brand-primary">Password Reset</p>
          <h1 className="mt-2 text-2xl font-bold text-text-primary">{t('passwordReset.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('passwordReset.description')}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border-default bg-bg-surface p-6 shadow-lg sm:p-8">
          <div className="space-y-5">
            {/* Verified email display */}
            <div className="rounded-xl border border-border-default bg-bg-primary px-4 py-3 text-sm">
              <p className="font-semibold text-text-primary">
                {t('passwordReset.verifiedEmail.label')}
              </p>
              <p className="mt-1 break-all text-brand-primary">
                {email || t('passwordReset.verifiedEmail.notFound')}
              </p>
            </div>

            {/* New Password */}
            <div>
              <Label htmlFor="new-password" className="mb-1.5 block text-text-primary">
                {t('passwordReset.newPassword.label')}
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder={t('passwordReset.newPassword.placeholder')}
                  className={`w-full rounded-xl border pr-10 ${
                    errors.password ? 'border-red-500/60' : 'border-border-default'
                  } bg-bg-primary px-4 py-3 text-text-primary placeholder-text-placeholder transition focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary/30 focus-visible:ring-offset-0`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary transition hover:text-text-secondary"
                  aria-label={showPassword ? t('passwordInput.hide') : t('passwordInput.show')}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-text-tertiary">
                {t('passwordReset.newPassword.hint')}
              </p>
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirm-password" className="mb-1.5 block text-text-primary">
                {t('passwordReset.confirmPassword.label')}
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  placeholder={t('passwordReset.confirmPassword.placeholder')}
                  className={`w-full rounded-xl border pr-10 ${
                    errors.confirmPassword ? 'border-red-500/60' : 'border-border-default'
                  } bg-bg-primary px-4 py-3 text-text-primary placeholder-text-placeholder transition focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary/30 focus-visible:ring-offset-0`}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !submitting) handleSubmit();
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary transition hover:text-text-secondary"
                  aria-label={showConfirmPassword ? t('passwordInput.hide') : t('passwordInput.show')}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              isLoading={submitting}
              disabled={submitting}
              size="lg"
              className="mt-2 w-full"
            >
              {t('passwordReset.button.submit')}
            </Button>

            <p className="text-center text-sm text-text-secondary">
              {t('passwordReset.restartHint')}{' '}
              <button
                onClick={goToRequest}
                className="font-semibold text-brand-primary transition hover:text-orange-600"
              >
                {t('passwordReset.button.resendCode')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
