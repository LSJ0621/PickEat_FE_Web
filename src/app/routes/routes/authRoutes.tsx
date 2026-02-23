import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { AppLayout } from '@app/layouts/AppLayout';
import { PageLoadingFallback } from '@shared/components/PageLoadingFallback';

const LoginPage = lazy(() =>
  import('@features/auth/pages/Login').then(m => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('@features/auth/pages/Register').then(m => ({ default: m.RegisterPage })),
);
const PasswordResetRequestPage = lazy(() =>
  import('@features/auth/pages/PasswordResetRequest').then(m => ({
    default: m.PasswordResetRequestPage,
  })),
);
const PasswordResetPage = lazy(() =>
  import('@features/auth/pages/PasswordReset').then(m => ({ default: m.PasswordResetPage })),
);
const ReRegisterPage = lazy(() =>
  import('@features/auth/pages/ReRegister').then(m => ({ default: m.ReRegisterPage })),
);
const OAuthKakaoRedirect = lazy(() =>
  import('@features/auth/pages/oauth/OAuthKakaoRedirect').then(m => ({
    default: m.OAuthKakaoRedirect,
  })),
);
const OAuthGoogleRedirect = lazy(() =>
  import('@features/auth/pages/oauth/OAuthGoogleRedirect').then(m => ({
    default: m.OAuthGoogleRedirect,
  })),
);

export const authRoutes: RouteObject[] = [
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
];
