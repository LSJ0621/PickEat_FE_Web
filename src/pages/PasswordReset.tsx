import { authService } from '@/api/services/auth';
import { Button } from '@/components/common/Button';
import { StatusPopupCard } from '@/components/common/StatusPopupCard';
import { extractErrorMessage } from '@/utils/error';
import { isAxiosError } from 'axios';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RESET_EMAIL_STORAGE_KEY = 'resetPasswordEmail';

const validatePassword = (password: string) => {
  if (!password.trim()) {
    return '새 비밀번호를 입력해주세요.';
  }
  if (password.length < 8) {
    return '비밀번호는 최소 8자 이상이어야 합니다.';
  }
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  if (!hasLetter || !hasNumber) {
    return '영문과 숫자를 조합해서 입력해주세요.';
  }
  return '';
};

export const PasswordResetPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryEmail = useMemo(
    () => new URLSearchParams(location.search).get('email') ?? '',
    [location.search]
  );
  const initialEmail = useMemo(
    () => sessionStorage.getItem(RESET_EMAIL_STORAGE_KEY) ?? queryEmail,
    [queryEmail]
  );
  const [email] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
        title: '이메일을 찾지 못했어요',
        message: '재설정을 다시 시작해주세요.',
        variant: 'error',
        onConfirm: goToRequest,
      });
      return;
    }

    const newErrors: typeof errors = {};
    const passwordError = validatePassword(password);
    if (passwordError) {
      newErrors.password = passwordError;
    }
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
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
        title: '비밀번호 재설정 완료',
        message: response.message,
        variant: 'info',
        onConfirm: goToLogin,
      });
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        const status = error.response.status;
        const message = error.response.data?.message ?? '비밀번호를 변경하지 못했습니다.';
        if (status === 400) {
          setErrors({ password: message });
        } else {
          setPopup({
            open: true,
            title: '비밀번호 재설정 실패',
            message,
            variant: 'error',
          });
        }
      } else {
        setPopup({
          open: true,
          title: '비밀번호 재설정 실패',
          message: extractErrorMessage(error, '비밀번호를 변경하지 못했습니다.'),
          variant: 'error',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 px-4 py-12 text-white">
      <StatusPopupCard
        open={popup.open}
        title={popup.title}
        message={popup.message}
        variant={popup.variant}
        onConfirm={popup.onConfirm ?? closePopup}
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
            <h1 className="mt-3 text-3xl font-semibold text-white">새 비밀번호 설정</h1>
            <p className="mt-2 text-sm text-slate-300">
              인증 완료된 이메일에 대해 새 비밀번호를 설정하세요. 입력값은 초기화되지 않습니다.
            </p>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <p className="font-semibold text-white">인증된 이메일</p>
              <p className="mt-1 break-all text-orange-100">{email || '이메일을 찾을 수 없습니다.'}</p>
            </div>

            <div>
              <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-slate-200">
                새 비밀번호
              </label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="새 비밀번호를 입력하세요"
                className={`w-full rounded-2xl border ${
                  errors.password ? 'border-red-500/60' : 'border-white/15'
                } bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60`}
              />
              <p className="mt-1 text-xs text-slate-400">
                최소 8자, 영문과 숫자를 조합해주세요. 서버 규칙과 다르면 응답 메시지가 그대로 표시됩니다.
              </p>
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-slate-200">
                새 비밀번호 확인
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                placeholder="새 비밀번호를 다시 입력하세요"
                className={`w-full rounded-2xl border ${
                  errors.confirmPassword ? 'border-red-500/60' : 'border-white/15'
                } bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !submitting) {
                    handleSubmit();
                  }
                }}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              isLoading={submitting}
              disabled={submitting}
              size="lg"
              className="w-full mt-4"
            >
              비밀번호 변경
            </Button>

            <div className="text-center text-sm text-slate-300">
              인증 단계를 다시 진행하려면{' '}
              <button
                onClick={goToRequest}
                className="font-semibold text-white transition hover:text-orange-200"
              >
                인증번호 다시 받기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
