/**
 * 라우팅 설정
 * 모든 라우트를 한 곳에서 관리합니다.
 */

import { lazy, Suspense, useEffect, useRef } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import { ROUTES } from './paths';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initializeAuth } from '@/store/slices/authSlice';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageLoadingFallback } from '@/components/common/PageLoadingFallback';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { useRatingPrompt } from '@/hooks/rating/useRatingPrompt';
import { RatingPromptModal } from '@/components/features/rating/RatingPromptModal';
import { useOnboarding } from '@/hooks/onboarding/useOnboarding';
import { OnboardingModal } from '@/components/features/onboarding/OnboardingModal';

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

// User Place pages
const UserPlaceListPage = lazy(() => import('@/pages/user-place/UserPlaceListPage').then(m => ({ default: m.UserPlaceListPage })));
const UserPlaceCreatePage = lazy(() => import('@/pages/user-place/UserPlaceCreatePage').then(m => ({ default: m.UserPlaceCreatePage })));
const UserPlaceEditPage = lazy(() => import('@/pages/user-place/UserPlaceEditPage').then(m => ({ default: m.UserPlaceEditPage })));

// MyPage sub-pages
const MyProfilePage = lazy(() => import('@/pages/user/mypage/MyProfilePage').then(m => ({ default: m.MyProfilePage })));
const MyPreferencesPage = lazy(() => import('@/pages/user/mypage/MyPreferencesPage').then(m => ({ default: m.MyPreferencesPage })));
const MyAddressPage = lazy(() => import('@/pages/user/mypage/MyAddressPage').then(m => ({ default: m.MyAddressPage })));

// Rating pages
const PlaceRatingHistory = lazy(() => import('@/pages/rating/PlaceRatingHistory').then(m => ({ default: m.PlaceRatingHistory })));

// 404 Not Found page
const NotFoundPage = lazy(() => import('@/pages/NotFound').then(m => ({ default: m.NotFoundPage })));

// Admin pages
const AdminDashboardPage = lazy(() => import('@/pages/admin/dashboard/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminUserListPage = lazy(() => import('@/pages/admin/users/AdminUserListPage').then(m => ({ default: m.AdminUserListPage })));
const AdminUserDetailPage = lazy(() => import('@/pages/admin/users/AdminUserDetailPage').then(m => ({ default: m.AdminUserDetailPage })));
const AdminUserPlaceListPage = lazy(() => import('@/pages/admin/user-places/AdminUserPlaceListPage').then(m => ({ default: m.AdminUserPlaceListPage })));
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
          <FeatureErrorBoundary featureName="Home" fallbackMessage="홈 페이지를 불러오지 못했습니다">
            <HomePage />
          </FeatureErrorBoundary>
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
            <FeatureErrorBoundary featureName="Agent" fallbackMessage="AI 추천 기능을 불러오지 못했습니다">
              <AgentPage />
            </FeatureErrorBoundary>
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
            <FeatureErrorBoundary featureName="MyPage" fallbackMessage="마이페이지를 불러오지 못했습니다">
              <MyPage />
            </FeatureErrorBoundary>
          </ProtectedRoute>
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/mypage/profile',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <ProtectedRoute>
            <FeatureErrorBoundary featureName="MyProfile" fallbackMessage="프로필 페이지를 불러오지 못했습니다">
              <MyProfilePage />
            </FeatureErrorBoundary>
          </ProtectedRoute>
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/mypage/preferences',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <ProtectedRoute>
            <FeatureErrorBoundary featureName="MyPreferences" fallbackMessage="선호도 페이지를 불러오지 못했습니다">
              <MyPreferencesPage />
            </FeatureErrorBoundary>
          </ProtectedRoute>
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/mypage/address',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <ProtectedRoute>
            <FeatureErrorBoundary featureName="MyAddress" fallbackMessage="주소 페이지를 불러오지 못했습니다">
              <MyAddressPage />
            </FeatureErrorBoundary>
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
            <FeatureErrorBoundary featureName="RecommendationHistory" fallbackMessage="추천 이력을 불러오지 못했습니다">
              <RecommendationHistory />
            </FeatureErrorBoundary>
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
            <FeatureErrorBoundary featureName="MenuSelectionHistory" fallbackMessage="메뉴 선택 이력을 불러오지 못했습니다">
              <MenuSelectionHistory />
            </FeatureErrorBoundary>
          </ProtectedRoute>
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/ratings/history',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <ProtectedRoute>
            <FeatureErrorBoundary featureName="RatingsHistory" fallbackMessage="평가 이력을 불러오지 못했습니다">
              <PlaceRatingHistory />
            </FeatureErrorBoundary>
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
            <FeatureErrorBoundary featureName="Map" fallbackMessage="지도를 불러오지 못했습니다">
              <MapPage />
            </FeatureErrorBoundary>
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
            <FeatureErrorBoundary featureName="BugReport" fallbackMessage="버그 신고 페이지를 불러오지 못했습니다">
              <BugReportPage />
            </FeatureErrorBoundary>
          </ProtectedRoute>
        </Suspense>
      </AppLayout>
    ),
  },
  // User Place routes
  {
    path: '/user-places',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <ProtectedRoute>
            <FeatureErrorBoundary featureName="UserPlaceList" fallbackMessage="내 장소 목록을 불러오지 못했습니다">
              <UserPlaceListPage />
            </FeatureErrorBoundary>
          </ProtectedRoute>
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/user-places/create',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <ProtectedRoute>
            <FeatureErrorBoundary featureName="UserPlaceCreate" fallbackMessage="장소 등록 페이지를 불러오지 못했습니다">
              <UserPlaceCreatePage />
            </FeatureErrorBoundary>
          </ProtectedRoute>
        </Suspense>
      </AppLayout>
    ),
  },
  {
    path: '/user-places/:id/edit',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <ProtectedRoute>
            <FeatureErrorBoundary featureName="UserPlaceEdit" fallbackMessage="장소 수정 페이지를 불러오지 못했습니다">
              <UserPlaceEditPage />
            </FeatureErrorBoundary>
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
    path: '/admin/user-places',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <AdminRoute>
            <AdminLayout>
              <AdminUserPlaceListPage />
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
  // Catch-all route - must be last
  {
    path: '*',
    element: (
      <AppLayout>
        <Suspense fallback={<PageLoadingFallback />}>
          <NotFoundPage />
        </Suspense>
      </AppLayout>
    ),
  },
]);

export default function Routes() {
  const dispatch = useAppDispatch();
  const hasInitialized = useRef(false);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const {
    pendingRating,
    isModalOpen,
    isSubmitting,
    checkPendingRating,
    skipPlace,
    dismissRating,
    dismissPermanently,
    goToHistory,
  } = useRatingPrompt();
  const {
    isOpen: isOnboardingOpen,
    currentStep,
    totalSteps,
    checkOnboarding,
    nextStep,
    prevStep,
    complete: completeOnboarding,
    skip: skipOnboarding,
  } = useOnboarding();
  const lastCheckedDate = useRef(new Date().toDateString());

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      checkPendingRating();
      checkOnboarding();
    }
  }, [isAuthenticated, checkPendingRating, checkOnboarding]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      const today = new Date().toDateString();
      if (today !== lastCheckedDate.current) {
        lastCheckedDate.current = today;
        checkPendingRating();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, checkPendingRating]);

  const handleGoToHistory = () => {
    goToHistory();
    router.navigate(ROUTES.RATINGS_HISTORY);
  };

  return (
    <>
      <RouterProvider router={router} />
      <RatingPromptModal
        open={isModalOpen}
        placeName={pendingRating?.placeName ?? ''}
        onGoToHistory={handleGoToHistory}
        onSkipPlace={skipPlace}
        onDismiss={dismissRating}
        onNeverShow={dismissPermanently}
        isSubmitting={isSubmitting}
      />
      <OnboardingModal
        isOpen={isOnboardingOpen}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={nextStep}
        onPrev={prevStep}
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
      />
    </>
  );
}
