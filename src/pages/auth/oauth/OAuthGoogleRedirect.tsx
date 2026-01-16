/**
 * 구글 OAuth 리다이렉트 페이지
 */

import { authService } from '@/api/services/auth';
import { OAuthLoadingScreen } from '@/components/common/OAuthLoadingScreen';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { isAxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const OAuthGoogleRedirect = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReRegisterModal, setShowReRegisterModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [reRegisterMessage, setReRegisterMessage] = useState(t('oauth.reRegister.message'));
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

    const handleGoogleCallback = async () => {
      // 처리 시작 표시
      hasProcessed.current = true;
      
      // URL에서 code 파라미터 추출
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (!code) {
        setError(t('oauth.error.noCode'));
        setLoading(false);
        return;
      }

      try {
        // 서버에 코드 전달하여 로그인
        const loginData = await authService.googleLogin(code);

        if (!loginData.token) {
          throw new Error(t('oauth.error.noToken'));
        }

        dispatch(setCredentials({
          user: {
            email: loginData.email || '',
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
            setReRegisterMessage(errorData.message || t('oauth.reRegister.message'));
            setShowReRegisterModal(true);
            setLoading(false);
            return;
          }
        }

        // 그 외 에러 처리
        handleError(err, 'OAuthGoogleRedirect');
        const statusCode = isAxiosError(err) ? err.response?.status : undefined;
        setError(`${t('oauth.error.loginFailed')}${statusCode ? ` (${t('oauth.error.statusCode')}: ${statusCode})` : ''}`);
        setLoading(false);
      }
    };

    handleGoogleCallback();
    
    // cleanup 함수: 컴포넌트 언마운트 시 처리 취소 (필요시)
    return () => {
      // 필요시 요청 취소 로직 추가 가능
    };
  }, [navigate, dispatch, handleError]);

  // 재가입 처리
  const handleReRegister = async () => {
    if (!pendingEmail) {
      handleError(t('oauth.reRegister.noEmail'), 'OAuthGoogleRedirect');
      return;
    }

    setIsReRegistering(true);
    try {
      // 소셜 재가입 API 호출 (이메일만 전송)
      await authService.reRegisterSocial({
        email: pendingEmail,
      });

      // 재가입 성공: 로그인 화면으로 이동 (자동 로그인 없음)
      handleSuccess(t('oauth.reRegister.success'));
      navigate('/login');
    } catch (err: unknown) {
      handleError(err, 'OAuthGoogleRedirect');
      setIsReRegistering(false);
    }
  };

  if (showReRegisterModal) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-orange-400/40 via-pink-500/30 to-purple-600/30 blur-3xl animate-gradient" />
          <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-sky-500/30 via-emerald-400/20 to-transparent blur-3xl animate-gradient" />
        </div>
        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur">
            <h2 className="mb-4 text-2xl font-bold text-white text-center">{t('oauth.reRegister.title')}</h2>
            <p className="mb-6 text-slate-300 text-center">
              {reRegisterMessage}
            </p>
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">{t('oauth.reRegister.emailLabel')}</p>
              <p className="text-lg font-semibold text-white">
                {pendingEmail ?? t('oauth.reRegister.emailNotFound')}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {t('oauth.reRegister.confirmDescription')}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/login')}
                disabled={isReRegistering}
                className="flex-1 rounded-2xl border border-white/20 bg-transparent px-4 py-3 text-white hover:bg-white/10 transition disabled:opacity-50"
              >
                {t('oauth.reRegister.cancel')}
              </button>
              <button
                onClick={handleReRegister}
                disabled={isReRegistering}
                className="flex-1 rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-fuchsia-600 px-4 py-3 text-white shadow-[0_10px_40px_rgba(249,115,22,0.35)] hover:shadow-[0_15px_45px_rgba(249,115,22,0.45)] hover:-translate-y-0.5 transition disabled:opacity-50"
              >
                {isReRegistering ? t('oauth.reRegister.processing') : t('oauth.reRegister.confirm')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <OAuthLoadingScreen provider="google" />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-6">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            {t('oauth.reRegister.backToLogin')}
          </button>
        </div>
      </div>
    );
  }

  return null;
};
