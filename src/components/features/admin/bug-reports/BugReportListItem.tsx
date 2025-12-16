/**
 * 버그 제보 목록 항목 컴포넌트
 */

import type { BugReport } from '@/types/bug-report';
import { BUG_REPORT } from '@/utils/constants';
import { memo } from 'react';

interface BugReportListItemProps {
  bugReport: BugReport;
  onClick: () => void;
}

export const BugReportListItem = memo(({ bugReport, onClick }: BugReportListItemProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: BugReport['status']) => {
    if (status === 'CONFIRMED') {
      return (
        <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
          확인
        </span>
      );
    }
    return (
      <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
        미확인
      </span>
    );
  };

  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border border-slate-700 bg-slate-900/50 p-4 text-left transition hover:border-slate-600 hover:bg-slate-900/70"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              {BUG_REPORT.CATEGORIES[bugReport.category]}
            </span>
            {getStatusBadge(bugReport.status)}
          </div>
          <h3 className="font-semibold text-white">{bugReport.title}</h3>
          <p className="line-clamp-2 text-sm text-slate-400">{bugReport.description}</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>{formatDate(bugReport.createdAt)}</span>
            {bugReport.images && bugReport.images.length > 0 && (
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {bugReport.images.length}
              </span>
            )}
          </div>
        </div>
        <svg
          className="h-5 w-5 flex-shrink-0 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
});

