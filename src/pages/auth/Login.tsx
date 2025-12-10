/**
 * 로그인 페이지
 */

import { authService } from '@/api/services/auth';
import { Button } from '@/components/common/Button';
import { StatusPopupCard } from '@/components/common/StatusPopupCard';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { extractErrorMessage } from '@/utils/error';
import { isEmpty } from '@/utils/validation';
import { ERROR_MESSAGES } from '@/utils/constants';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
const GOOGLE_SCOPE = 'openid email profile'; // 이름, 이메일, 프로필 정보 포함

export const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    if (isEmpty(email) || isEmpty(password)) {
      setErrorPopup({
        open: true,
        message: ERROR_MESSAGES.EMAIL_AND_PASSWORD_REQUIRED,
      });
      return;
    }

    try {
      const loginData = await authService.login({ email, password });

      if (!loginData.token) {
        throw new Error('토큰이 발급되지 않았습니다.');
      }

      dispatch(setCredentials({
        user: {
          email: loginData.email || email,
          name: loginData.name || '',
          address: loginData.address ?? null,
          latitude: loginData.latitude ?? null,
          longitude: loginData.longitude ?? null,
          preferences: loginData.preferences ?? null,
          createdAt: new Date().toISOString(),
        },
        token: loginData.token,
      }));

      navigate('/');
    } catch (error: unknown) {
      const message = extractErrorMessage(error, '로그인에 실패했습니다.');

      setErrorPopup({
        open: true,
        message,
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <StatusPopupCard
        open={errorPopup.open}
        title="로그인에 실패했습니다"
        message={errorPopup.message}
        variant="error"
        onConfirm={closeErrorPopup}
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-orange-400/40 via-pink-500/30 to-purple-600/30 blur-3xl animate-gradient" />
        <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-sky-500/30 via-emerald-400/20 to-transparent blur-3xl animate-gradient" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 pb-32 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-4xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400 via-pink-500 to-fuchsia-600 text-4xl font-bold text-slate-950 shadow-2xl shadow-orange-500/40">
                P
              </div>
              <h1 className="text-4xl font-bold text-white">PickEat</h1>
              <p className="mt-3 text-lg text-slate-300">
                AI가 추천하는 오늘의 메뉴
              </p>
              <p className="mt-2 text-sm text-slate-400">
                맛집 검색부터 메뉴 추천까지
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur">
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-pink-500 to-fuchsia-600 text-2xl font-bold text-slate-950 shadow-lg shadow-orange-500/30">
                    P
                  </div>
                  <p className="text-sm text-slate-300">PickEat 계정으로 로그인</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
                      이메일
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="이메일을 입력하세요"
                      className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
                      비밀번호
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="비밀번호를 입력하세요"
                      className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleLogin();
                        }
                      }}
                    />
                  </div>
                  <Button onClick={handleLogin} size="lg" className="w-full">
                    로그인
                  </Button>
                </div>
                <div className="mt-6 text-center text-sm text-slate-300">
                  계정이 없으신가요?{' '}
                  <button onClick={handleRegister} className="font-semibold text-white hover:text-orange-200">
                    회원가입
                  </button>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-400">
                    <span>비밀번호를 잊으셨나요?</span>
                    <button
                      onClick={handlePasswordReset}
                      className="font-semibold text-pink-200 underline-offset-4 transition hover:text-white hover:underline"
                      type="button"
                    >
                      재설정하기
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.02] p-8 shadow-2xl shadow-orange-500/10 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.4em] text-orange-200/80">Social Login</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">한 번의 클릭으로 입장</h2>
                <p className="mt-2 text-sm text-slate-300">PickEat 홈, 추천, 식당 화면과 동일한 인터랙션을 제공합니다.</p>

                <div className="mt-6 space-y-4">
                  <button
                    onClick={handleGoogleLogin}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                    Google로 계속하기
                  </button>
                  <button
                    onClick={handleKakaoLogin}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-yellow-400/60 bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/30 transition hover:shadow-amber-500/50"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
                    </svg>
                    카카오로 계속하기
                  </button>
                </div>

                <div className="mt-10 rounded-2xl border border-white/10 bg-slate-900/40 p-5 text-sm text-slate-200">
                  <p className="text-xs uppercase tracking-[0.3em] text-orange-100/80">Benefits</p>
                  <p className="mt-2 text-base font-semibold text-white">로그인 후 더 편리해집니다</p>
                  <ul className="mt-4 space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-300" />
                      AI 맞춤 추천과 실시간 식당 데이터를 하나의 화면에서 확인
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-pink-300" />
                      최근 기록 자동 불러오기, 주소 기반 거리 계산 지원
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
