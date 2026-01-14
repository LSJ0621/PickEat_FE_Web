/**
 * 사용자 필터 컴포넌트
 */

import { useDebounce } from '@/hooks/common/useDebounce';
import type { AdminUserListItem } from '@/types/admin';
import { useEffect, useState } from 'react';

interface UserFiltersProps {
  search: string;
  socialType: AdminUserListItem['socialType'] | 'ALL';
  status: AdminUserListItem['status'] | 'ALL';
  startDate: string;
  endDate: string;
  onSearchChange: (search: string) => void;
  onSocialTypeChange: (socialType: AdminUserListItem['socialType'] | 'ALL') => void;
  onStatusChange: (status: AdminUserListItem['status'] | 'ALL') => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onReset: () => void;
}

export const UserFilters = ({
  search,
  socialType,
  status,
  startDate,
  endDate,
  onSearchChange,
  onSocialTypeChange,
  onStatusChange,
  onStartDateChange,
  onEndDateChange,
  onReset,
}: UserFiltersProps) => {
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  // Reset local search when parent search changes (e.g., on reset)
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);
  return (
    <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-900/50 p-4">
      {/* 검색 입력 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">검색</label>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="이메일 또는 이름으로 검색"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* 가입 유형 필터 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">가입 유형</label>
          <div className="relative">
            <select
              value={socialType || 'ALL'}
              onChange={(e) => {
                const value = e.target.value;
                onSocialTypeChange(
                  value === 'ALL' ? 'ALL' : (value as AdminUserListItem['socialType'])
                );
              }}
              className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 px-4 pr-10 py-2 text-white focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            >
              <option value="ALL">전체</option>
              <option value="EMAIL">이메일</option>
              <option value="KAKAO">카카오</option>
              <option value="GOOGLE">구글</option>
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

        {/* 상태 필터 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">상태</label>
          <div className="relative">
            <select
              value={status || 'ALL'}
              onChange={(e) => {
                const value = e.target.value;
                onStatusChange(value === 'ALL' ? 'ALL' : (value as AdminUserListItem['status']));
              }}
              className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 px-4 pr-10 py-2 text-white focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            >
              <option value="ALL">전체</option>
              <option value="active">활성</option>
              <option value="deleted">탈퇴</option>
              <option value="deactivated">비활성화</option>
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

        {/* 초기화 버튼 */}
        <div className="flex items-end">
          <button
            onClick={onReset}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
          >
            초기화
          </button>
        </div>
      </div>

      {/* 기간 필터 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">시작일</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">종료일</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
          />
        </div>
      </div>
    </div>
  );
};
