/**
 * Admin feature barrel export
 */

// Types
export type {
  DashboardSummary,
  RecentActivities,
  TrendData,
  TrendPeriod,
  TrendType,
  AdminUserListItem,
  AdminUserListQuery,
  AdminUserListResponse,
  AdminUserDetail,
  AdminUserPlaceListItem,
  AdminUserPlaceListQuery,
  AdminUserPlaceListResponse,
  UpdateUserPlaceByAdminRequest,
} from './types';

export type {
  AdminRole,
  AdminUser,
  PromoteAdminRequest,
  AdminListResponse,
  PromoteAdminResponse,
  DemoteAdminResponse,
} from './types-settings';

// API Services
export { adminService } from './api';
export { adminSettingsService } from './api-settings';

// Hooks
export { useUserPlaceDetailForm } from './hooks/useUserPlaceDetailForm';

// Pages
export { AdminDashboardPage } from './pages/dashboard/AdminDashboardPage';
export { AdminSettingsPage } from './pages/settings/AdminSettingsPage';
export { AdminBugReportDetailPage } from './pages/bug-reports/AdminBugReportDetailPage';
export { AdminBugReportListPage } from './pages/bug-reports/AdminBugReportListPage';
export { AdminUserPlaceListPage } from './pages/user-places/AdminUserPlaceListPage';
export { AdminUserDetailPage } from './pages/users/AdminUserDetailPage';
export { AdminUserListPage } from './pages/users/AdminUserListPage';
