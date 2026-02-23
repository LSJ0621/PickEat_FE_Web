import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { AppLayout } from '@app/layouts/AppLayout';
import { PageLoadingFallback } from '@shared/components/PageLoadingFallback';
import { FeatureErrorBoundary } from '@shared/components/FeatureErrorBoundary';
import ProtectedRoute from '../ProtectedRoute';

const RecommendationHistory = lazy(() =>
  import('@features/history/pages/RecommendationHistory').then(m => ({
    default: m.RecommendationHistory,
  })),
);
const MenuSelectionHistory = lazy(() =>
  import('@features/history/pages/MenuSelectionHistory').then(m => ({
    default: m.MenuSelectionHistory,
  })),
);
const PlaceRatingHistory = lazy(() =>
  import('@features/rating/pages/PlaceRatingHistory').then(m => ({
    default: m.PlaceRatingHistory,
  })),
);

export const historyRoutes: RouteObject[] = [
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
];
