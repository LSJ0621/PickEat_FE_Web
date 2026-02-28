/**
 * 버그 제보 목록 항목 컴포넌트
 */

import type { BugReport } from '@features/bug-report/types';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDateTimeKorean } from '@shared/utils/format';

interface BugReportListItemProps {
  bugReport: BugReport;
  onClick: () => void;
  selected?: boolean;
  onSelectionChange?: (checked: boolean) => void;
}

export const BugReportListItem = memo(
  ({ bugReport, onClick, selected = false, onSelectionChange }: BugReportListItemProps) => {
    const { t } = useTranslation();
    const getStatusBadge = (status: BugReport['status']) => {
      const badges: Record<BugReport['status'], React.ReactElement> = {
        UNCONFIRMED: (
          <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-600">
            {t('bugReport.status.unconfirmed')}
          </span>
        ),
        CONFIRMED: (
          <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-medium text-brand-primary">
            {t('bugReport.status.confirmed')}
          </span>
        ),
        FIXED: (
          <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-600">
            {t('bugReport.status.fixed')}
          </span>
        ),
      };
      return badges[status];
    };

    return (
      <div
        className={`flex items-start gap-3 rounded-lg border bg-bg-surface p-4 transition ${
          selected
            ? 'border-brand-primary bg-brand-primary/5'
            : 'border-border-default hover:border-border-focus hover:bg-bg-hover'
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
              className="h-5 w-5 cursor-pointer rounded border-border-default bg-bg-surface text-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </label>
        )}

        {/* 내용 */}
        <button onClick={onClick} className="flex-1 text-left">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-tertiary">
                  {t(`bugReport.categories.${bugReport.category.toLowerCase()}`)}
                </span>
                {getStatusBadge(bugReport.status)}
              </div>
              <h3 className="font-semibold text-text-primary">{bugReport.title}</h3>
              <p className="line-clamp-2 text-sm text-text-tertiary">{bugReport.description}</p>
              <div className="flex items-center gap-4 text-xs text-text-placeholder">
                <span>{formatDateTimeKorean(bugReport.createdAt)}</span>
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
              className="h-5 w-5 flex-shrink-0 text-text-tertiary"
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
