/**
 * 로그인 페이지 폼 패널 (우측 또는 모바일 전체)
 */

import { Eye, EyeOff, UtensilsCrossed } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@shared/components/Button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';

interface LoginFormPanelProps {
  email: string;
  password: string;
  showPassword: boolean;
  isSubmitting: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onLogin: () => void;
  onGoogleLogin: () => void;
  onKakaoLogin: () => void;
  onRegister: () => void;
  onPasswordReset: () => void;
}

export function LoginFormPanel({
  email,
  password,
  showPassword,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onLogin,
  onGoogleLogin,
  onKakaoLogin,
  onRegister,
  onPasswordReset,
}: LoginFormPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-bg-primary px-4 py-10 pb-28 lg:w-1/2 lg:pb-12">
      <div className="w-full max-w-md">
        {/* Mobile-only logo header */}
        <div className="mb-8 text-center lg:hidden">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-pink-500 to-fuchsia-600 shadow-lg shadow-orange-500/30">
            <UtensilsCrossed className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">PickEat</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('auth.appDescription')}</p>
        </div>

        {/* Desktop-only login title */}
        <h2 className="mb-6 hidden text-center text-2xl font-bold text-text-primary lg:block">
          {t('auth.loginTitle')}
        </h2>

        {/* Login Card */}
        <div className="rounded-2xl border border-border-default bg-bg-surface p-6 shadow-lg sm:p-8">
          <h2 className="mb-6 text-center text-lg font-semibold text-text-primary lg:hidden">
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
                onChange={(e) => onEmailChange(e.target.value)}
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
                  onChange={(e) => onPasswordChange(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  className="w-full rounded-xl border border-border-default bg-bg-primary px-4 py-3 pr-10 text-text-primary placeholder-text-placeholder transition focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary/30 focus-visible:ring-offset-0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isSubmitting) {
                      onLogin();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={onTogglePassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary transition hover:text-text-secondary"
                  aria-label={showPassword ? t('passwordInput.hide') : t('passwordInput.show')}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <Button
              onClick={onLogin}
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
                type="button"
                onClick={onRegister}
                className="font-semibold text-brand-primary underline-offset-4 transition hover:text-brand-dark hover:underline"
              >
                {t('auth.register')}
              </button>
            </p>
            <p className="text-text-tertiary">
              {t('auth.forgotPassword')}{' '}
              <button
                onClick={onPasswordReset}
                className="font-semibold text-brand-primary underline-offset-4 transition hover:text-brand-dark hover:underline"
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
              onClick={onGoogleLogin}
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
              onClick={onKakaoLogin}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-yellow-400/60 bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-3 text-sm font-semibold text-slate-900 shadow-md shadow-amber-500/20 transition hover:shadow-amber-500/40"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
              </svg>
              {t('auth.loginWithKakao')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
