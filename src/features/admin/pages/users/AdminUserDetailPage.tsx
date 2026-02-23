/**
 * 관리자용 사용자 상세 페이지
 */

import { adminService } from '@features/admin/api';
import { AdminPageBackground } from '@features/admin/components/common/AdminPageBackground';
import { UserAddressesCard } from '@features/admin/components/users/UserAddressesCard';
import { UserDetailCard } from '@features/admin/components/users/UserDetailCard';
import { UserPreferencesCard } from '@features/admin/components/users/UserPreferencesCard';
import { UserRecentActivityCard } from '@features/admin/components/users/UserRecentActivityCard';
import { UserStatsCard } from '@features/admin/components/users/UserStatsCard';
import { useToast } from '@shared/hooks/useToast';
import { useErrorHandler } from '@shared/hooks/useErrorHandler';
import { useAppSelector } from '@app/store/hooks';
import type { AdminUserDetail } from '@features/admin/types';
import { extractErrorMessage } from '@shared/utils/error';
import { isAdminRole } from '@shared/utils/role';
import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const AdminUserDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { handleError } = useErrorHandler();
  const toast = useToast();
  const userRole = useAppSelector((state) => state.auth?.user?.role);

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // 권한 체크
  useEffect(() => {
    if (!isAdminRole(userRole)) {
      handleError(new Error('접근 권한이 없습니다.'), 'AdminUserDetailPage');
      navigate('/');
    }
  }, [userRole, navigate, handleError]);

  // 사용자 상세 조회
  const fetchUserDetail = useCallback(async () => {
    if (!id || !isAdminRole(userRole)) return;

    setLoading(true);
    try {
      const response = await adminService.getUserDetail(Number(id));
      setUser(response);
    } catch (error: unknown) {
      const message = extractErrorMessage(error, '사용자 정보를 불러오는데 실패했습니다.');
      handleError(new Error(message), 'AdminUserDetailPage');
      toast.error(message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, userRole, handleError]);

  useEffect(() => {
    if (isAdminRole(userRole)) {
      fetchUserDetail();
    }
  }, [userRole, fetchUserDetail]);

  // 비활성화
  const handleDeactivate = async () => {
    if (!user || processing) return;

    const confirmed = window.confirm(
      `${user.email} 사용자를 비활성화하시겠습니까?\n비활성화된 사용자는 로그인할 수 없습니다.`
    );

    if (!confirmed) return;

    setProcessing(true);
    try {
      const response = await adminService.deactivateUser(user.id);
      toast.success(response.message || '사용자가 비활성화되었습니다.');
      fetchUserDetail();
    } catch (error: unknown) {
      const message = extractErrorMessage(error, '사용자 비활성화에 실패했습니다.');
      toast.error(message);
      handleError(new Error(message), 'AdminUserDetailPage');
    } finally {
      setProcessing(false);
    }
  };

  // 활성화
  const handleActivate = async () => {
    if (!user || processing) return;

    const confirmed = window.confirm(`${user.email} 사용자를 활성화하시겠습니까?`);

    if (!confirmed) return;

    setProcessing(true);
    try {
      const response = await adminService.activateUser(user.id);
      toast.success(response.message || '사용자가 활성화되었습니다.');
      fetchUserDetail();
    } catch (error: unknown) {
      const message = extractErrorMessage(error, '사용자 활성화에 실패했습니다.');
      toast.error(message);
      handleError(new Error(message), 'AdminUserDetailPage');
    } finally {
      setProcessing(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/users');
  };

  if (!isAdminRole(userRole)) {
    return null;
  }

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-bg-primary text-text-primary">
        <AdminPageBackground />
        <div className="relative z-10 text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-border-default border-t-brand-primary mx-auto" />
          <p className="text-text-tertiary">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-bg-primary text-text-primary">
        <AdminPageBackground />
        <div className="relative z-10 text-center">
          <p className="text-text-tertiary">사용자를 찾을 수 없습니다.</p>
          <button
            onClick={handleBack}
            className="mt-4 rounded-lg border border-border-default bg-bg-surface px-4 py-2 text-text-primary transition hover:bg-bg-hover"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-start justify-center bg-bg-primary px-4 pt-20 pb-10 text-text-primary">
      <AdminPageBackground />

      <div className="relative z-10 w-full max-w-6xl">
        {/* 헤더 */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="mb-4 flex items-center gap-2 text-text-tertiary transition hover:text-text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
            목록으로 돌아가기
          </button>
          <h1 className="mb-2 text-3xl font-bold text-text-primary">사용자 상세</h1>
          <p className="text-text-tertiary">사용자의 상세 정보를 확인하고 관리하세요.</p>
        </div>

        {/* 컨텐츠 */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 기본 정보 */}
            <UserDetailCard
              user={user}
              onDeactivate={handleDeactivate}
              onActivate={handleActivate}
              isProcessing={processing}
            />

            {/* 활동 통계 */}
            <UserStatsCard stats={user.stats} />
          </div>

          {/* 선호도 */}
          <UserPreferencesCard preferences={user.preferences} />

          {/* 주소 */}
          <UserAddressesCard addresses={user.addresses} />

          {/* 최근 활동 */}
          <UserRecentActivityCard recentActivities={user.recentActivities} />
        </div>
      </div>
    </div>
  );
};
