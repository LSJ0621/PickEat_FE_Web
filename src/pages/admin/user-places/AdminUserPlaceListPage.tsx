/**
 * 관리자용 유저 가게 목록 페이지
 */

import { adminService } from '@/api/services/admin';
import { AdminPageBackground } from '@/components/features/admin/common/AdminPageBackground';
import { UserPlaceFilters } from '@/components/features/admin/user-places/UserPlaceFilters';
import { UserPlaceList } from '@/components/features/admin/user-places/UserPlaceList';
import { UserPlaceListSkeleton } from '@/components/features/admin/user-places/UserPlaceListSkeleton';
import { UserPlaceDetailModal } from '@/components/features/admin/user-places/UserPlaceDetailModal';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppSelector } from '@/store/hooks';
import type { AdminUserPlaceListItem, UpdateUserPlaceByAdminRequest } from '@/types/admin';
import { handleApiError } from '@/utils/error';
import { isAdminRole } from '@/utils/role';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/common/useToast';

export const AdminUserPlaceListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const { success } = useToast();
  const userRole = useAppSelector((state) => state.auth?.user?.role);

  const [places, setPlaces] = useState<AdminUserPlaceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AdminUserPlaceListItem['status'] | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [selectedPlace, setSelectedPlace] = useState<AdminUserPlaceListItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [updating, setUpdating] = useState(false);

  // 권한 체크
  useEffect(() => {
    if (!isAdminRole(userRole)) {
      handleError(new Error('접근 권한이 없습니다.'), 'AdminUserPlaceListPage');
      navigate('/');
    }
  }, [userRole, navigate, handleError]);

  // 목록 조회
  const fetchPlaces = useCallback(async () => {
    if (!isAdminRole(userRole)) return;

    setLoading(true);
    try {
      const response = await adminService.getUserPlaces({
        page,
        limit: 20,
        search: search || undefined,
        status: status === 'ALL' ? undefined : status,
      });
      setPlaces(response.items);
      setPageInfo({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (error: unknown) {
      handleApiError(error, 'AdminUserPlaceListPage', handleError);
    } finally {
      setLoading(false);
    }
  }, [userRole, page, search, status, handleError]);

  useEffect(() => {
    if (isAdminRole(userRole)) {
      fetchPlaces();
    }
  }, [userRole, fetchPlaces]);

  const handleSearchChange = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  }, []);

  const handleStatusChange = (newStatus: AdminUserPlaceListItem['status'] | 'ALL') => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleReset = () => {
    setSearch('');
    setStatus('ALL');
    setPage(1);
  };

  const handleItemClick = (place: AdminUserPlaceListItem) => {
    setSelectedPlace(place);
    setShowDetailModal(true);
  };

  const handleApprove = useCallback(async (id: number) => {
    if (approving) return;

    setApproving(true);
    try {
      await adminService.approveUserPlace(id);
      success(t('admin.userPlaces.messages.approved') || '승인되었습니다.');
      setShowDetailModal(false);
      fetchPlaces();
    } catch (error: unknown) {
      handleApiError(error, 'AdminUserPlaceListPage.approve', handleError);
    } finally {
      setApproving(false);
    }
  }, [approving, success, t, fetchPlaces, handleError]);

  const handleReject = useCallback(async (id: number, reason: string) => {
    if (rejecting) return;

    setRejecting(true);
    try {
      await adminService.rejectUserPlace(id, reason);
      success(t('admin.userPlaces.messages.rejected') || '거절되었습니다.');
      setShowDetailModal(false);
      fetchPlaces();
    } catch (error: unknown) {
      handleApiError(error, 'AdminUserPlaceListPage.reject', handleError);
    } finally {
      setRejecting(false);
    }
  }, [rejecting, success, t, fetchPlaces, handleError]);

  const handleUpdate = useCallback(async (id: number, data: UpdateUserPlaceByAdminRequest) => {
    if (updating) return;

    setUpdating(true);
    try {
      await adminService.updateUserPlace(id, data);
      success('가게 정보가 수정되었습니다.');
      setShowDetailModal(false);
      fetchPlaces();
    } catch (error: unknown) {
      handleApiError(error, 'AdminUserPlaceListPage.update', handleError);
    } finally {
      setUpdating(false);
    }
  }, [updating, success, fetchPlaces, handleError]);

  if (!isAdminRole(userRole)) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen items-start justify-center bg-slate-950 px-4 pt-20 pb-10 text-white">
      <AdminPageBackground />

      <div className="relative z-10 w-full max-w-6xl">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-white">{t('admin.userPlaces.title')}</h1>
          <p className="text-slate-400">유저가 등록한 가게를 확인하고 승인/거절하세요.</p>
        </div>

        {/* 필터 */}
        <div className="mb-6">
          <UserPlaceFilters
            search={search}
            status={status}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
            onReset={handleReset}
          />
        </div>

        {/* 목록 */}
        {loading ? (
          <UserPlaceListSkeleton />
        ) : (
          <>
            <UserPlaceList places={places} onItemClick={handleItemClick} />

            {/* 페이지네이션 */}
            {pageInfo.total > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  총 {pageInfo.total}개 중{' '}
                  {pageInfo.page * pageInfo.limit - pageInfo.limit + 1}-
                  {Math.min(pageInfo.page * pageInfo.limit, pageInfo.total)}개 표시
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.previous')}
                  </button>
                  <span className="flex items-center px-4 text-sm text-slate-300">
                    {page} / {pageInfo.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= pageInfo.totalPages}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.next')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <UserPlaceDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        place={selectedPlace}
        onApprove={handleApprove}
        onReject={handleReject}
        onUpdate={handleUpdate}
        approving={approving}
        rejecting={rejecting}
        isUpdating={updating}
      />
    </div>
  );
};
