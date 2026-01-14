/**
 * 관리자 대시보드 관련 타입 정의
 */

// Dashboard Types
export interface DashboardSummary {
  today: {
    newUsers: number;
    menuRecommendations: number;
    bugReports: number;
  };
  total: {
    users: number;
    menuRecommendations: number;
    bugReports: number;
  };
  pending: {
    unconfirmedBugReports: number;
    urgentBugReports: number;
  };
}

export interface RecentActivities {
  recentUsers: Array<{
    id: number;
    email: string;
    socialType: string | null;
    createdAt: string;
  }>;
  recentBugReports: Array<{
    id: number;
    title: string;
    category: string;
    createdAt: string;
  }>;
  recentDeletedUsers: Array<{
    id: number;
    email: string;
    deletedAt: string;
  }>;
}

export interface TrendData {
  users: Array<{ date: string; count: number }>;
  recommendations: Array<{ date: string; count: number }>;
}

export type TrendPeriod = '7d' | '30d' | '90d';
export type TrendType = 'users' | 'recommendations' | 'all';

// User Management Types
export interface AdminUserListItem {
  id: number;
  email: string;
  name: string | null;
  socialType: 'EMAIL' | 'KAKAO' | 'GOOGLE' | null;
  createdAt: string;
  status: 'active' | 'deleted' | 'deactivated';
}

export interface AdminUserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'lastActiveAt' | 'name';
  sortOrder?: 'ASC' | 'DESC';
  socialType?: 'EMAIL' | 'KAKAO' | 'GOOGLE';
  status?: 'active' | 'deleted' | 'deactivated';
  startDate?: string;
  endDate?: string;
}

export interface AdminUserListResponse {
  items: AdminUserListItem[];
  pageInfo: {
    page: number;
    limit: number;
    totalCount: number;
    hasNext: boolean;
  };
}

export interface AdminUserDetail {
  id: number;
  email: string;
  name: string | null;
  socialType: 'EMAIL' | 'KAKAO' | 'GOOGLE' | null;
  emailVerified: boolean;
  createdAt: string;
  deletedAt: string | null;
  isDeactivated: boolean;
  preferences: {
    likes: string[];
    dislikes: string[];
  } | null;
  addresses: Array<{
    id: number;
    alias: string | null;
    roadAddress: string;
    isDefault: boolean;
    isSearchAddress: boolean;
  }>;
  stats: {
    menuRecommendations: number;
    menuSelections: number;
    bugReports: number;
  };
  recentActivities: {
    recommendations: Array<{
      id: number;
      recommendations: string[];
      requestAddress: string;
      createdAt: string;
    }>;
    bugReports: Array<{
      id: number;
      title: string;
      category: string;
      status: string;
      createdAt: string;
    }>;
  };
}
