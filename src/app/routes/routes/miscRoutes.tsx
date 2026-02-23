import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { AppLayout } from '@app/layouts/AppLayout';
import { PageLoadingFallback } from '@shared/components/PageLoadingFallback';
import { FeatureErrorBoundary } from '@shared/components/FeatureErrorBoundary';
import ProtectedRoute from '../ProtectedRoute';

const BugReportPage = lazy(() =>
  import('@features/bug-report/pages/BugReportPage').then(m => ({ default: m.BugReportPage })),
);
const NotFoundPage = lazy(() =>
  import('@app/routes/NotFound').then(m => ({ default: m.NotFoundPage })),
);

export const miscRoutes: RouteObject[] = [
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
];
