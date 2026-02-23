import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { AppLayout } from '@app/layouts/AppLayout';
import { AdminLayout } from '@app/layouts/AdminLayout';
import { PageLoadingFallback } from '@shared/components/PageLoadingFallback';
import AdminRoute from '../AdminRoute';

const AdminDashboardPage = lazy(() =>
  import('@features/admin/pages/dashboard/AdminDashboardPage').then(m => ({
    default: m.AdminDashboardPage,
  })),
);
const AdminUserListPage = lazy(() =>
  import('@features/admin/pages/users/AdminUserListPage').then(m => ({
    default: m.AdminUserListPage,
  })),
);
const AdminUserDetailPage = lazy(() =>
  import('@features/admin/pages/users/AdminUserDetailPage').then(m => ({
    default: m.AdminUserDetailPage,
  })),
);
const AdminUserPlaceListPage = lazy(() =>
  import('@features/admin/pages/user-places/AdminUserPlaceListPage').then(m => ({
    default: m.AdminUserPlaceListPage,
  })),
);
const AdminBugReportListPage = lazy(() =>
  import('@features/admin/pages/bug-reports/AdminBugReportListPage').then(m => ({
    default: m.AdminBugReportListPage,
  })),
);
const AdminBugReportDetailPage = lazy(() =>
  import('@features/admin/pages/bug-reports/AdminBugReportDetailPage').then(m => ({
    default: m.AdminBugReportDetailPage,
  })),
);
const AdminSettingsPage = lazy(() =>
  import('@features/admin/pages/settings/AdminSettingsPage').then(m => ({
    default: m.AdminSettingsPage,
  })),
);

export const adminRoutes: RouteObject[] = [
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
];
