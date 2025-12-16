/**
 * 관리자용 버그 제보 목록 페이지
 */

import { bugReportService } from '@/api/services/bug-report';
import { BugReportDetailModal } from '@/components/features/admin/bug-reports/BugReportDetailModal';
import { BugReportFilters } from '@/components/features/admin/bug-reports/BugReportFilters';
import { BugReportList } from '@/components/features/admin/bug-reports/BugReportList';
import { BugReportListSkeleton } from '@/components/features/admin/bug-reports/BugReportListSkeleton';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppSelector } from '@/store/hooks';
import type { BugReport, BugReportStatus } from '@/types/bug-report';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminBugReportListPage = () => {
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const userRole = useAppSelector((state) => state.auth?.user?.role);

  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<BugReportStatus | 'ALL' | undefined>('UNCONFIRMED');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    hasNext: false,
  });
  const [selectedBugReportId, setSelectedBugReportId] = useState<number | null>(null);

  // 권한 체크
  useEffect(() => {
    if (userRole !== 'ADMIN') {
      handleError(new Error('접근 권한이 없습니다.'), 'AdminBugReportListPage');
      navigate('/');
    }
  }, [userRole, navigate, handleError]);

  // 목록 조회
  const fetchBugReports = useCallback(async () => {
    if (userRole !== 'ADMIN') return;

    setLoading(true);
    try {
      const response = await bugReportService.getBugReportList({
        page,
        limit: 20,
        status: status === 'ALL' || !status ? undefined : status,
        date: date || undefined,
      });
      setBugReports(response.items);
      setPageInfo(response.pageInfo);
    } catch (error: unknown) {
      // 네트워크 에러 처리
      if (error instanceof Error && error.message.includes('Network')) {
        handleError(new Error('네트워크 연결을 확인해주세요.'), 'AdminBugReportListPage');
      } else {
        handleError(error, 'AdminBugReportListPage');
      }
    } finally {
      setLoading(false);
    }
  }, [userRole, page, status, date, handleError]);

  useEffect(() => {
    if (userRole === 'ADMIN') {
      fetchBugReports();
    }
  }, [userRole, fetchBugReports]);

  const handleFilterStatusChange = (newStatus: BugReportStatus | 'ALL' | undefined) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    setPage(1);
  };

  const handleReset = () => {
    setStatus('UNCONFIRMED');
    setDate('');
    setPage(1);
  };

  const handleItemClick = (bugReport: BugReport) => {
    setSelectedBugReportId(bugReport.id);
  };

  const handleModalClose = () => {
    setSelectedBugReportId(null);
  };

  const handleBugReportStatusChange = () => {
    // 목록 갱신
    fetchBugReports();
  };

  if (userRole !== 'ADMIN') {
    return null;
  }

  return (
    <div className="relative flex min-h-screen items-start justify-center bg-slate-950 px-4 pt-20 pb-10 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-orange-400/40 via-pink-500/30 to-purple-600/30 blur-3xl animate-gradient" />
        <div className="absolute -bottom-40 right-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-purple-400/40 via-pink-500/30 to-orange-600/30 blur-3xl animate-gradient" />
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-white">문의사항 관리</h1>
          <p className="text-slate-400">버그 제보 및 문의사항을 확인하고 관리하세요.</p>
        </div>

        {/* 필터 */}
        <div className="mb-6">
          <BugReportFilters
            status={status}
            date={date}
            onStatusChange={handleFilterStatusChange}
            onDateChange={handleDateChange}
            onReset={handleReset}
          />
        </div>

        {/* 목록 */}
        {loading ? (
          <BugReportListSkeleton />
        ) : (
          <>
            <BugReportList bugReports={bugReports} onItemClick={handleItemClick} />

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

      {/* 상세 모달 */}
      <BugReportDetailModal
        bugReportId={selectedBugReportId}
        isOpen={selectedBugReportId !== null}
        onClose={handleModalClose}
        onStatusChange={handleBugReportStatusChange}
      />
    </div>
  );
};

