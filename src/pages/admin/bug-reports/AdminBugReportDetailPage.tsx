/**
 * 관리자 버그 리포트 상세 페이지
 */

import { bugReportService } from '@/api/services/bug-report';
import { AdminPageBackground } from '@/components/features/admin/common/AdminPageBackground';
import { AddNoteModal } from '@/components/features/admin/bug-reports/AddNoteModal';
import { AdminNoteSection } from '@/components/features/admin/bug-reports/AdminNoteSection';
import { BugReportImageGallery } from '@/components/features/admin/bug-reports/BugReportImageGallery';
import { StatusHistoryTimeline } from '@/components/features/admin/bug-reports/StatusHistoryTimeline';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppSelector } from '@/store/hooks';
import type { AdminBugReportDetail, BugReportStatus } from '@/types/bug-report';
import { BUG_REPORT } from '@/utils/constants';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export function AdminBugReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { handleError, handleSuccess } = useErrorHandler();
  const userRole = useAppSelector((state) => state.auth?.user?.role);

  const [bugReport, setBugReport] = useState<AdminBugReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // 권한 체크
  useEffect(() => {
    if (userRole !== 'ADMIN') {
      handleError(new Error('접근 권한이 없습니다.'), 'AdminBugReportDetailPage');
      navigate('/');
    }
  }, [userRole, navigate, handleError]);

  // 상세 정보 조회
  const fetchBugReportDetail = useCallback(async () => {
    if (!id || userRole !== 'ADMIN') return;

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
    if (userRole === 'ADMIN') {
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

  // 메모 추가
  const handleAddNote = async (content: string) => {
    if (!bugReport) return;

    try {
      await bugReportService.addBugReportNote(bugReport.id, content);
      handleSuccess('메모가 추가되었습니다.');
      await fetchBugReportDetail();
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('Network')) {
        handleError(new Error('네트워크 연결을 확인해주세요.'), 'AdminBugReportDetailPage');
      } else {
        handleError(error, 'AdminBugReportDetailPage');
      }
      throw error;
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
      UNCONFIRMED: 'text-yellow-400 bg-yellow-500/20',
      CONFIRMED: 'text-orange-400 bg-orange-500/20',
      FIXED: 'text-blue-400 bg-blue-500/20',
      CLOSED: 'text-green-400 bg-green-500/20',
    };
    return colors[status];
  };

  const getStatusLabel = (status: BugReportStatus): string => {
    const labels: Record<BugReportStatus, string> = {
      UNCONFIRMED: '미확인',
      CONFIRMED: '확인',
      FIXED: '수정완료',
      CLOSED: '종료',
    };
    return labels[status];
  };

  if (userRole !== 'ADMIN') {
    return null;
  }

  return (
    <div className="relative flex min-h-screen items-start justify-center bg-slate-950 px-4 pt-20 pb-10 text-white">
      <AdminPageBackground />

      <div className="relative z-10 w-full max-w-5xl">
        {/* 헤더 */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/bug-reports')}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            목록으로
          </button>
          <h1 className="text-3xl font-bold text-white">버그 리포트 상세</h1>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-pink-500" />
          </div>
        )}

        {!loading && bugReport && (
          <div className="space-y-6">
            {/* 기본 정보 카드 */}
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                    {BUG_REPORT.CATEGORIES[bugReport.category as keyof typeof BUG_REPORT.CATEGORIES] || bugReport.category}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(bugReport.status)}`}>
                    {getStatusLabel(bugReport.status)}
                  </span>
                </div>
              </div>

              <h2 className="mb-4 text-2xl font-bold text-white">{bugReport.title}</h2>

              <div className="mb-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-100">상세 내용</h3>
                <p className="whitespace-pre-wrap rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-sm text-slate-300">
                  {bugReport.description}
                </p>
              </div>

              {bugReport.images && bugReport.images.length > 0 && (
                <BugReportImageGallery images={bugReport.images} />
              )}
            </div>

            {/* 작성자 정보 카드 */}
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-100">작성자 정보</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">사용자 ID</span>
                  <button
                    onClick={() => navigate(`/admin/users/${bugReport.user.id}`)}
                    className="text-pink-400 transition hover:text-pink-300 hover:underline"
                  >
                    {bugReport.user.id}
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">이메일</span>
                  <span className="text-slate-300">{bugReport.user.email}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">이름</span>
                  <span className="text-slate-300">{bugReport.user.name || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">가입일</span>
                  <span className="text-slate-300">{formatDate(bugReport.user.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* 상태 변경 */}
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-100">상태 변경</h3>
              <div className="flex flex-wrap gap-3">
                {(['UNCONFIRMED', 'CONFIRMED', 'FIXED', 'CLOSED'] as BugReportStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={updating || bugReport.status === status}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      bugReport.status === status
                        ? `${getStatusColor(status)} cursor-not-allowed`
                        : 'border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {getStatusLabel(status)}
                  </button>
                ))}
              </div>
            </div>

            {/* 상태 이력 타임라인 */}
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-100">상태 변경 이력</h3>
              <StatusHistoryTimeline history={bugReport.statusHistory} />
            </div>

            {/* 관리자 메모 */}
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
              <AdminNoteSection
                notes={bugReport.adminNotes}
                onAddNote={() => setIsNoteModalOpen(true)}
              />
            </div>

            {/* 메타 정보 */}
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-100">메타 정보</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">생성일</span>
                  <span className="text-slate-300">{formatDate(bugReport.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">수정일</span>
                  <span className="text-slate-300">{formatDate(bugReport.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 메모 추가 모달 */}
      <AddNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSubmit={handleAddNote}
      />
    </div>
  );
}
