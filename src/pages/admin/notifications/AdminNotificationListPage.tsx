/**
 * 관리자용 공지사항 목록 페이지
 */

import { notificationService } from '@/api/services/notification';
import { AdminPageBackground } from '@/components/features/admin/common/AdminPageBackground';
import {
  NotificationFilters,
  NotificationList,
  NotificationListSkeleton,
} from '@/components/features/admin/notifications';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppSelector } from '@/store/hooks';
import type { Notification, NotificationStatus, NotificationType } from '@/types/notification';
import { handleApiError } from '@/utils/error';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminNotificationListPage = () => {
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const userRole = useAppSelector((state) => state.auth?.user?.role);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<NotificationStatus | 'ALL' | undefined>('ALL');
  const [type, setType] = useState<NotificationType | 'ALL' | undefined>('ALL');
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    hasNext: false,
  });

  // 권한 체크
  useEffect(() => {
    if (userRole !== 'ADMIN') {
      handleError(new Error('접근 권한이 없습니다.'), 'AdminNotificationListPage');
      navigate('/');
    }
  }, [userRole, navigate, handleError]);

  // 목록 조회
  const fetchNotifications = useCallback(async () => {
    if (userRole !== 'ADMIN') return;

    setLoading(true);
    try {
      const response = await notificationService.getNotificationList({
        page,
        limit: 20,
        status: status === 'ALL' || !status ? undefined : status,
        type: type === 'ALL' || !type ? undefined : type,
      });
      setNotifications(response.items);
      setPageInfo(response.pageInfo);
    } catch (error: unknown) {
      handleApiError(error, 'AdminNotificationListPage', handleError);
    } finally {
      setLoading(false);
    }
  }, [userRole, page, status, type, handleError]);

  useEffect(() => {
    if (userRole === 'ADMIN') {
      fetchNotifications();
    }
  }, [userRole, fetchNotifications]);

  const handleFilterStatusChange = (newStatus: NotificationStatus | 'ALL' | undefined) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleFilterTypeChange = (newType: NotificationType | 'ALL' | undefined) => {
    setType(newType);
    setPage(1);
  };

  const handleReset = () => {
    setStatus('ALL');
    setType('ALL');
    setPage(1);
  };

  const handleItemClick = (notification: Notification) => {
    navigate(`/admin/notifications/${notification.id}`);
  };

  const handleCreateClick = () => {
    navigate('/admin/notifications/new');
  };

  // TODO: Implement delete functionality when needed
  // const handleDeleteClick = async (id: number) => {
  //   if (!window.confirm('정말 삭제하시겠습니까?')) {
  //     return;
  //   }

  //   try {
  //     await notificationService.deleteNotification(id);
  //     handleSuccess('공지사항이 삭제되었습니다.');
  //     await fetchNotifications();
  //   } catch (error: unknown) {
  //     if (error instanceof Error && error.message.includes('Network')) {
  //       handleError(new Error('네트워크 연결을 확인해주세요.'), 'AdminNotificationListPage');
  //     } else {
  //       handleError(error, 'AdminNotificationListPage');
  //     }
  //   }
  // };

  if (userRole !== 'ADMIN') {
    return null;
  }

  return (
    <div className="relative flex min-h-screen items-start justify-center bg-slate-950 px-4 pt-20 pb-10 text-white">
      <AdminPageBackground />

      <div className="relative z-10 w-full max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">공지사항 관리</h1>
            <p className="text-slate-400">공지사항을 생성하고 관리하세요.</p>
          </div>
          <button
            onClick={handleCreateClick}
            className="rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-2 text-sm font-medium text-white transition hover:from-orange-600 hover:to-pink-600"
          >
            새 공지사항
          </button>
        </div>

        {/* 필터 */}
        <div className="mb-6">
          <NotificationFilters
            status={status}
            type={type}
            onStatusChange={handleFilterStatusChange}
            onTypeChange={handleFilterTypeChange}
            onReset={handleReset}
          />
        </div>

        {/* 목록 */}
        {loading ? (
          <NotificationListSkeleton />
        ) : (
          <>
            <NotificationList notifications={notifications} onItemClick={handleItemClick} />

            {/* 페이지네이션 */}
            {pageInfo.totalCount > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  총 {pageInfo.totalCount}개 중 {pageInfo.page * pageInfo.limit - pageInfo.limit + 1}-
                  {Math.min(pageInfo.page * pageInfo.limit, pageInfo.totalCount)}개 표시
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>
                  <span className="flex items-center px-4 text-sm text-slate-300">
                    {page} / {Math.ceil(pageInfo.totalCount / pageInfo.limit)}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pageInfo.hasNext}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
