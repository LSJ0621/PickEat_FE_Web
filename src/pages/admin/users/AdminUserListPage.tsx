/**
 * 관리자용 사용자 목록 페이지
 */

import { adminService } from '@/api/services/admin';
import { AdminPageBackground } from '@/components/features/admin/common/AdminPageBackground';
import { UserFilters } from '@/components/features/admin/users/UserFilters';
import { UserList } from '@/components/features/admin/users/UserList';
import { UserListSkeleton } from '@/components/features/admin/users/UserListSkeleton';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppSelector } from '@/store/hooks';
import type { AdminUserListItem } from '@/types/admin';
import { handleApiError } from '@/utils/error';
import { isAdminRole } from '@/utils/role';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminUserListPage = () => {
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const userRole = useAppSelector((state) => state.auth?.user?.role);

  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [socialType, setSocialType] = useState<AdminUserListItem['socialType'] | 'ALL'>('ALL');
  const [status, setStatus] = useState<AdminUserListItem['status'] | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    hasNext: false,
  });

  // 권한 체크
  useEffect(() => {
    if (!isAdminRole(userRole)) {
      handleError(new Error('접근 권한이 없습니다.'), 'AdminUserListPage');
      navigate('/');
    }
  }, [userRole, navigate, handleError]);

  // 목록 조회
  const fetchUsers = useCallback(async () => {
    if (!isAdminRole(userRole)) return;

    setLoading(true);
    try {
      const response = await adminService.getUsers({
        page,
        limit: 20,
        search: search || undefined,
        socialType: socialType === 'ALL' ? undefined : socialType || undefined,
        status: status === 'ALL' ? undefined : status,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
      setUsers(response.items);
      setPageInfo(response.pageInfo);
    } catch (error: unknown) {
      handleApiError(error, 'AdminUserListPage', handleError);
    } finally {
      setLoading(false);
    }
  }, [userRole, page, search, socialType, status, startDate, endDate, handleError]);

  useEffect(() => {
    if (isAdminRole(userRole)) {
      fetchUsers();
    }
  }, [userRole, fetchUsers]);

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  };

  const handleSocialTypeChange = (newSocialType: AdminUserListItem['socialType'] | 'ALL') => {
    setSocialType(newSocialType);
    setPage(1);
  };

  const handleStatusChange = (newStatus: AdminUserListItem['status'] | 'ALL') => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleStartDateChange = (newDate: string) => {
    setStartDate(newDate);
    setPage(1);
  };

  const handleEndDateChange = (newDate: string) => {
    setEndDate(newDate);
    setPage(1);
  };

  const handleReset = () => {
    setSearch('');
    setSocialType('ALL');
    setStatus('ALL');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleItemClick = (user: AdminUserListItem) => {
    navigate(`/admin/users/${user.id}`);
  };

  if (!isAdminRole(userRole)) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen items-start justify-center bg-bg-primary px-4 pt-20 pb-10 text-text-primary">
      <AdminPageBackground />

      <div className="relative z-10 w-full max-w-6xl">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-text-primary">사용자 관리</h1>
          <p className="text-text-tertiary">등록된 사용자를 확인하고 관리하세요.</p>
        </div>

        {/* 필터 */}
        <div className="mb-6">
          <UserFilters
            search={search}
            socialType={socialType}
            status={status}
            startDate={startDate}
            endDate={endDate}
            onSearchChange={handleSearchChange}
            onSocialTypeChange={handleSocialTypeChange}
            onStatusChange={handleStatusChange}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            onReset={handleReset}
          />
        </div>

        {/* 목록 */}
        {loading ? (
          <UserListSkeleton />
        ) : (
          <>
            <UserList users={users} onItemClick={handleItemClick} />

            {/* 페이지네이션 */}
            {pageInfo.totalCount > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-text-tertiary">
                  총 {pageInfo.totalCount}개 중 {pageInfo.page * pageInfo.limit - pageInfo.limit + 1}-
                  {Math.min(pageInfo.page * pageInfo.limit, pageInfo.totalCount)}개 표시
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-border-default bg-bg-surface px-4 py-2 text-sm text-text-primary transition hover:bg-bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>
                  <span className="flex items-center px-4 text-sm text-text-secondary">
                    {page} / {Math.ceil(pageInfo.totalCount / pageInfo.limit)}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pageInfo.hasNext}
                    className="rounded-lg border border-border-default bg-bg-surface px-4 py-2 text-sm text-text-primary transition hover:bg-bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
