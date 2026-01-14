/**
 * 관리자용 버그 제보 목록 페이지
 */

import { bugReportService } from '@/api/services/bug-report';
import { AdminPageBackground } from '@/components/features/admin/common/AdminPageBackground';
import { BatchStatusChangeButton } from '@/components/features/admin/bug-reports/BatchStatusChangeButton';
import { BugReportFilters } from '@/components/features/admin/bug-reports/BugReportFilters';
import { BugReportList } from '@/components/features/admin/bug-reports/BugReportList';
import { BugReportListSkeleton } from '@/components/features/admin/bug-reports/BugReportListSkeleton';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAppSelector } from '@/store/hooks';
import type { BugReport, BugReportCategory, BugReportStatus } from '@/types/bug-report';
import { handleApiError } from '@/utils/error';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminBugReportListPage = () => {
  const navigate = useNavigate();
  const { handleError, handleSuccess } = useErrorHandler();
  const userRole = useAppSelector((state) => state.auth?.user?.role);

  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<BugReportStatus | 'ALL' | undefined>('UNCONFIRMED');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<BugReportCategory | 'ALL' | undefined>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    hasNext: false,
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

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
      setSelectedIds([]);
    } catch (error: unknown) {
      handleApiError(error, 'AdminBugReportListPage', handleError);
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

  const handleCategoryChange = (newCategory: BugReportCategory | 'ALL' | undefined) => {
    setCategory(newCategory);
    setPage(1);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
  };

  const handleReset = () => {
    setStatus('UNCONFIRMED');
    setDate('');
    setCategory('ALL');
    setSearch('');
    setPage(1);
  };

  const handleItemClick = (bugReport: BugReport) => {
    navigate(`/admin/bug-reports/${bugReport.id}`);
  };

  const handleBatchStatusChange = async (newStatus: BugReportStatus) => {
    if (selectedIds.length === 0) return;

    try {
      const result = await bugReportService.batchUpdateBugReportStatus(selectedIds, newStatus);
      handleSuccess(`${result.updatedCount}개의 항목이 업데이트되었습니다.`);
      await fetchBugReports();
    } catch (error: unknown) {
      handleApiError(error, 'AdminBugReportListPage', handleError);
    }
  };

  // 클라이언트 측 필터링 (카테고리, 검색)
  const filteredBugReports = bugReports.filter((report) => {
    // 카테고리 필터
    if (category && category !== 'ALL' && report.category !== category) {
      return false;
    }

    // 검색 필터
    if (search) {
      const searchLower = search.toLowerCase();
      const titleMatch = report.title.toLowerCase().includes(searchLower);
      const descriptionMatch = report.description.toLowerCase().includes(searchLower);
      return titleMatch || descriptionMatch;
    }

    return true;
  });

  if (userRole !== 'ADMIN') {
    return null;
  }

  return (
    <div className="relative flex min-h-screen items-start justify-center bg-slate-950 px-4 pt-20 pb-10 text-white">
      <AdminPageBackground />

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
            category={category}
            search={search}
            onStatusChange={handleFilterStatusChange}
            onDateChange={handleDateChange}
            onCategoryChange={handleCategoryChange}
            onSearchChange={handleSearchChange}
            onReset={handleReset}
          />
        </div>

        {/* 일괄 상태 변경 버튼 */}
        {selectedIds.length > 0 && (
          <div className="mb-4 flex justify-end">
            <BatchStatusChangeButton
              selectedIds={selectedIds}
              onStatusChange={handleBatchStatusChange}
            />
          </div>
        )}

        {/* 목록 */}
        {loading ? (
          <BugReportListSkeleton />
        ) : (
          <>
            <BugReportList
              bugReports={filteredBugReports}
              onItemClick={handleItemClick}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />

            {/* 페이지네이션 */}
            {pageInfo.totalCount > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  총 {pageInfo.totalCount}개 중 {pageInfo.page * pageInfo.limit - pageInfo.limit + 1}-
                  {Math.min(pageInfo.page * pageInfo.limit, pageInfo.totalCount)}개 표시
                  {category !== 'ALL' || search ? (
                    <span className="ml-2 text-slate-500">
                      (필터링됨: {filteredBugReports.length}개)
                    </span>
                  ) : null}
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
