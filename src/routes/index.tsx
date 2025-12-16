/**
 * 라우팅 설정
 * 모든 라우트를 한 곳에서 관리합니다.
 */

import { useEffect, useRef } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from '@/pages/main/Home';
import { AgentPage } from '@/pages/main/Agent';
import { LoginPage } from '@/pages/auth/Login';
import { MyPage } from '@/pages/user/MyPage';
import { RecommendationHistory } from '@/pages/history/RecommendationHistory';
import { MenuSelectionHistory } from '@/pages/history/MenuSelectionHistory';
import { RegisterPage } from '@/pages/auth/Register';
import { OAuthKakaoRedirect } from '@/pages/auth/oauth/OAuthKakaoRedirect';
import { OAuthGoogleRedirect } from '@/pages/auth/oauth/OAuthGoogleRedirect';
import { MapPage } from '@/pages/main/Map';
import ProtectedRoute from './ProtectedRoute';
import { useAppDispatch } from '@/store/hooks';
import { initializeAuth } from '@/store/slices/authSlice';
import { AppLayout } from '@/components/layout/AppLayout';
import { PasswordResetRequestPage } from '@/pages/auth/PasswordResetRequest';
import { PasswordResetPage } from '@/pages/auth/PasswordReset';
import { ReRegisterPage } from '@/pages/auth/ReRegister';
import { BugReportPage } from '@/pages/bug-report/BugReportPage';
import { AdminBugReportListPage } from '@/pages/admin/bug-reports/AdminBugReportListPage';

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
    path: '/menu-selections/history',
    element: (
      <AppLayout>
        <ProtectedRoute>
          <MenuSelectionHistory />
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
  {
    path: '/bug-report',
    element: (
      <AppLayout>
        <ProtectedRoute>
          <BugReportPage />
        </ProtectedRoute>
      </AppLayout>
    ),
  },
  {
    path: '/admin/bug-reports',
    element: (
      <AppLayout>
        <ProtectedRoute>
          <AdminBugReportListPage />
        </ProtectedRoute>
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
