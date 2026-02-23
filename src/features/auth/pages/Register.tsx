/**
 * 회원가입 페이지
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '@features/auth/api';
import { Button } from '@shared/components/Button';
import { PageContainer } from '@shared/components/PageContainer';
import { EmailVerificationSection, PasswordInputSection } from '@features/auth/components';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { useErrorHandler } from '@shared/hooks/useErrorHandler';
import { useEmailVerification } from '@features/auth/hooks/useEmailVerification';
import { isEmpty, isValidEmail, isValidPassword, isPasswordMatch } from '@shared/utils/validation';
import { ERROR_MESSAGES } from '@shared/utils/constants';

// Step indicator
interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const { t } = useTranslation();
  return (
    <div className="mb-6" aria-label={t('auth.stepProgress', { current: currentStep, total: totalSteps })}>
      <div className="mb-1.5 flex items-center justify-between text-xs text-text-tertiary">
        <span>{t('auth.step', { step: currentStep, total: totalSteps })}</span>
        <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-secondary">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}

export const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { handleError, handleSuccess } = useErrorHandler();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    name?: string;
    verificationCode?: string;
  }>({});
  const [showReRegisterModal, setShowReRegisterModal] = useState(false);
  const [reRegisterEmail, setReRegisterEmail] = useState('');
  const [reRegisterMessage, setReRegisterMessage] = useState('');

  const emailVerification = useEmailVerification({
    onReRegister: (email, message) => {
      setReRegisterEmail(email);
      setReRegisterMessage(message);
      setShowReRegisterModal(true);
    },
  });

  // Derive current step for progress (1=name, 2=email+verify, 3=password)
  const currentStep = (() => {
    if (emailVerification.isEmailVerified) return 3;
    if (emailVerification.emailAvailable === true) return 2;
    return 1;
  })();

  const handleRegister = async () => {
    const newErrors: typeof errors = {};

    if (isEmpty(name)) {
      newErrors.name = ERROR_MESSAGES.NAME_REQUIRED;
    }
    if (isEmpty(emailVerification.email)) {
      newErrors.email = ERROR_MESSAGES.EMAIL_REQUIRED;
    } else if (!isValidEmail(emailVerification.email)) {
      newErrors.email = ERROR_MESSAGES.INVALID_EMAIL;
    } else if (!emailVerification.emailChecked || !emailVerification.emailAvailable) {
      newErrors.email = ERROR_MESSAGES.EMAIL_DUPLICATE_CHECK_REQUIRED;
    } else if (!emailVerification.isEmailVerified) {
      newErrors.verificationCode = ERROR_MESSAGES.EMAIL_VERIFICATION_REQUIRED;
    }
    if (isEmpty(password)) {
      newErrors.password = ERROR_MESSAGES.PASSWORD_REQUIRED;
    } else if (!isValidPassword(password)) {
      newErrors.password = ERROR_MESSAGES.PASSWORD_TOO_SHORT;
    }
    if (isEmpty(confirmPassword)) {
      newErrors.confirmPassword = ERROR_MESSAGES.CONFIRM_PASSWORD_REQUIRED;
    } else if (!isPasswordMatch(password, confirmPassword)) {
      newErrors.confirmPassword = ERROR_MESSAGES.PASSWORD_MISMATCH;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setRegisterLoading(true);
    try {
      await authService.register({
        email: emailVerification.email,
        password,
        name: name.trim(),
      });
      handleSuccess(t('messages.registerSuccess'));
      navigate('/login');
    } catch (error: unknown) {
      handleError(error, 'Register');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="max-w-md" className="flex min-h-screen flex-col items-center justify-center py-12">
      <div className="w-full">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-3xl font-bold text-white shadow-lg shadow-orange-500/30">
            P
          </div>
          <p className="text-xs uppercase tracking-widest text-brand-primary">{t('auth.registerSignUp')}</p>
          <h1 className="mt-2 text-2xl font-bold text-text-primary">{t('auth.registerTitle')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('auth.registerSubtitle')}</p>
        </div>

        {/* Register Card */}
        <div className="rounded-2xl border border-border-default bg-bg-surface p-6 shadow-lg sm:p-8">
          <StepIndicator currentStep={currentStep} totalSteps={3} />

          <div className="space-y-4">
            {/* 이름 입력 */}
            <div>
              <Label htmlFor="name" className="mb-1.5 block text-text-primary">
                {t('auth.name')}
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors({ ...errors, name: undefined });
                }}
                placeholder={t('auth.namePlaceholder')}
                className={`w-full rounded-xl border ${
                  errors.name ? 'border-red-500/60' : 'border-border-default'
                } bg-bg-primary px-4 py-3 text-text-primary placeholder-text-placeholder transition focus:border-border-focus focus-visible:ring-2 focus-visible:ring-brand-primary/30 focus-visible:ring-offset-0`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
            </div>

            {/* 이메일 인증 섹션 */}
            <EmailVerificationSection
              emailVerification={emailVerification}
              emailError={errors.email}
              verificationCodeError={errors.verificationCode}
              onEmailChange={() => setErrors({ ...errors, email: undefined })}
              onVerificationCodeChange={() => setErrors({ ...errors, verificationCode: undefined })}
            />

            {/* 비밀번호 입력 섹션 */}
            <PasswordInputSection
              password={password}
              confirmPassword={confirmPassword}
              passwordError={errors.password}
              confirmPasswordError={errors.confirmPassword}
              onPasswordChange={(newPassword) => {
                setPassword(newPassword);
                setErrors({ ...errors, password: undefined });
              }}
              onConfirmPasswordChange={(newConfirmPassword) => {
                setConfirmPassword(newConfirmPassword);
                setErrors({ ...errors, confirmPassword: undefined });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !registerLoading) {
                  handleRegister();
                }
              }}
            />

            {/* 회원가입 버튼 */}
            <Button
              onClick={handleRegister}
              isLoading={registerLoading}
              disabled={registerLoading || !emailVerification.isEmailVerified}
              size="lg"
              className="mt-2 w-full"
            >
              {t('auth.register')}
            </Button>
          </div>

          {/* 로그인으로 */}
          <p className="mt-5 text-center text-sm text-text-secondary">
            {t('auth.haveAccount')}{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-semibold text-brand-primary transition hover:text-orange-600"
            >
              {t('auth.login')}
            </button>
          </p>
        </div>
      </div>

      {/* 재가입 안내 모달 */}
      {showReRegisterModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-border-default bg-bg-surface p-8 shadow-2xl shadow-black/20">
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-xl font-semibold text-text-primary">{t('auth.reRegisterTitle')}</p>
                <p className="mt-3 text-base leading-relaxed text-text-secondary">
                  {reRegisterMessage}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => setShowReRegisterModal(false)}
                  variant="ghost"
                  size="lg"
                  className="flex-1"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={() => {
                    setShowReRegisterModal(false);
                    navigate(`/re-register?email=${encodeURIComponent(reRegisterEmail)}`);
                  }}
                  size="lg"
                  className="flex-1"
                >
                  {t('auth.reRegisterButton')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
