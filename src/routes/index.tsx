/**
 * 라우팅 설정
 * 모든 라우트를 한 곳에서 관리합니다.
 */

import { lazy, Suspense, useEffect, useRef } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import { useAppDispatch } from '@/store/hooks';
import { initializeAuth } from '@/store/slices/authSlice';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageLoadingFallback } from '@/components/common/PageLoadingFallback';

// Lazy imports - 모든 페이지를 동적으로 로드
const HomePage = lazy(() => import('@/pages/main/Home').then(m => ({ default: m.HomePage })));
const AgentPage = lazy(() => import('@/pages/main/Agent').then(m => ({ default: m.AgentPage })));
const MapPage = lazy(() => import('@/pages/main/Map').then(m => ({ default: m.MapPage })));
const MyPage = lazy(() => import('@/pages/user/MyPage').then(m => ({ default: m.MyPage })));
const RecommendationHistory = lazy(() => import('@/pages/history/RecommendationHistory').then(m => ({ default: m.RecommendationHistory })));
const MenuSelectionHistory = lazy(() => import('@/pages/history/MenuSelectionHistory').then(m => ({ default: m.MenuSelectionHistory })));
const LoginPage = lazy(() => import('@/pages/auth/Login').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/Register').then(m => ({ default: m.RegisterPage })));
const PasswordResetRequestPage = lazy(() => import('@/pages/auth/PasswordResetRequest').then(m => ({ default: m.PasswordResetRequestPage })));
const PasswordResetPage = lazy(() => import('@/pages/auth/PasswordReset').then(m => ({ default: m.PasswordResetPage })));
const ReRegisterPage = lazy(() => import('@/pages/auth/ReRegister').then(m => ({ default: m.ReRegisterPage })));
const BugReportPage = lazy(() => import('@/pages/bug-report/BugReportPage').then(m => ({ default: m.BugReportPage })));
const OAuthKakaoRedirect = lazy(() => import('@/pages/auth/oauth/OAuthKakaoRedirect').then(m => ({ default: m.OAuthKakaoRedirect })));
const OAuthGoogleRedirect = lazy(() => import('@/pages/auth/oauth/OAuthGoogleRedirect').then(m => ({ default: m.OAuthGoogleRedirect })));

// Admin pages
const AdminDashboardPage = lazy(() => import('@/pages/admin/dashboard/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminUserListPage = lazy(() => import('@/pages/admin/users/AdminUserListPage').then(m => ({ default: m.AdminUserListPage })));
const AdminUserDetailPage = lazy(() => import('@/pages/admin/users/AdminUserDetailPage').then(m => ({ default: m.AdminUserDetailPage })));
const AdminBugReportListPage = lazy(() => import('@/pages/admin/bug-reports/AdminBugReportListPage').then(m => ({ default: m.AdminBugReportListPage })));
const AdminBugReportDetailPage = lazy(() => import('@/pages/admin/bug-reports/AdminBugReportDetailPage').then(m => ({ default: m.AdminBugReportDetailPage })));
const AdminSettingsPage = lazy(() => import('@/pages/admin/settings/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));

// 라우트 정의 - 모든 페이지를 Suspense로 감싸기
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <HomePage />
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/agent',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <ProtectedRoute>
            <AgentPage />
          </ProtectedRoute>
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/login',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <LoginPage />
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/register',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <RegisterPage />
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/password/reset/request',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <PasswordResetRequestPage />
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/password/reset',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <PasswordResetPage />
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/re-register',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <ReRegisterPage />
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/mypage',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/recommendations/history',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <ProtectedRoute>
            <RecommendationHistory />
          </ProtectedRoute>
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/menu-selections/history',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <ProtectedRoute>
            <MenuSelectionHistory />
          </ProtectedRoute>
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/map',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <ProtectedRoute>
            <MapPage />
          </ProtectedRoute>
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/oauth/kakao/redirect',
    element: (
      <AppLayout showHeader={false} showFooter={false}>
        <Suspense fallback={<PageLoadingFallback />}>
          <OAuthKakaoRedirect />
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/oauth/google/redirect',
    element: (
      <AppLayout showHeader={false} showFooter={false}>
        <Suspense fallback={<PageLoadingFallback />}>
          <OAuthGoogleRedirect />
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/bug-report',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <ProtectedRoute>
            <BugReportPage />
          </ProtectedRoute>
        </Suspense>
      </AppLayout>
    ),
  },
  // Admin routes
  {
    path: '/admin',
    element: <Navigate to="/admin/dashboard" replace />,
  },
  {
    path: '/admin/dashboard',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <AdminRoute>
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          </AdminRoute>
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <AdminRoute>
            <AdminLayout>
              <AdminUserListPage />
            </AdminLayout>
          </AdminRoute>
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/admin/users/:id',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <AdminRoute>
            <AdminLayout>
              <AdminUserDetailPage />
            </AdminLayout>
          </AdminRoute>
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/admin/bug-reports',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <AdminRoute>
            <AdminLayout>
              <AdminBugReportListPage />
            </AdminLayout>
          </AdminRoute>
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/admin/bug-reports/:id',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <AdminRoute>
            <AdminLayout>
              <AdminBugReportDetailPage />
            </AdminLayout>
          </AdminRoute>
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/admin/settings',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <AdminRoute>
            <AdminLayout>
              <AdminSettingsPage />
            </AdminLayout>
          </AdminRoute>
        </Suspense>
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
