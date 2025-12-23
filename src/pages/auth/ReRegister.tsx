/**
 * 재가입 페이지
 */

import { authService } from '@/api/services/auth';
import {
  EmailVerificationSection,
  PasswordInputSection,
  ReRegisterFormSection,
} from '@/components/features/auth';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useEmailVerification } from '@/hooks/auth/useEmailVerification';
import { ERROR_MESSAGES } from '@/utils/constants';
import { isEmpty, isPasswordMatch, isValidPassword } from '@/utils/validation';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const ReRegisterPage = () => {
  const navigate = useNavigate();
  const { handleError, handleSuccess } = useErrorHandler();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  // 이메일 인증 Hook 사용
  const emailVerification = useEmailVerification({
    verificationType: 'RE_REGISTER',
  });

  // 초기 이메일 설정
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

  // 비밀번호 변경 핸들러
  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
    setErrors({ ...errors, password: undefined });
  };

  // 비밀번호 확인 변경 핸들러
  const handleConfirmPasswordChange = (newConfirmPassword: string) => {
    setConfirmPassword(newConfirmPassword);
    setErrors({ ...errors, confirmPassword: undefined });
  };

  // 이름 변경 핸들러
  const handleNameChange = (newName: string) => {
    setName(newName);
    setErrors({ ...errors, name: undefined });
  };

  // 재가입 처리
  const handleReRegister = async () => {
    const newErrors: typeof errors = {};

    // 이름 검증 (필수)
    if (isEmpty(name)) {
      newErrors.name = ERROR_MESSAGES.NAME_REQUIRED;
    }

    // 이메일 검증
    if (!emailVerification.isEmailVerified) {
      // 이메일 인증이 완료되지 않은 경우 에러는 Hook에서 관리
      return;
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

    setReRegisterLoading(true);
    try {
      await authService.reRegister({
        email: emailVerification.email,
        password,
        name: name.trim(),
      });
      handleSuccess('재가입이 완료되었습니다. 로그인해주세요.');
      navigate('/login');
    } catch (error: unknown) {
      handleError(error, 'ReRegister');
    } finally {
      setReRegisterLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
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
            <h1 className="mb-2 text-2xl font-semibold text-white">재가입</h1>
            <p className="text-sm text-slate-300">탈퇴한 계정을 재가입합니다.</p>
          </div>

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
    </div>
  );
};

