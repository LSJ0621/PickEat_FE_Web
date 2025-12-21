/**
 * 재가입 페이지
 */

import { authService } from '@/api/services/auth';
import { Button } from '@/components/common/Button';
import { extractErrorMessage } from '@/utils/error';
import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const ReRegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [sendCodeLoading, setSendCodeLoading] = useState(false);
  const [verifyCodeLoading, setVerifyCodeLoading] = useState(false);
  const [reRegisterLoading, setReRegisterLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationRemaining, setVerificationRemaining] = useState(0);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [verificationMessageVariant, setVerificationMessageVariant] = useState<'success' | 'error' | null>(null);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    name?: string;
    verificationCode?: string;
  }>({});

  // 이메일 형식 검증
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 인증 타이머 포맷
  const formatSeconds = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
  };

  // 인증 코드 발송
  const handleSendVerificationCode = async () => {
    if (!email.trim()) {
      setErrors({ ...errors, email: '이메일을 입력해주세요.' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ ...errors, email: '올바른 이메일 형식이 아닙니다.' });
      return;
    }

    setSendCodeLoading(true);
    setErrors({ ...errors, email: undefined });
    try {
      await authService.sendEmailVerificationCode(email, 'RE_REGISTER');
      setIsCodeSent(true);
      setVerificationRemaining(180); // 3분
      setErrors({ ...errors, email: undefined });
    } catch (error: unknown) {
      console.error('인증 코드 발송 실패:', error);
      let errorMessage = '인증 코드 발송에 실패했습니다.';
      
      // Axios 에러인 경우 서버에서 전달한 메시지 사용
      if (isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = extractErrorMessage(error, '인증 코드 발송에 실패했습니다.');
      }
      
      setErrors({ ...errors, email: errorMessage });
    } finally {
      setSendCodeLoading(false);
    }
  };

  // 인증 코드 검증
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setErrors({ ...errors, verificationCode: '인증 코드를 입력해주세요.' });
      return;
    }

    setVerifyCodeLoading(true);
    setErrors({ ...errors, verificationCode: undefined });
    setVerificationMessage(null);
    setVerificationMessageVariant(null);
    try {
      const response = await authService.verifyEmailCode(email, verificationCode, 'RE_REGISTER');
      const serverMessage = response?.message || '이메일 인증이 완료되었습니다.';
      setIsEmailVerified(true);
      setVerificationRemaining(0);
      setVerificationMessage(serverMessage);
      setVerificationMessageVariant('success');
      setErrors({ ...errors, verificationCode: undefined });
    } catch (error: unknown) {
      console.error('인증 코드 검증 실패:', error);
      let errorMessage = '인증 코드 검증에 실패했습니다.';
      
      // Axios 에러인 경우 서버에서 전달한 메시지 사용
      if (isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = extractErrorMessage(error, '인증 코드 검증에 실패했습니다.');
      }
      
      setVerificationMessage(errorMessage);
      setVerificationMessageVariant('error');
      setErrors({ ...errors, verificationCode: undefined });
    } finally {
      setVerifyCodeLoading(false);
    }
  };

  // 재가입 처리
  const handleReRegister = async () => {
    const newErrors: typeof errors = {};

    // 이름 검증 (필수)
    if (!name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }

    // 이메일 검증
    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!validateEmail(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    } else if (!isEmailVerified) {
      newErrors.verificationCode = '이메일 인증을 완료해주세요.';
    }

    // 비밀번호 검증
    if (!password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
    }

    // 비밀번호 확인
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setReRegisterLoading(true);
    try {
      await authService.reRegister({
        email,
        password,
        name: name.trim(),
      });
      alert('재가입이 완료되었습니다. 로그인해주세요.');
      navigate('/login');
    } catch (error: unknown) {
      console.error('재가입 실패:', error);
      let errorMessage = '재가입에 실패했습니다.';
      
      // Axios 에러인 경우 서버에서 전달한 메시지 사용
      if (isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = extractErrorMessage(error, '재가입에 실패했습니다.');
      }
      
      alert(errorMessage);
    } finally {
      setReRegisterLoading(false);
    }
  };

  // 인증 만료 타이머
  useEffect(() => {
    if (verificationRemaining > 0) {
      const timer = setInterval(() => {
        setVerificationRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [verificationRemaining]);

  const isVerifyButtonDisabled =
    verifyCodeLoading ||
    !isCodeSent ||
    isEmailVerified ||
    !verificationCode.trim() ||
    verificationRemaining === 0;

  const verifyButtonClass = isVerifyButtonDisabled
    ? 'rounded-2xl bg-slate-800/80 px-4 py-3 text-sm font-semibold text-slate-500 cursor-not-allowed transition'
    : 'rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/30 hover:brightness-110 transition';

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
            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
                이메일
              </label>
              <div className="flex gap-2">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="이메일을 입력하세요"
                  className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
                  disabled={isEmailVerified}
                />
                <Button
                  onClick={handleSendVerificationCode}
                  isLoading={sendCodeLoading}
                  disabled={isEmailVerified || (isCodeSent && verificationRemaining > 0) || !email.trim()}
                  size="md"
                  className="whitespace-nowrap"
                >
                  {isEmailVerified
                    ? '인증 완료'
                    : isCodeSent && verificationRemaining > 0
                      ? `유효시간 ${formatSeconds(verificationRemaining)}`
                      : '인증번호 발송'}
                </Button>
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
            </div>

            {/* 이메일 인증 */}
            <div>
              {isCodeSent && !isEmailVerified && (
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span>메일을 받지 못하셨나요?</span>
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    className="font-medium text-pink-300 underline decoration-2 decoration-pink-400/50 underline-offset-4 transition hover:text-pink-100 hover:decoration-pink-300 hover:decoration-2"
                  >
                    재발송 받기
                  </button>
                </div>
              )}
              <div className="text-sm font-medium text-slate-200">이메일 인증</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value);
                    if (isEmailVerified) {
                      setIsEmailVerified(false);
                    }
                    setErrors({ ...errors, verificationCode: undefined });
                    setVerificationMessage(null);
                    setVerificationMessageVariant(null);
                  }}
                  placeholder="6자리 인증번호 입력"
                  disabled={!isCodeSent || isEmailVerified}
                  className={`flex-1 min-w-0 rounded-2xl border ${
                    errors.verificationCode
                      ? 'border-red-500/60'
                      : isEmailVerified
                      ? 'border-green-400'
                      : 'border-white/15'
                  } bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60 disabled:opacity-60`}
                />
                <Button
                  onClick={handleVerifyCode}
                  isLoading={verifyCodeLoading}
                  disabled={isVerifyButtonDisabled}
                  size="sm"
                  className={verifyButtonClass}
                >
                  확인
                </Button>
              </div>
              {verificationMessage && (
                <p
                  className={`mt-2 text-sm ${
                    verificationMessageVariant === 'error' ? 'text-red-400' : 'text-green-400'
                  }`}
                >
                  {verificationMessage}
                </p>
              )}
            </div>

            {/* 이름 */}
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-200">
                이름
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors({ ...errors, name: undefined });
                }}
                placeholder="이름을 입력하세요"
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
              />
              {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
            </div>

            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: undefined });
                }}
                placeholder="비밀번호를 입력하세요 (최소 6자)"
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
              />
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-200">
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors({ ...errors, confirmPassword: undefined });
                }}
                placeholder="비밀번호를 다시 입력하세요"
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* 재가입 버튼 */}
            <Button
              onClick={handleReRegister}
              isLoading={reRegisterLoading}
              size="lg"
              className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/30"
            >
              재가입
            </Button>

            {/* 로그인 링크 */}
            <div className="text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-slate-400 hover:text-white transition"
              >
                로그인으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

