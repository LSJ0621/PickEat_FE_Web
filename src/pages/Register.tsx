/**
 * 회원가입 페이지
 */

import { authService } from '@/api/services/auth';
import { Button } from '@/components/common/Button';
import { extractErrorMessage } from '@/utils/error';
import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [sendCodeLoading, setSendCodeLoading] = useState(false);
  const [verifyCodeLoading, setVerifyCodeLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [verificationRemaining, setVerificationRemaining] = useState(0);
  const [sendAttemptsLeft, setSendAttemptsLeft] = useState(5);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
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

  // 이메일 중복 확인
  const handleCheckEmail = async () => {
    if (!email.trim()) {
      setErrors({ ...errors, email: '이메일을 입력해주세요.' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ ...errors, email: '올바른 이메일 형식이 아닙니다.' });
      setEmailAvailable(null);
      setEmailChecked(false);
      return;
    }

    setEmailCheckLoading(true);
    setErrors({ ...errors, email: undefined });
    try {
      const result = await authService.checkEmail(email);
      setEmailAvailable(result.available);
      setEmailChecked(true);
      setVerificationMessage(null);
      if (!result.available) {
        setErrors({ ...errors, email: result.message });
      }
    } catch (error: unknown) {
      console.error('이메일 확인 실패:', error);
      const errorMessage = extractErrorMessage(error, '이메일 확인에 실패했습니다.');
      setErrors({ ...errors, email: errorMessage });
      setEmailAvailable(null);
      setEmailChecked(false);
    } finally {
      setEmailCheckLoading(false);
    }
  };

  // 인증 타이머 포맷
  const formatSeconds = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
  };

  const handleEmailAction = async () => {
    if (!emailChecked || emailAvailable !== true) {
      await handleCheckEmail();
      return;
    }

    if (isEmailVerified) {
      return;
    }

    if (isCodeSent && verificationRemaining > 0) {
      return;
    }

    await handleSendVerificationCode();
  };

  const getEmailActionLabel = () => {
    if (!emailChecked || emailAvailable !== true) {
      return emailCheckLoading ? '확인 중...' : '중복 확인';
    }
    if (isEmailVerified) {
      return '인증 완료';
    }
    if (isCodeSent && verificationRemaining > 0) {
      return `유효시간 ${formatSeconds(verificationRemaining)}`;
    }
    return sendCodeLoading ? '발송 중...' : '인증번호 발송';
  };

  const isEmailActionDisabled = () => {
    if (!emailChecked || emailAvailable !== true) {
      return emailCheckLoading || !email.trim();
    }
    if (isEmailVerified) {
      return true;
    }
    if (isCodeSent && verificationRemaining > 0) {
      return true;
    }
    return sendCodeLoading;
  };

  const isVerifyButtonDisabled =
    verifyCodeLoading ||
    !isCodeSent ||
    isEmailVerified ||
    verificationRemaining <= 0 ||
    !verificationCode.trim();

  const verifyButtonClass = isVerifyButtonDisabled
    ? 'rounded-2xl bg-slate-800/80 px-4 py-3 text-sm font-semibold text-slate-500 cursor-not-allowed transition'
    : 'rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/30 hover:brightness-110 transition';

  const isResendDisabled =
    sendCodeLoading ||
    cooldownRemaining > 0 ||
    sendAttemptsLeft <= 0;

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

    if (!emailChecked || !emailAvailable) {
      setErrors({ ...errors, email: '이메일 중복 확인을 해주세요.' });
      return;
    }

    if (sendAttemptsLeft <= 0) {
      setErrors((prev) => ({ ...prev, verificationCode: '하루 최대 발송 횟수를 초과했습니다.' }));
      return;
    }

    if (cooldownRemaining > 0) {
      return;
    }

    setSendCodeLoading(true);
    setVerificationMessage(null);
    setErrors((prev) => ({ ...prev, verificationCode: undefined }));
    const isResending = isCodeSent; // 재발송 여부 확인
    try {
      await authService.sendEmailVerificationCode(email, 'SIGNUP');
      setIsCodeSent(true);
      setIsEmailVerified(false);
      setVerificationCode('');
      setCooldownRemaining(30);
      setVerificationRemaining(180);
      setSendAttemptsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      if (isResending) {
        setVerificationMessage('인증번호를 재발송 해드렸습니다!');
      } else {
        setVerificationMessage('인증 코드를 발송했습니다. 3분 이내에 입력해주세요.');
      }
    } catch (error: unknown) {
      console.error('인증 코드 발송 실패:', error);
      let errorMessage = '인증 코드를 발송하지 못했습니다. 잠시 후 다시 시도해주세요.';
      
      // Axios 에러인 경우 서버에서 전달한 메시지 사용
      if (isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = extractErrorMessage(
          error,
          '인증 코드를 발송하지 못했습니다. 잠시 후 다시 시도해주세요.'
        );
      }
      
      // 인증 코드 발송 관련 에러는 verificationCode 에러로 표시
      setErrors((prev) => ({ ...prev, verificationCode: errorMessage }));

      if (errorMessage.includes('최대') || errorMessage.includes('초과') || errorMessage.includes('5회')) {
        setSendAttemptsLeft(0);
      }
      if (errorMessage.includes('자주 요청')) {
        setCooldownRemaining(30);
      }
    } finally {
      setSendCodeLoading(false);
    }
  };

  // 인증 코드 검증
  const handleVerifyCode = async () => {
    if (!isCodeSent) {
      setErrors((prev) => ({
        ...prev,
        verificationCode: '인증 코드를 먼저 발송해주세요.',
      }));
      return;
    }

    if (verificationRemaining <= 0) {
      setErrors((prev) => ({
        ...prev,
        verificationCode: '코드가 만료되었습니다. 다시 발송해주세요.',
      }));
      return;
    }

    if (!verificationCode.trim()) {
      setErrors((prev) => ({
        ...prev,
        verificationCode: '인증 코드를 입력해주세요.',
      }));
      return;
    }

    setVerifyCodeLoading(true);
    setErrors((prev) => ({ ...prev, verificationCode: undefined }));
    setVerificationMessage(null);
    try {
      await authService.verifyEmailCode(email, verificationCode.trim(), 'SIGNUP');
      setIsEmailVerified(true);
      setVerificationMessage('이메일 인증이 완료되었습니다.');
    } catch (error: unknown) {
      console.error('인증 코드 검증 실패:', error);
      let errorMessage = '인증에 실패했습니다. 코드를 확인해주세요.';
      
      // Axios 에러인 경우 서버에서 전달한 메시지 사용
      if (isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = extractErrorMessage(
          error,
          '인증에 실패했습니다. 코드를 확인해주세요.'
        );
      }
      
      setErrors((prev) => ({ ...prev, verificationCode: errorMessage }));
      setIsEmailVerified(false);

      // 5회 실패로 인해 다음날까지 회원가입이 불가능한 경우
      if (errorMessage.includes('불가능') || errorMessage.includes('5회 실패')) {
        setSendAttemptsLeft(0);
      }
    } finally {
      setVerifyCodeLoading(false);
    }
  };

  // 회원가입 처리
  const handleRegister = async () => {
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
    } else if (!emailChecked || !emailAvailable) {
      newErrors.email = '이메일 중복 확인을 해주세요.';
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

    setRegisterLoading(true);
    try {
      await authService.register({ 
        email, 
        password,
        name: name.trim() // 이름은 필수이므로 항상 포함
      });
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/login');
    } catch (error: unknown) {
      console.error('회원가입 실패:', error);
      const errorMessage = extractErrorMessage(error, '회원가입에 실패했습니다.');
      alert(errorMessage);
    } finally {
      setRegisterLoading(false);
    }
  };

  // 전송 쿨다운 타이머
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  // 인증 만료 타이머
  useEffect(() => {
    if (verificationRemaining <= 0) return;
    const timer = setInterval(() => {
      setVerificationRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [verificationRemaining]);

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
            <p className="text-sm uppercase tracking-[0.4em] text-orange-200/80">PickEat Sign Up</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">회원가입</h1>
            <p className="mt-2 text-sm text-slate-300">새로운 계정을 만들어 시작하세요</p>
          </div>

          <div className="space-y-4">
            {/* 이름 입력 */}
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
                className={`w-full rounded-2xl border ${
                  errors.name ? 'border-red-500/60' : 'border-white/15'
                } bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            {/* 이메일 입력 */}
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
                    setEmailChecked(false);
                    setEmailAvailable(null);
                    setIsCodeSent(false);
                    setIsEmailVerified(false);
                    setVerificationCode('');
                    setCooldownRemaining(0);
                    setVerificationRemaining(0);
                    setSendAttemptsLeft(5);
                    setVerificationMessage(null);
                    setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="이메일을 입력하세요"
                  className={`flex-1 rounded-2xl border ${
                    errors.email
                      ? 'border-red-500/60'
                      : emailAvailable === true
                      ? 'border-green-400'
                      : 'border-white/15'
                  } bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60`}
                />
                <button
                  onClick={handleEmailAction}
                  disabled={isEmailActionDisabled()}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    emailChecked && emailAvailable === true
                      ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-md shadow-pink-500/30 hover:brightness-110 disabled:opacity-60 disabled:brightness-100'
                      : 'border border-white/15 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50'
                  }`}
                >
                  {getEmailActionLabel()}
                </button>
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
              {emailAvailable === true && (
                <p className="mt-1 text-sm text-green-400">사용 가능한 이메일입니다.</p>
              )}
            </div>

            {/* 이메일 인증 */}
            <div>
              {isCodeSent && !isEmailVerified && (
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span>메일을 받지 못하셨나요?</span>
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    disabled={isResendDisabled}
                    className={`font-medium transition-all underline-offset-4 ${
                      isResendDisabled
                        ? 'cursor-not-allowed text-slate-600 no-underline'
                        : 'text-pink-300 underline decoration-2 decoration-pink-400/50 hover:text-pink-100 hover:decoration-pink-300 hover:decoration-2'
                    }`}
                  >
                    재발송 받기
                  </button>
                  {cooldownRemaining > 0 && (
                    <span className="text-orange-300">
                      {formatSeconds(cooldownRemaining)} 후 재발송 가능
                    </span>
                  )}
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
                    setErrors((prev) => ({ ...prev, verificationCode: undefined }));
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
              {isEmailVerified && (
                <p className="mt-2 text-sm text-green-400">이메일 인증이 완료되었습니다.</p>
              )}
              {verificationMessage && !isEmailVerified && (
                <p className="mt-2 text-sm text-emerald-200">{verificationMessage}</p>
              )}
              {errors.verificationCode && (
                <p className="mt-2 text-sm text-red-400">{errors.verificationCode}</p>
              )}
            </div>

            {/* 비밀번호 입력 */}
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
                className={`w-full rounded-2xl border ${
                  errors.password ? 'border-red-500/60' : 'border-white/15'
                } bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
              {password && password.length < 6 && (
                <p className="mt-1 text-sm text-slate-400">비밀번호는 최소 6자 이상이어야 합니다.</p>
              )}
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
                className={`w-full rounded-2xl border ${
                  errors.confirmPassword ? 'border-red-500/60' : 'border-white/15'
                } bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !registerLoading) {
                    handleRegister();
                  }
                }}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-sm text-red-400">비밀번호가 일치하지 않습니다.</p>
              )}
            </div>

            {/* 회원가입 버튼 */}
            <Button
              onClick={handleRegister}
              isLoading={registerLoading}
              disabled={registerLoading || !isEmailVerified}
              size="lg"
              className="w-full mt-6"
            >
              회원가입
            </Button>
          </div>

          {/* 로그인 페이지로 이동 */}
          <div className="mt-6 text-center text-sm text-slate-300">
            이미 계정이 있으신가요?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-semibold text-white hover:text-orange-200 transition-colors"
            >
              로그인
            </button>
          </div>

          {/* 홈으로 돌아가기 */}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              ← 홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
