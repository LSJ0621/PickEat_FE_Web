/**
 * 버그 제보 목록 항목 컴포넌트
 */

import type { BugReport } from '@/types/bug-report';
import { BUG_REPORT } from '@/utils/constants';
import { memo } from 'react';

interface BugReportListItemProps {
  bugReport: BugReport;
  onClick: () => void;
  selected?: boolean;
  onSelectionChange?: (checked: boolean) => void;
}

export const BugReportListItem = memo(
  ({ bugReport, onClick, selected = false, onSelectionChange }: BugReportListItemProps) => {
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
      const badges: Record<BugReport['status'], React.ReactElement> = {
        UNCONFIRMED: (
          <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
            미확인
          </span>
        ),
        CONFIRMED: (
          <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-400">
            확인
          </span>
        ),
        FIXED: (
          <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400">
            수정완료
          </span>
        ),
        CLOSED: (
          <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
            종료
          </span>
        ),
      };
      return badges[status];
    };

    return (
      <div
        className={`flex items-start gap-3 rounded-lg border bg-slate-900/50 p-4 transition ${
          selected
            ? 'border-pink-500 bg-pink-500/10'
            : 'border-slate-700 hover:border-slate-600 hover:bg-slate-900/70'
        }`}
      >
        {/* 체크박스 */}
        {onSelectionChange && (
          <label
            className="flex cursor-pointer items-center pt-1"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelectionChange(e.target.checked)}
              className="h-5 w-5 cursor-pointer rounded border-slate-600 bg-slate-800 text-pink-500 focus:ring-2 focus:ring-pink-500/20"
            />
          </label>
        )}

        {/* 내용 */}
        <button onClick={onClick} className="flex-1 text-left">
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
      </div>
    );
  }
);

