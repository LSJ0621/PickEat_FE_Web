/**
 * 일괄 상태 변경 버튼 컴포넌트
 */

import type { BugReportStatus } from '@/types/bug-report';
import { useState, useRef, useEffect } from 'react';

interface BatchStatusChangeButtonProps {
  selectedIds: number[];
  onStatusChange: (status: BugReportStatus) => Promise<void>;
  disabled?: boolean;
}

export const BatchStatusChangeButton = ({
  selectedIds,
  onStatusChange,
  disabled = false,
}: BatchStatusChangeButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [changing, setChanging] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleStatusChange = async (status: BugReportStatus) => {
    setChanging(true);
    setIsOpen(false);
    try {
      await onStatusChange(status);
    } finally {
      setChanging(false);
    }
  };

  const statuses: { value: BugReportStatus; label: string; color: string }[] = [
    { value: 'UNCONFIRMED', label: '미확인', color: 'text-yellow-400' },
    { value: 'CONFIRMED', label: '확인', color: 'text-orange-400' },
    { value: 'FIXED', label: '수정완료', color: 'text-blue-400' },
    { value: 'CLOSED', label: '종료', color: 'text-green-400' },
  ];

  const isDisabled = disabled || selectedIds.length === 0 || changing;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDisabled}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {changing ? (
          <>
            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            처리 중...
          </>
        ) : (
          <>
            일괄 상태 변경 ({selectedIds.length})
            <svg
              className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-700 bg-slate-900 py-2 shadow-xl z-10">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => handleStatusChange(status.value)}
              className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition hover:bg-slate-800"
            >
              <span className={`font-medium ${status.color}`}>{status.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
