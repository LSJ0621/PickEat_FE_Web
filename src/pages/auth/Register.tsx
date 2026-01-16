/**
 * 회원가입 페이지
 */

import { authService } from '@/api/services/auth';
import { Button } from '@/components/common/Button';
import { EmailVerificationSection, PasswordInputSection } from '@/components/features/auth';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useEmailVerification } from '@/hooks/auth/useEmailVerification';
import { isEmpty, isValidEmail, isValidPassword, isPasswordMatch } from '@/utils/validation';
import { ERROR_MESSAGES } from '@/utils/constants';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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

  // 이메일 인증 Hook 사용
  const emailVerification = useEmailVerification({
    onReRegister: (email, message) => {
      setReRegisterEmail(email);
      setReRegisterMessage(message);
      setShowReRegisterModal(true);
    },
  });

  // 회원가입 처리
  const handleRegister = async () => {
    const newErrors: typeof errors = {};
    
    // 이름 검증 (필수)
    if (isEmpty(name)) {
      newErrors.name = ERROR_MESSAGES.NAME_REQUIRED;
    }

    // 이메일 검증
    if (isEmpty(emailVerification.email)) {
      newErrors.email = ERROR_MESSAGES.EMAIL_REQUIRED;
    } else if (!isValidEmail(emailVerification.email)) {
      newErrors.email = ERROR_MESSAGES.INVALID_EMAIL;
    } else if (!emailVerification.emailChecked || !emailVerification.emailAvailable) {
      newErrors.email = ERROR_MESSAGES.EMAIL_DUPLICATE_CHECK_REQUIRED;
    } else if (!emailVerification.isEmailVerified) {
      newErrors.verificationCode = ERROR_MESSAGES.EMAIL_VERIFICATION_REQUIRED;
    }

    // 비밀번호 검증
    if (isEmpty(password)) {
      newErrors.password = ERROR_MESSAGES.PASSWORD_REQUIRED;
    } else if (!isValidPassword(password)) {
      newErrors.password = ERROR_MESSAGES.PASSWORD_TOO_SHORT;
    }

    // 비밀번호 확인
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
        name: name.trim() // 이름은 필수이므로 항상 포함
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
    <div className="relative flex min-h-screen items-start justify-center bg-slate-950 px-4 pt-20 pb-10 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-orange-400/40 via-pink-500/30 to-purple-600/30 blur-3xl animate-gradient" />
        <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-sky-500/30 via-emerald-400/20 to-transparent blur-3xl animate-gradient" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-pink-500 to-fuchsia-600 text-2xl font-bold text-slate-950 shadow-lg shadow-orange-500/30">
              P
            </div>
            <p className="text-sm uppercase tracking-[0.4em] text-orange-200/80">{t('auth.registerSignUp')}</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">{t('auth.registerTitle')}</h1>
            <p className="mt-2 text-sm text-slate-300">{t('auth.registerSubtitle')}</p>
          </div>

          <div className="space-y-4">
            {/* 이름 입력 */}
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-200">
                {t('auth.name')}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors({ ...errors, name: undefined });
                }}
                placeholder={t('auth.namePlaceholder')}
                className={`w-full rounded-2xl border ${
                  errors.name ? 'border-red-500/60' : 'border-white/15'
                } bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            {/* 이메일 인증 섹션 */}
            <EmailVerificationSection
              emailVerification={emailVerification}
              emailError={errors.email}
              verificationCodeError={errors.verificationCode}
              onEmailChange={() => {
                setErrors({ ...errors, email: undefined });
              }}
              onVerificationCodeChange={() => {
                setErrors({ ...errors, verificationCode: undefined });
              }}
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
              onKeyPress={(e) => {
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
              className="w-full mt-6"
            >
              {t('auth.register')}
            </Button>
          </div>

          {/* 로그인 페이지로 이동 */}
          <div className="mt-6 text-center text-sm text-slate-300">
            {t('auth.haveAccount')}{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-semibold text-white hover:text-orange-200 transition-colors"
            >
              {t('auth.login')}
            </button>
          </div>
        </div>
      </div>

      {/* 재가입 안내 모달 */}
      {showReRegisterModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-slate-900/95 p-8 shadow-2xl shadow-black/50 backdrop-blur">
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-xl font-semibold text-white">{t('auth.reRegisterTitle')}</p>
                <p className="mt-3 text-base text-slate-200 leading-relaxed">
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
    </div>
  );
};
