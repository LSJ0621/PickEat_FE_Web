/**
 * 관리자 버그 리포트 상세 페이지 (MVP - 기본 기능만)
 * 기능: 상세 조회, 상태 변경
 */

import { bugReportService } from '@features/bug-report/api';
import { AdminPageBackground } from '@features/admin/components/common/AdminPageBackground';
import { BugReportImageGallery } from '@features/admin/components/bug-reports/BugReportImageGallery';
import { useErrorHandler } from '@shared/hooks/useErrorHandler';
import { useAppSelector } from '@app/store/hooks';
import type { AdminBugReportDetail, BugReportStatus } from '@features/bug-report/types';
import { isAdminRole } from '@shared/utils/role';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function AdminBugReportDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { handleError, handleSuccess } = useErrorHandler();
  const userRole = useAppSelector((state) => state.auth?.user?.role);

  const [bugReport, setBugReport] = useState<AdminBugReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // 권한 체크
  useEffect(() => {
    if (!isAdminRole(userRole)) {
      handleError(new Error('접근 권한이 없습니다.'), 'AdminBugReportDetailPage');
      navigate('/');
    }
  }, [userRole, navigate, handleError]);

  // 상세 정보 조회
  const fetchBugReportDetail = useCallback(async () => {
    if (!id || !isAdminRole(userRole)) return;

    setLoading(true);
    try {
      const data = await bugReportService.getAdminBugReportDetail(id);
      setBugReport(data);
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('Network')) {
        handleError(new Error('네트워크 연결을 확인해주세요.'), 'AdminBugReportDetailPage');
      } else {
        handleError(error, 'AdminBugReportDetailPage');
      }
      navigate('/admin/bug-reports');
    } finally {
      setLoading(false);
    }
  }, [id, userRole, handleError, navigate]);

  useEffect(() => {
    if (isAdminRole(userRole)) {
      fetchBugReportDetail();
    }
  }, [userRole, fetchBugReportDetail]);

  // 상태 변경
  const handleStatusChange = async (status: BugReportStatus) => {
    if (!bugReport || updating) return;

    setUpdating(true);
    try {
      await bugReportService.updateBugReportStatus(bugReport.id, status);
      handleSuccess('상태가 변경되었습니다.');
      await fetchBugReportDetail();
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('Network')) {
        handleError(new Error('네트워크 연결을 확인해주세요.'), 'AdminBugReportDetailPage');
      } else {
        handleError(error, 'AdminBugReportDetailPage');
      }
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: BugReportStatus): string => {
    const colors: Record<BugReportStatus, string> = {
      UNCONFIRMED: 'text-amber-700 bg-amber-500/20',
      CONFIRMED: 'text-orange-700 bg-orange-500/20',
      FIXED: 'text-blue-700 bg-blue-500/20',
      CLOSED: 'text-green-700 bg-green-500/20',
    };
    return colors[status];
  };

  const getStatusLabel = (status: BugReportStatus): string => {
    const labels: Record<BugReportStatus, string> = {
      UNCONFIRMED: t('bugReport.status.unconfirmed'),
      CONFIRMED: t('bugReport.status.confirmed'),
      FIXED: t('bugReport.status.fixed'),
      CLOSED: t('bugReport.status.closed'),
    };
    return labels[status];
  };

  if (!isAdminRole(userRole)) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen items-start justify-center bg-bg-primary px-4 pt-20 pb-10 text-text-primary">
      <AdminPageBackground />

      <div className="relative z-10 w-full max-w-5xl">
        {/* 헤더 */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/bug-reports')}
            className="flex items-center gap-2 rounded-lg border border-border-default bg-bg-surface px-4 py-2 text-sm text-text-secondary transition hover:bg-bg-hover"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            목록으로
          </button>
          <h1 className="text-3xl font-bold text-text-primary">버그 리포트 상세</h1>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-brand-primary" />
          </div>
        )}

        {!loading && bugReport && (
          <div className="space-y-6">
            {/* 기본 정보 카드 */}
            <div className="rounded-lg border border-border-default bg-bg-surface p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-border-default bg-bg-secondary px-3 py-1 text-xs font-medium text-text-secondary">
                    {t(`bugReport.categories.${bugReport.category.toLowerCase()}`)}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(bugReport.status)}`}>
                    {getStatusLabel(bugReport.status)}
                  </span>
                </div>
              </div>

              <h2 className="mb-4 text-2xl font-bold text-text-primary">{bugReport.title}</h2>

              <div className="mb-4">
                <h3 className="mb-2 text-sm font-semibold text-text-primary">상세 내용</h3>
                <p className="whitespace-pre-wrap rounded-lg border border-border-default bg-bg-secondary p-4 text-sm text-text-secondary">
                  {bugReport.description}
                </p>
              </div>

              {bugReport.images && bugReport.images.length > 0 && (
                <BugReportImageGallery images={bugReport.images} />
              )}
            </div>

            {/* 작성자 정보 카드 */}
            <div className="rounded-lg border border-border-default bg-bg-surface p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-text-primary">작성자 정보</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-tertiary">사용자 ID</span>
                  <button
                    onClick={() => navigate(`/admin/users/${bugReport.user.id}`)}
                    className="text-brand-primary transition hover:text-orange-600 hover:underline"
                  >
                    {bugReport.user.id}
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-tertiary">이메일</span>
                  <span className="text-text-secondary">{bugReport.user.email}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-tertiary">이름</span>
                  <span className="text-text-secondary">{bugReport.user.name || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-tertiary">가입일</span>
                  <span className="text-text-secondary">{formatDate(bugReport.user.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* 상태 변경 */}
            <div className="rounded-lg border border-border-default bg-bg-surface p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-text-primary">상태 변경</h3>
              <div className="flex flex-wrap gap-3">
                {(['UNCONFIRMED', 'CONFIRMED', 'FIXED', 'CLOSED'] as BugReportStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={updating || bugReport.status === status}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      bugReport.status === status
                        ? `${getStatusColor(status)} cursor-not-allowed`
                        : 'border border-border-default bg-bg-secondary text-text-secondary hover:bg-bg-hover'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {getStatusLabel(status)}
                  </button>
                ))}
              </div>
            </div>

            {/* 메타 정보 */}
            <div className="rounded-lg border border-border-default bg-bg-surface p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-text-primary">메타 정보</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-tertiary">생성일</span>
                  <span className="text-text-secondary">{formatDate(bugReport.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-tertiary">수정일</span>
                  <span className="text-text-secondary">{formatDate(bugReport.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
