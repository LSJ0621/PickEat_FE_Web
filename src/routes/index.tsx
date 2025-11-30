/**
 * 라우팅 설정
 * 모든 라우트를 한 곳에서 관리합니다.
 */

import { useEffect, useRef } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from '../pages/Home';
import { AgentPage } from '../pages/Agent';
import { LoginPage } from '../pages/Login';
import { MyPage } from '../pages/MyPage';
import { RecommendationHistory } from '../pages/RecommendationHistory';
import { RegisterPage } from '../pages/Register';
import { OAuthKakaoRedirect } from '../pages/OAuthKakaoRedirect';
import { OAuthGoogleRedirect } from '../pages/OAuthGoogleRedirect';
import { MapPage } from '../pages/Map';
import ProtectedRoute from './ProtectedRoute';
import { useAppDispatch } from '@/store/hooks';
import { initializeAuth } from '@/store/slices/authSlice';
import { AppLayout } from '@/components/layout/AppLayout';
import { PasswordResetRequestPage } from '@/pages/PasswordResetRequest';
import { PasswordResetPage } from '@/pages/PasswordReset';
import { ReRegisterPage } from '@/pages/ReRegister';

// 라우트 정의
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AppLayout>
        <HomePage />
      </AppLayout>
    ),
  },
  {
    path: '/agent',
    element: (
      <AppLayout>
        <ProtectedRoute>
          <AgentPage />
        </ProtectedRoute>
      </AppLayout>
    ),
  },
  {
    path: '/login',
    element: (
      <AppLayout>
        <LoginPage />
      </AppLayout>
    ),
  },
  {
    path: '/register',
    element: (
      <AppLayout>
        <RegisterPage />
      </AppLayout>
    ),
  },
  {
    path: '/password/reset/request',
    element: (
      <AppLayout>
        <PasswordResetRequestPage />
      </AppLayout>
    ),
  },
  {
    path: '/password/reset',
    element: (
      <AppLayout>
        <PasswordResetPage />
      </AppLayout>
    ),
  },
  {
    path: '/re-register',
    element: (
      <AppLayout>
        <ReRegisterPage />
      </AppLayout>
    ),
  },
  {
    path: '/mypage',
    element: (
      <AppLayout>
        <ProtectedRoute>
          <MyPage />
        </ProtectedRoute>
      </AppLayout>
    ),
  },
  {
    path: '/recommendations/history',
    element: (
      <AppLayout>
        <ProtectedRoute>
          <RecommendationHistory />
        </ProtectedRoute>
      </AppLayout>
    ),
  },
  {
    path: '/map',
    element: (
      <AppLayout>
        <ProtectedRoute>
          <MapPage />
        </ProtectedRoute>
      </AppLayout>
    ),
  },
  {
    path: '/oauth/kakao/redirect',
    element: (
      <AppLayout showHeader={false} showFooter={false}>
        <OAuthKakaoRedirect />
      </AppLayout>
    ),
  },
  {
    path: '/oauth/google/redirect',
    element: (
      <AppLayout showHeader={false} showFooter={false}>
        <OAuthGoogleRedirect />
      </AppLayout>
    ),
  },
]);

export default function Routes() {
  const dispatch = useAppDispatch();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;
    dispatch(initializeAuth());
  }, [dispatch]);

  return <RouterProvider router={router} />;
}
