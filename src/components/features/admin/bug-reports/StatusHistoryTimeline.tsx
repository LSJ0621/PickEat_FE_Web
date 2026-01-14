/**
 * 버그 리포트 상태 변경 이력 타임라인 컴포넌트
 */

import type { BugReportStatusHistory } from '@/types/bug-report';

interface StatusHistoryTimelineProps {
  history: BugReportStatusHistory[];
}

export const StatusHistoryTimeline = ({ history }: StatusHistoryTimelineProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      UNCONFIRMED: '미확인',
      CONFIRMED: '확인',
      FIXED: '수정완료',
      CLOSED: '종료',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      UNCONFIRMED: 'text-yellow-400 bg-yellow-500/20',
      CONFIRMED: 'text-orange-400 bg-orange-500/20',
      FIXED: 'text-blue-400 bg-blue-500/20',
      CLOSED: 'text-green-400 bg-green-500/20',
    };
    return colors[status] || 'text-slate-400 bg-slate-500/20';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'CLOSED') {
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    }
    if (status === 'FIXED') {
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      );
    }
    if (status === 'CONFIRMED') {
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      );
    }
    return (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  };

  if (history.length === 0) {
    return (
      <div className="text-center text-sm text-slate-400 py-4">
        상태 변경 이력이 없습니다.
      </div>
    );
  }

  // 최신순으로 정렬
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedHistory.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          {/* Timeline indicator */}
          <div className="flex flex-col items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${getStatusColor(
                item.status
              )}`}
            >
              {getStatusIcon(item.status)}
            </div>
            {index < sortedHistory.length - 1 && (
              <div className="w-0.5 flex-1 bg-slate-700 min-h-[20px]" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-4">
            <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
              <div className="mb-2 flex items-center gap-2 flex-wrap">
                {item.previousStatus && (
                  <>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                        item.previousStatus
                      )}`}
                    >
                      {getStatusLabel(item.previousStatus)}
                    </span>
                    <svg
                      className="h-4 w-4 text-slate-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(item.status)}`}
                >
                  {getStatusLabel(item.status)}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="text-slate-400">
                  변경자: <span className="text-slate-300">{item.changedBy.email}</span>
                </div>
                <div className="text-slate-500">{formatDate(item.changedAt)}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
