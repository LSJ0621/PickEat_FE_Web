/**
 * 버그 제보 목록 컴포넌트
 */

import type { BugReport } from '@/types/bug-report';
import { BugReportListItem } from './BugReportListItem';
import { useTranslation } from 'react-i18next';

interface BugReportListProps {
  bugReports: BugReport[];
  onItemClick: (bugReport: BugReport) => void;
  selectedIds?: number[];
  onSelectionChange?: (ids: number[]) => void;
}

export const BugReportList = ({
  bugReports,
  onItemClick,
  selectedIds = [],
  onSelectionChange,
}: BugReportListProps) => {
  const { t } = useTranslation();
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(bugReports.map((report) => report.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const isAllSelected = bugReports.length > 0 && selectedIds.length === bugReports.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < bugReports.length;

  if (bugReports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-slate-700 bg-slate-900/50 py-12">
        <svg
          className="mb-4 h-12 w-12 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-slate-400">{t('bugReport.list.empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 전체 선택 */}
      {onSelectionChange && (
        <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/50 p-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(input) => {
                if (input) {
                  input.indeterminate = isSomeSelected;
                }
              }}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="h-5 w-5 cursor-pointer rounded border-slate-600 bg-slate-800 text-pink-500 focus:ring-2 focus:ring-pink-500/20"
            />
            <span className="text-sm text-slate-300">
              {t('bugReport.list.selectAll')} {selectedIds.length > 0 && `(${selectedIds.length})`}
            </span>
          </label>
        </div>
      )}

      {/* 목록 */}
      {bugReports.map((bugReport) => (
        <BugReportListItem
          key={bugReport.id}
          bugReport={bugReport}
          onClick={() => onItemClick(bugReport)}
          selected={selectedIds.includes(bugReport.id)}
          onSelectionChange={
            onSelectionChange ? (checked) => handleSelectItem(bugReport.id, checked) : undefined
          }
        />
      ))}
    </div>
  );
};

