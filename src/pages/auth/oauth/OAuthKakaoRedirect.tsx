/**
 * 카카오 OAuth 리다이렉트 페이지
 */

import { authService } from '@/api/services/auth';
import { Button } from '@/components/common/Button';
import { OAuthLoadingScreen } from '@/components/common/OAuthLoadingScreen';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import type { KakaoLoginResponse } from '@/types/auth';
import { ERROR_MESSAGES } from '@/utils/constants';
import { isEmpty } from '@/utils/validation';
import { isAxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const OAuthKakaoRedirect = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsName, setNeedsName] = useState(false);
  const [name, setName] = useState('');
  const [nameUpdating, setNameUpdating] = useState(false);
  const [loginData, setLoginData] = useState<KakaoLoginResponse | null>(null);
  const [showReRegisterModal, setShowReRegisterModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [reRegisterMessage, setReRegisterMessage] = useState('탈퇴한 이력이 있습니다. 재가입하시겠습니까?');
  const [isReRegistering, setIsReRegistering] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const hasProcessed = useRef(false); // 중복 요청 방지
  const { handleError, handleSuccess } = useErrorHandler();

  useEffect(() => {
    // 이미 처리했으면 중복 실행 방지
    if (hasProcessed.current) {
      return;
    }

    const handleKakaoCallback = async () => {
      // 처리 시작 표시
      hasProcessed.current = true;
      
      // URL에서 code 파라미터 추출
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (!code) {
        setError('인증 코드를 받지 못했습니다.');
        setLoading(false);
        return;
      }

      try {
        // 서버에 코드 전달하여 로그인
        const data = await authService.kakaoLogin(code);
        
        if (!data.token) {
          throw new Error('토큰이 발급되지 않았습니다.');
        }

        setLoginData(data);

        if (data.name === null) {
          setNeedsName(true);
          setLoading(false);
          return;
        }

        dispatch(setCredentials({
          user: {
            email: data.email || '',
            name: data.name || '',
            address: data.address ?? null,
            latitude: data.latitude ?? null,
            longitude: data.longitude ?? null,
            preferences: data.preferences ?? null,
            createdAt: new Date().toISOString(),
          },
          token: data.token,
        }));

        navigate('/');
      } catch (err: unknown) {
        
        // RE_REGISTER_REQUIRED 에러 확인 (400 에러)
        if (isAxiosError(err) && err.response?.status === 400) {
          const errorData = err.response.data as {
            error?: string;
            message?: string;
            email?: string;
            name?: string;
            data?: { email?: string; name?: string };
          };
          if (errorData?.error === 'RE_REGISTER_REQUIRED') {
            const emailFromServer = errorData.email ?? errorData.data?.email ?? null;
            setPendingEmail(emailFromServer);
            setReRegisterMessage(errorData.message || '탈퇴한 이력이 있습니다. 재가입하시겠습니까?');
            setShowReRegisterModal(true);
            setLoading(false);
            return;
          }
        }
        
        // 그 외 에러 처리
        handleError(err, 'OAuthKakaoRedirect');
        const statusCode = isAxiosError(err) ? err.response?.status : undefined;
        setError(`로그인에 실패했습니다.${statusCode ? ` (상태 코드: ${statusCode})` : ''}`);
        setLoading(false);
      }
    };

    handleKakaoCallback();
    
    // cleanup 함수: 컴포넌트 언마운트 시 처리 취소 (필요시)
    return () => {
      // 필요시 요청 취소 로직 추가 가능
    };
  }, [navigate, dispatch]);

  // 재가입 처리
  const handleReRegister = async () => {
    if (!pendingEmail) {
      handleError('이메일 정보가 없습니다.', 'OAuthKakaoRedirect');
      return;
    }

    setIsReRegistering(true);
    try {
      // 소셜 재가입 API 호출 (이메일만 전송)
      await authService.reRegisterSocial({
        email: pendingEmail,
      });

      // 재가입 성공: 로그인 화면으로 이동 (자동 로그인 없음)
      handleSuccess('재가입이 완료되었습니다. 로그인해주세요.');
      navigate('/login');
    } catch (err: unknown) {
      handleError(err, 'OAuthKakaoRedirect');
      setIsReRegistering(false);
    }
  };

  // 이름 입력 화면
  const handleNameSubmit = async () => {
    if (isEmpty(name)) {
      handleError(ERROR_MESSAGES.NAME_REQUIRED, 'OAuthKakaoRedirect');
      return;
    }

    setNameUpdating(true);
    try {
      const updatedUser = await authService.updateUser({ name: name.trim() });

      if (!loginData?.token) {
        throw new Error('토큰 정보가 없습니다.');
      }

      dispatch(setCredentials({
        user: {
          email: loginData.email || '',
          name: updatedUser.name || '',
          address: loginData.address ?? null,
          latitude: loginData.latitude ?? null,
          longitude: loginData.longitude ?? null,
          preferences: loginData.preferences ?? null,
          createdAt: new Date().toISOString(),
        },
        token: loginData.token,
      }));

      // 메인 페이지로 이동
      navigate('/');
    } catch (err: unknown) {
      handleError(err, 'OAuthKakaoRedirect');
      setNameUpdating(false);
    }
  };

  if (needsName) {
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
              <h1 className="text-2xl font-semibold text-white mb-2">이름을 입력해주세요</h1>
              <p className="text-sm text-slate-300">카카오 로그인을 완료하기 위해 이름이 필요합니다.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-200">
                  이름
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !nameUpdating && name.trim()) {
                      handleNameSubmit();
                    }
                  }}
                />
              </div>

              <Button
                onClick={handleNameSubmit}
                isLoading={nameUpdating}
                size="lg"
                className="w-full"
              >
                완료
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <OAuthLoadingScreen provider="kakao" />;
  }

  if (showReRegisterModal) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-orange-400/40 via-pink-500/30 to-purple-600/30 blur-3xl animate-gradient" />
          <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-sky-500/30 via-emerald-400/20 to-transparent blur-3xl animate-gradient" />
        </div>
        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur">
            <h2 className="mb-4 text-2xl font-bold text-white text-center">재가입 안내</h2>
            <p className="mb-6 text-slate-300 text-center">
              {reRegisterMessage}
            </p>
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">재가입할 이메일</p>
              <p className="text-lg font-semibold text-white">
                {pendingEmail ?? '이메일 정보를 불러오지 못했습니다.'}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                확인을 선택하면 위 이메일로 추가 입력 없이 재가입합니다.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/login')}
                disabled={isReRegistering}
                className="flex-1 rounded-2xl border border-white/20 bg-transparent px-4 py-3 text-white hover:bg-white/10 transition disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleReRegister}
                disabled={isReRegistering}
                className="flex-1 rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-fuchsia-600 px-4 py-3 text-white shadow-[0_10px_40px_rgba(249,115,22,0.35)] hover:shadow-[0_15px_45px_rgba(249,115,22,0.45)] hover:-translate-y-0.5 transition disabled:opacity-50"
              >
                {isReRegistering ? '처리 중...' : '재가입'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-6">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return null;
};
