/**
 * 재가입 페이지
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '@features/auth/api';
import {
  EmailVerificationSection,
  PasswordInputSection,
  ReRegisterFormSection,
} from '@features/auth/components';
import { PageContainer } from '@shared/components/PageContainer';
import { useErrorHandler } from '@shared/hooks/useErrorHandler';
import { useEmailVerification } from '@features/auth/hooks/useEmailVerification';
import { ERROR_MESSAGES } from '@shared/utils/constants';
import { isEmpty, isPasswordMatch, isValidPassword } from '@shared/utils/validation';

export const ReRegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { handleError, handleSuccess } = useErrorHandler();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const emailVerification = useEmailVerification({
    verificationType: 'RE_REGISTER',
  });

  useEffect(() => {
    if (emailParam) {
      emailVerification.setEmail(emailParam);
    }
  }, [emailParam, emailVerification]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [reRegisterLoading, setReRegisterLoading] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    name?: string;
  }>({});

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    setErrors({ ...errors, password: undefined });
  };

  const handleConfirmPasswordChange = (newConfirmPassword: string) => {
    setConfirmPassword(newConfirmPassword);
    setErrors({ ...errors, confirmPassword: undefined });
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    setErrors({ ...errors, name: undefined });
  };

  const handleReRegister = async () => {
    const newErrors: typeof errors = {};

    if (isEmpty(name)) {
      newErrors.name = ERROR_MESSAGES.NAME_REQUIRED;
    }
    if (!emailVerification.isEmailVerified) {
      return;
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

    setReRegisterLoading(true);
    try {
      await authService.reRegister({
        email: emailVerification.email,
        password,
        name: name.trim(),
      });
      handleSuccess(t('auth.reRegister.success.message'));
      navigate('/login');
    } catch (error: unknown) {
      handleError(error, 'ReRegister');
    } finally {
      setReRegisterLoading(false);
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
          <h1 className="text-2xl font-bold text-text-primary">{t('auth.reRegister.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('auth.reRegister.description')}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border-default bg-bg-surface p-6 shadow-lg sm:p-8">
          <div className="space-y-4">
            {/* 이메일 인증 섹션 */}
            <EmailVerificationSection emailVerification={emailVerification} />

            {/* 비밀번호 입력 섹션 */}
            <PasswordInputSection
              password={password}
              confirmPassword={confirmPassword}
              passwordError={errors.password}
              confirmPasswordError={errors.confirmPassword}
              onPasswordChange={handlePasswordChange}
              onConfirmPasswordChange={handleConfirmPasswordChange}
            />

            {/* 재가입 폼 섹션 */}
            <ReRegisterFormSection
              name={name}
              nameError={errors.name}
              onNameChange={handleNameChange}
              onReRegister={handleReRegister}
              isLoading={reRegisterLoading}
              isEmailVerified={emailVerification.isEmailVerified}
              onBackToLogin={() => navigate('/login')}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
