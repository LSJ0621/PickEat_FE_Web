/**
 * 공지사항 필터 컴포넌트
 */

import type { NotificationStatus, NotificationType } from '@/types/notification';

interface NotificationFiltersProps {
  status: NotificationStatus | 'ALL' | undefined;
  type: NotificationType | 'ALL' | undefined;
  onStatusChange: (status: NotificationStatus | 'ALL' | undefined) => void;
  onTypeChange: (type: NotificationType | 'ALL' | undefined) => void;
  onReset: () => void;
}

export const NotificationFilters = ({
  status,
  type,
  onStatusChange,
  onTypeChange,
  onReset,
}: NotificationFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-4 rounded-lg border border-slate-700 bg-slate-900/50 p-4">
      {/* 상태 필터 */}
      <div className="flex-1 min-w-[150px]">
        <label className="mb-2 block text-sm font-medium text-slate-300">상태</label>
        <div className="relative">
          <select
            value={status || 'ALL'}
            onChange={(e) => {
              const value = e.target.value;
              onStatusChange(value === 'ALL' ? 'ALL' : (value as NotificationStatus));
            }}
            className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 px-4 pr-10 py-2 text-white focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
          >
            <option value="ALL">전체</option>
            <option value="DRAFT">임시저장</option>
            <option value="SCHEDULED">예약</option>
            <option value="PUBLISHED">공개</option>
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

      {/* 유형 필터 */}
      <div className="flex-1 min-w-[150px]">
        <label className="mb-2 block text-sm font-medium text-slate-300">유형</label>
        <div className="relative">
          <select
            value={type || 'ALL'}
            onChange={(e) => {
              const value = e.target.value;
              onTypeChange(value === 'ALL' ? 'ALL' : (value as NotificationType));
            }}
            className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 px-4 pr-10 py-2 text-white focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
          >
            <option value="ALL">전체</option>
            <option value="NOTICE">공지</option>
            <option value="UPDATE">업데이트</option>
            <option value="EVENT">이벤트</option>
            <option value="MAINTENANCE">점검</option>
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
