/**
 * 카카오 OAuth 리다이렉트 페이지
 */

import { authService } from '@features/auth/api';
import { Button } from '@shared/components/Button';
import { OAuthLoadingScreen } from '@shared/components/OAuthLoadingScreen';
import { OAuthReRegisterModal } from '@features/auth/components/OAuthReRegisterModal';
import { useOAuthRedirect } from '@features/auth/hooks/useOAuthRedirect';
import { setCredentials } from '@app/store/slices/authSlice';
import type { KakaoLoginResponse } from '@features/auth/types';
import { ERROR_MESSAGES } from '@shared/utils/constants';
import { isEmpty } from '@shared/utils/validation';
import { useEffect, useState } from 'react';

export const OAuthKakaoRedirect = () => {
  const {
    loading,
    error,
    showReRegisterModal,
    pendingEmail,
    reRegisterMessage,
    isReRegistering,
    hasProcessed,
    dispatch,
    navigate,
    t,
    setLoading,
    setError,
    handleError,
    handleReRegisterError,
    handleGenericError,
    handleReRegister,
  } = useOAuthRedirect({ contextLabel: 'OAuthKakaoRedirect' });

  // 카카오 전용 상태: 이름 입력 플로우
  const [needsName, setNeedsName] = useState(false);
  const [name, setName] = useState('');
  const [nameUpdating, setNameUpdating] = useState(false);
  const [loginData, setLoginData] = useState<KakaoLoginResponse | null>(null);

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }

    const handleKakaoCallback = async () => {
      hasProcessed.current = true;

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (!code) {
        setError(t('oauth.error.noCode'));
        setLoading(false);
        return;
      }

      try {
        const data = await authService.kakaoLogin(code);

        if (!data.token) {
          throw new Error(t('oauth.error.noToken'));
        }

        setLoginData(data);

        // 카카오 전용: 이름이 없으면 이름 입력 화면으로
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
            preferredLanguage: 'ko',
            createdAt: new Date().toISOString(),
          },
          token: data.token,
        }));

        navigate('/');
      } catch (err: unknown) {
        if (handleReRegisterError(err)) return;
        handleGenericError(err);
      }
    };

    handleKakaoCallback();

    return () => {
      // 필요시 요청 취소 로직 추가 가능
    };
  }, [navigate, dispatch, t, setLoading, setError, handleReRegisterError, handleGenericError]);

  // 카카오 전용: 이름 제출 처리
  const handleNameSubmit = async () => {
    if (isEmpty(name)) {
      handleError(ERROR_MESSAGES.NAME_REQUIRED, 'OAuthKakaoRedirect');
      return;
    }

    setNameUpdating(true);
    try {
      const updatedUser = await authService.updateUser({ name: name.trim() });

      if (!loginData?.token) {
        throw new Error(t('oauth.error.noToken'));
      }

      dispatch(setCredentials({
        user: {
          email: loginData.email || '',
          name: updatedUser.name || '',
          address: loginData.address ?? null,
          latitude: loginData.latitude ?? null,
          longitude: loginData.longitude ?? null,
          preferences: loginData.preferences ?? null,
          preferredLanguage: 'ko',
          createdAt: new Date().toISOString(),
        },
        token: loginData.token,
      }));

      navigate('/');
    } catch (err: unknown) {
      handleError(err, 'OAuthKakaoRedirect');
      setNameUpdating(false);
    }
  };

  // 카카오 전용: 이름 입력 화면
  if (needsName) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-bg-primary px-4 py-10 text-text-primary">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-orange-300/30 via-orange-200/20 to-amber-100/20 blur-3xl animate-gradient" />
          <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-orange-200/20 via-amber-100/15 to-transparent blur-3xl animate-gradient" />
        </div>
        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-[32px] border border-border-default bg-bg-surface p-8 shadow-2xl shadow-black/10">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-2xl font-bold text-text-inverse shadow-lg shadow-orange-500/30">
                P
              </div>
              <h1 className="text-2xl font-semibold text-text-primary mb-2">{t('oauth.nameInput.title')}</h1>
              <p className="text-sm text-text-secondary">{t('oauth.nameInput.description')}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-text-primary">
                  {t('auth.name')}
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('auth.namePlaceholder')}
                  className="w-full rounded-2xl border border-border-default bg-bg-primary px-4 py-3 text-text-primary placeholder-text-placeholder transition focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  onKeyDown={(e) => {
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
                {t('oauth.nameInput.submit')}
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
      <OAuthReRegisterModal
        pendingEmail={pendingEmail}
        reRegisterMessage={reRegisterMessage}
        isReRegistering={isReRegistering}
        onConfirm={handleReRegister}
      />
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="text-center max-w-md p-6">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-brand-primary text-text-inverse rounded-lg font-semibold hover:bg-brand-secondary transition-colors"
          >
            {t('oauth.reRegister.backToLogin')}
          </button>
        </div>
      </div>
    );
  }

  return null;
};
