/**
 * 구글 OAuth 리다이렉트 페이지
 */

import { authService } from '@/api/services/auth';
import { OAuthLoadingScreen } from '@/components/common/OAuthLoadingScreen';
import { OAuthReRegisterModal } from '@/components/features/auth/OAuthReRegisterModal';
import { useOAuthRedirect } from '@/hooks/auth/useOAuthRedirect';
import { setCredentials } from '@/store/slices/authSlice';
import { useEffect } from 'react';

export const OAuthGoogleRedirect = () => {
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
    handleReRegisterError,
    handleGenericError,
    handleReRegister,
  } = useOAuthRedirect({ contextLabel: 'OAuthGoogleRedirect' });

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }

    const handleGoogleCallback = async () => {
      hasProcessed.current = true;

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (!code) {
        setError(t('oauth.error.noCode'));
        setLoading(false);
        return;
      }

      try {
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
            preferredLanguage: 'ko',
            createdAt: new Date().toISOString(),
          },
          token: loginData.token,
        }));

        navigate('/');
      } catch (err: unknown) {
        if (handleReRegisterError(err)) return;
        handleGenericError(err);
      }
    };

    handleGoogleCallback();

    return () => {
      // 필요시 요청 취소 로직 추가 가능
    };
  }, [navigate, dispatch, t, setLoading, setError, handleReRegisterError, handleGenericError]);

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

  if (loading) {
    return <OAuthLoadingScreen provider="google" />;
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
