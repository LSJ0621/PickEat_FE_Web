/**
 * 로그인 페이지
 */

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '@features/auth/api';
import { StatusPopupCard } from '@shared/components/StatusPopupCard';
import { LoginBrandPanel } from '@features/auth/components/LoginBrandPanel';
import { LoginFormPanel } from '@features/auth/components/LoginFormPanel';
import { useAppDispatch } from '@app/store/hooks';
import { initializeAuth, setLoading } from '@app/store/slices/authSlice';
import { ERROR_MESSAGES, STORAGE_KEYS } from '@shared/utils/constants';
import { getApiErrorMessage } from '@shared/utils/translateMessage';
import { isEmpty } from '@shared/utils/validation';

const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
const GOOGLE_SCOPE = 'openid email profile';

export const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    if (isSubmitting) {
      return;
    }

    if (isEmpty(email) || isEmpty(password)) {
      setErrorPopup({
        open: true,
        message: ERROR_MESSAGES.EMAIL_AND_PASSWORD_REQUIRED,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      dispatch(setLoading(true));
      const loginData = await authService.login({ email, password });

      if (!loginData.token) {
        throw new Error(t('auth.tokenNotIssued'));
      }

      localStorage.setItem(STORAGE_KEYS.TOKEN, loginData.token);
      await dispatch(initializeAuth()).unwrap();

      const redirectTo = location.state?.redirectTo;
      const safeRedirect =
        redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
          ? redirectTo
          : '/';
      navigate(safeRedirect);
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, t('auth.loginError'));
      setErrorPopup({ open: true, message });
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <StatusPopupCard
        open={errorPopup.open}
        title={t('auth.loginFailed')}
        message={errorPopup.message}
        variant="error"
        onConfirm={closeErrorPopup}
      />

      <LoginBrandPanel />

      <LoginFormPanel
        email={email}
        password={password}
        showPassword={showPassword}
        isSubmitting={isSubmitting}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onTogglePassword={() => setShowPassword((prev) => !prev)}
        onLogin={handleLogin}
        onGoogleLogin={handleGoogleLogin}
        onKakaoLogin={handleKakaoLogin}
        onRegister={handleRegister}
        onPasswordReset={handlePasswordReset}
      />
    </div>
  );
};
