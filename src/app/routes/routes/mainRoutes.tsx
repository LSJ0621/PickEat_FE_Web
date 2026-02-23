import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { AppLayout } from '@app/layouts/AppLayout';
import { PageLoadingFallback } from '@shared/components/PageLoadingFallback';
import { FeatureErrorBoundary } from '@shared/components/FeatureErrorBoundary';
import ProtectedRoute from '../ProtectedRoute';

const HomePage = lazy(() =>
  import('@features/home/pages/Home').then(m => ({ default: m.HomePage })),
);
const AgentPage = lazy(() =>
  import('@features/agent/pages/Agent').then(m => ({ default: m.AgentPage })),
);
const MapPage = lazy(() =>
  import('@features/map/pages/Map').then(m => ({ default: m.MapPage })),
);

export const mainRoutes: RouteObject[] = [
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
];
