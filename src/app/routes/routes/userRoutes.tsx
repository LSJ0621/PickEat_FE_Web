import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { AppLayout } from '@app/layouts/AppLayout';
import { PageLoadingFallback } from '@shared/components/PageLoadingFallback';
import { FeatureErrorBoundary } from '@shared/components/FeatureErrorBoundary';
import ProtectedRoute from '../ProtectedRoute';

const MyPage = lazy(() =>
  import('@features/user/pages/MyPage').then(m => ({ default: m.MyPage })),
);
const MyProfilePage = lazy(() =>
  import('@features/user/pages/mypage/MyProfilePage').then(m => ({ default: m.MyProfilePage })),
);
const MyPreferencesPage = lazy(() =>
  import('@features/user/pages/mypage/MyPreferencesPage').then(m => ({
    default: m.MyPreferencesPage,
  })),
);
const MyAddressPage = lazy(() =>
  import('@features/user/pages/mypage/MyAddressPage').then(m => ({ default: m.MyAddressPage })),
);
const UserPlaceListPage = lazy(() =>
  import('@features/user-place/pages/UserPlaceListPage').then(m => ({
    default: m.UserPlaceListPage,
  })),
);
const UserPlaceCreatePage = lazy(() =>
  import('@features/user-place/pages/UserPlaceCreatePage').then(m => ({
    default: m.UserPlaceCreatePage,
  })),
);
const UserPlaceEditPage = lazy(() =>
  import('@features/user-place/pages/UserPlaceEditPage').then(m => ({
    default: m.UserPlaceEditPage,
  })),
);

export const userRoutes: RouteObject[] = [
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
];
