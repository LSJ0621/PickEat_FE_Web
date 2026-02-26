/**
 * 로그인 페이지
 */

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '@/api/services/auth';
import { Button } from '@/components/common/Button';
import { PageContainer } from '@/components/common/PageContainer';
import { StatusPopupCard } from '@/components/common/StatusPopupCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppDispatch } from '@/store/hooks';
import { initializeAuth, setLoading } from '@/store/slices/authSlice';
import { ERROR_MESSAGES } from '@/utils/constants';
import { getApiErrorMessage } from '@/utils/translateMessage';
import { isEmpty } from '@/utils/validation';

const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
const GOOGLE_SCOPE = 'openid email profile';

export const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorPopup, setErrorPopup] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  const closeErrorPopup = () => {
    setErrorPopup((prev) => ({ ...prev, open: false }));
  };

  const handleKakaoLogin = () => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}&response_type=code`;
    window.location.href = kakaoAuthUrl;
  };

  const handleGoogleLogin = () => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(GOOGLE_SCOPE)}`;
    window.location.href = googleAuthUrl;
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handlePasswordReset = () => {
    navigate('/password/reset/request');
  };

  const handleLogin = async () => {
    if (isSubmitting) {
      return;
    }

    if (isEmpty(email) || isEmpty(password)) {
      setErrorPopup({
        open: true,
        message: ERROR_MESSAGES.EMAIL_AND_PASSWORD_REQUIRED,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      dispatch(setLoading(true));
      const loginData = await authService.login({ email, password });

      if (!loginData.token) {
        throw new Error(t('auth.tokenNotIssued'));
      }

      localStorage.setItem('token', loginData.token);
      await dispatch(initializeAuth()).unwrap();

      const redirectTo = location.state?.redirectTo;
      const safeRedirect =
        redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
          ? redirectTo
          : '/';
      navigate(safeRedirect);
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, t('auth.loginError'));
      setErrorPopup({ open: true, message });
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <PageContainer maxWidth="max-w-md" className="flex min-h-screen flex-col items-center justify-center py-12">
      <StatusPopupCard
        open={errorPopup.open}
        title={t('auth.loginFailed')}
        message={errorPopup.message}
        variant="error"
        onConfirm={closeErrorPopup}
      />

      <div className="w-full">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-3xl font-bold text-white shadow-lg shadow-orange-500/30">
            P
          </div>
          <h1 className="text-2xl font-bold text-text-primary">{t('auth.appTitle')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('auth.appDescription')}</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-border-default bg-bg-surface p-6 shadow-lg sm:p-8">
          <h2 className="mb-6 text-center text-lg font-semibold text-text-primary">
            {t('auth.loginTitle')}
          </h2>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="mb-1.5 block text-text-primary">
                {t('auth.email')}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                className="w-full rounded-xl border border-border-default bg-bg-primary px-4 py-3 text-text-primary placeholder-text-placeholder transition focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary/30 focus-visible:ring-offset-0"
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="mb-1.5 block text-text-primary">
                {t('auth.password')}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  className="w-full rounded-xl border border-border-default bg-bg-primary px-4 py-3 pr-10 text-text-primary placeholder-text-placeholder transition focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary/30 focus-visible:ring-offset-0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isSubmitting) {
                      handleLogin();
                    }
                  }}
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
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              size="lg"
              className="mt-2 w-full"
              disabled={isSubmitting}
            >
              {t('auth.login')}
            </Button>
          </div>

          {/* Links */}
          <div className="mt-5 space-y-3 text-center text-sm">
            <p className="text-text-secondary">
              {t('auth.noAccount')}{' '}
              <button
                onClick={handleRegister}
                className="font-semibold text-brand-primary transition hover:text-orange-600"
              >
                {t('auth.register')}
              </button>
            </p>
            <p className="text-text-tertiary">
              {t('auth.forgotPassword')}{' '}
              <button
                onClick={handlePasswordReset}
                className="font-semibold text-brand-primary underline-offset-4 transition hover:text-orange-600 hover:underline"
                type="button"
              >
                {t('auth.resetPassword')}
              </button>
            </p>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border-default" />
            <span className="text-xs text-text-tertiary">{t('auth.socialLoginTitle')}</span>
            <div className="h-px flex-1 bg-border-default" />
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border-default bg-bg-surface px-4 py-3 text-sm font-semibold text-text-primary transition hover:bg-bg-hover"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t('auth.loginWithGoogle')}
            </button>
            <button
              onClick={handleKakaoLogin}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-yellow-400/60 bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-3 text-sm font-semibold text-slate-900 shadow-md shadow-amber-500/20 transition hover:shadow-amber-500/40"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
              </svg>
              {t('auth.loginWithKakao')}
            </button>
          </div>
        </div>

        {/* Benefits hint */}
        <div className="mt-4 rounded-xl border border-border-light bg-bg-surface/60 px-5 py-4 text-sm">
          <p className="text-xs uppercase tracking-widest text-brand-primary">{t('auth.benefitsTitle')}</p>
          <p className="mt-1.5 font-semibold text-text-primary">{t('auth.benefitsSubtitle')}</p>
          <ul className="mt-3 space-y-2 text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" />
              {t('auth.benefit1')}
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-secondary" />
              {t('auth.benefit2')}
            </li>
          </ul>
        </div>
      </div>
    </PageContainer>
  );
};
