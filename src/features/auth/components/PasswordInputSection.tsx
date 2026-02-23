/**
 * 비밀번호 입력 섹션 컴포넌트
 * 비밀번호 및 비밀번호 확인 입력 UI를 제공합니다.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { isValidPassword, isPasswordMatch } from '@shared/utils/validation';
import { ERROR_MESSAGES, VALIDATION } from '@shared/utils/constants';

interface PasswordInputSectionProps {
  password: string;
  confirmPassword: string;
  passwordError?: string;
  confirmPasswordError?: string;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (confirmPassword: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const PasswordInputSection = ({
  password,
  confirmPassword,
  passwordError,
  confirmPasswordError,
  onPasswordChange,
  onConfirmPasswordChange,
  onKeyDown,
}: PasswordInputSectionProps) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
      {/* 비밀번호 입력 */}
      <div>
        <Label htmlFor="password" className="mb-2 block text-text-primary">
          {t('auth.password')}
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder={
              t('auth.passwordPlaceholder') +
              ` (${t('passwordInput.minLength', { minLength: VALIDATION.PASSWORD_MIN_LENGTH })})`
            }
            className={`w-full rounded-2xl border pr-10 ${
              passwordError ? 'border-red-500/60' : 'border-border-default'
            } bg-bg-secondary px-4 py-3 text-text-primary placeholder-text-placeholder transition focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary/30 focus-visible:ring-offset-0`}
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
        {passwordError && <p className="mt-1 text-sm text-red-400">{passwordError}</p>}
        {password && !isValidPassword(password) && (
          <p className="mt-1 text-sm text-text-tertiary">
            {t('validation.password.tooShort', { minLength: VALIDATION.PASSWORD_MIN_LENGTH })}
          </p>
        )}
      </div>

      {/* 비밀번호 확인 */}
      <div>
        <Label htmlFor="confirmPassword" className="mb-2 block text-text-primary">
          {t('auth.passwordConfirm')}
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            placeholder={t('passwordInput.confirmPlaceholder')}
            className={`w-full rounded-2xl border pr-10 ${
              confirmPasswordError ? 'border-red-500/60' : 'border-border-default'
            } bg-bg-secondary px-4 py-3 text-text-primary placeholder-text-placeholder transition focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary/30 focus-visible:ring-offset-0`}
            onKeyDown={onKeyDown}
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
        {confirmPasswordError && (
          <p className="mt-1 text-sm text-red-400">{confirmPasswordError}</p>
        )}
        {confirmPassword && !isPasswordMatch(password, confirmPassword) && (
          <p className="mt-1 text-sm text-red-400">{ERROR_MESSAGES.PASSWORD_MISMATCH}</p>
        )}
      </div>
    </>
  );
};
