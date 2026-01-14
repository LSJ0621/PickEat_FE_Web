/**
 * 공지사항 목록 항목 컴포넌트
 */

import type { Notification } from '@/types/notification';
import { memo } from 'react';

interface NotificationListItemProps {
  notification: Notification;
  onClick: () => void;
}

const TYPE_LABELS = {
  NOTICE: { label: '공지', color: 'bg-blue-500/20 text-blue-400' },
  UPDATE: { label: '업데이트', color: 'bg-green-500/20 text-green-400' },
  EVENT: { label: '이벤트', color: 'bg-purple-500/20 text-purple-400' },
  MAINTENANCE: { label: '점검', color: 'bg-orange-500/20 text-orange-400' },
};

const STATUS_LABELS = {
  DRAFT: { label: '임시저장', color: 'bg-gray-500/20 text-gray-400' },
  SCHEDULED: { label: '예약', color: 'bg-yellow-500/20 text-yellow-400' },
  PUBLISHED: { label: '공개', color: 'bg-green-500/20 text-green-400' },
};

export const NotificationListItem = memo(
  ({ notification, onClick }: NotificationListItemProps) => {
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

    const typeConfig = TYPE_LABELS[notification.type];
    const statusConfig = STATUS_LABELS[notification.status];

    return (
      <button
        onClick={onClick}
        className="w-full text-left rounded-lg border border-slate-700 bg-slate-900/50 p-4 transition hover:border-slate-600 hover:bg-slate-900/70"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              {notification.isPinned && (
                <span className="text-yellow-400" title="고정됨">
                  📌
                </span>
              )}
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${typeConfig.color}`}>
                {typeConfig.label}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${statusConfig.color}`}
              >
                {statusConfig.label}
              </span>
            </div>
            <h3 className="font-semibold text-white">{notification.title}</h3>
            <p className="line-clamp-2 text-sm text-slate-400">{notification.content}</p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>작성자: {notification.createdBy.email}</span>
              <span>조회수: {notification.viewCount}</span>
              <span>
                {notification.publishedAt
                  ? `공개: ${formatDate(notification.publishedAt)}`
                  : `작성: ${formatDate(notification.createdAt)}`}
              </span>
              {notification.scheduledAt && notification.status === 'SCHEDULED' && (
                <span className="text-yellow-400">
                  예약: {formatDate(notification.scheduledAt)}
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
  }
);
