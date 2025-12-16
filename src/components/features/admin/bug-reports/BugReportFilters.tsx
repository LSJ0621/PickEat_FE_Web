/**
 * 버그 제보 필터 컴포넌트
 */

import type { BugReportStatus } from '@/types/bug-report';

interface BugReportFiltersProps {
  status: BugReportStatus | 'ALL' | undefined;
  date: string;
  onStatusChange: (status: BugReportStatus | 'ALL' | undefined) => void;
  onDateChange: (date: string) => void;
  onReset: () => void;
}

export const BugReportFilters = ({
  status,
  date,
  onStatusChange,
  onDateChange,
  onReset,
}: BugReportFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-4 rounded-lg border border-slate-700 bg-slate-900/50 p-4">
      {/* 상태 필터 */}
      <div className="flex-1 min-w-[200px]">
        <label className="mb-2 block text-sm font-medium text-slate-300">상태</label>
        <div className="relative">
          <select
            value={status || 'UNCONFIRMED'}
            onChange={(e) => {
              const value = e.target.value;
              onStatusChange(value as BugReportStatus | 'ALL');
            }}
            className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 px-4 pr-10 py-2 text-white focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
          >
            <option value="UNCONFIRMED">미확인</option>
            <option value="CONFIRMED">확인</option>
            <option value="ALL">전체</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg
              className="h-4 w-4 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* 날짜 필터 */}
      <div className="flex-1 min-w-[200px]">
        <label className="mb-2 block text-sm font-medium text-slate-300">날짜</label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
        />
      </div>

      {/* 필터 초기화 */}
      <div className="flex items-end">
        <button
          onClick={onReset}
          className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
        >
          초기화
        </button>
      </div>
    </div>
  );
};

