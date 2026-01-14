/**
 * 관리자용 공지사항 생성/수정 페이지
 */

import { notificationService } from '@/api/services/notification';
import { AdminPageBackground } from '@/components/features/admin/common/AdminPageBackground';
import { NotificationForm } from '@/components/features/admin/notifications';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppSelector } from '@/store/hooks';
import type { CreateNotificationRequest, Notification } from '@/types/notification';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const AdminNotificationFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { handleError, handleSuccess } = useErrorHandler();
  const userRole = useAppSelector((state) => state.auth?.user?.role);

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  const isEditMode = Boolean(id);

  // 권한 체크
  useEffect(() => {
    if (userRole !== 'ADMIN') {
      handleError(new Error('접근 권한이 없습니다.'), 'AdminNotificationFormPage');
      navigate('/');
    }
  }, [userRole, navigate, handleError]);

  // 수정 모드일 때 데이터 로드
  const fetchNotification = useCallback(async () => {
    if (!id || userRole !== 'ADMIN') return;

    setLoading(true);
    try {
      const data = await notificationService.getNotificationDetail(id);
      setNotification(data);
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('Network')) {
        handleError(new Error('네트워크 연결을 확인해주세요.'), 'AdminNotificationFormPage');
      } else {
        handleError(error, 'AdminNotificationFormPage');
      }
      navigate('/admin/notifications');
    } finally {
      setLoading(false);
    }
  }, [id, userRole, navigate, handleError]);

  useEffect(() => {
    if (isEditMode) {
      fetchNotification();
    }
  }, [isEditMode, fetchNotification]);

  const handleSubmit = async (data: CreateNotificationRequest) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && id) {
        await notificationService.updateNotification(id, data);
        handleSuccess('공지사항이 수정되었습니다.');
      } else {
        await notificationService.createNotification(data);
        handleSuccess('공지사항이 생성되었습니다.');
      }
      navigate('/admin/notifications');
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('Network')) {
        handleError(new Error('네트워크 연결을 확인해주세요.'), 'AdminNotificationFormPage');
      } else {
        handleError(error, 'AdminNotificationFormPage');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/notifications');
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      await notificationService.deleteNotification(id);
      handleSuccess('공지사항이 삭제되었습니다.');
      navigate('/admin/notifications');
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('Network')) {
        handleError(new Error('네트워크 연결을 확인해주세요.'), 'AdminNotificationFormPage');
      } else {
        handleError(error, 'AdminNotificationFormPage');
      }
    }
  };

  if (userRole !== 'ADMIN') {
    return null;
  }

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-start justify-center bg-slate-950 px-4 pt-20 pb-10 text-white">
        <AdminPageBackground />

        <div className="relative z-10 w-full max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded bg-slate-700" />
            <div className="h-96 rounded-lg bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-start justify-center bg-slate-950 px-4 pt-20 pb-10 text-white">
      <AdminPageBackground />

      <div className="relative z-10 w-full max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">
              {isEditMode ? '공지사항 수정' : '새 공지사항'}
            </h1>
            <p className="text-slate-400">
              {isEditMode ? '공지사항을 수정합니다.' : '새로운 공지사항을 작성합니다.'}
            </p>
          </div>
          {isEditMode && (
            <button
              onClick={handleDelete}
              className="rounded-lg border border-red-600 bg-red-600/10 px-6 py-2 text-sm text-red-400 transition hover:bg-red-600/20"
            >
              삭제
            </button>
          )}
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
          <NotificationForm
            initialData={
              notification
                ? {
                    id: notification.id,
                    type: notification.type,
                    title: notification.title,
                    content: notification.content,
                    status: notification.status,
                    isPinned: notification.isPinned,
                    scheduledAt: notification.scheduledAt || '',
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};
