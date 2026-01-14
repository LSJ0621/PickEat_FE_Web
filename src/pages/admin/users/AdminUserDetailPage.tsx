/**
 * 관리자용 사용자 상세 페이지
 */

import { adminService } from '@/api/services/admin';
import { AdminPageBackground } from '@/components/features/admin/common/AdminPageBackground';
import { UserAddressesCard } from '@/components/features/admin/users/UserAddressesCard';
import { UserDetailCard } from '@/components/features/admin/users/UserDetailCard';
import { UserPreferencesCard } from '@/components/features/admin/users/UserPreferencesCard';
import { UserRecentActivityCard } from '@/components/features/admin/users/UserRecentActivityCard';
import { UserStatsCard } from '@/components/features/admin/users/UserStatsCard';
import { useToast } from '@/hooks/common/useToast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppSelector } from '@/store/hooks';
import type { AdminUserDetail } from '@/types/admin';
import { extractErrorMessage } from '@/utils/error';
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
    if (userRole !== 'ADMIN') {
      handleError(new Error('접근 권한이 없습니다.'), 'AdminUserDetailPage');
      navigate('/');
    }
  }, [userRole, navigate, handleError]);

  // 사용자 상세 조회
  const fetchUserDetail = useCallback(async () => {
    if (!id || userRole !== 'ADMIN') return;

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
    if (userRole === 'ADMIN') {
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

  if (userRole !== 'ADMIN') {
    return null;
  }

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <AdminPageBackground />
        <div className="relative z-10 text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-600 border-t-pink-500 mx-auto" />
          <p className="text-slate-400">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <AdminPageBackground />
        <div className="relative z-10 text-center">
          <p className="text-slate-400">사용자를 찾을 수 없습니다.</p>
          <button
            onClick={handleBack}
            className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-white transition hover:bg-slate-700"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-start justify-center bg-slate-950 px-4 pt-20 pb-10 text-white">
      <AdminPageBackground />

      <div className="relative z-10 w-full max-w-6xl">
        {/* 헤더 */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="mb-4 flex items-center gap-2 text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            목록으로 돌아가기
          </button>
          <h1 className="mb-2 text-3xl font-bold text-white">사용자 상세</h1>
          <p className="text-slate-400">사용자의 상세 정보를 확인하고 관리하세요.</p>
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
