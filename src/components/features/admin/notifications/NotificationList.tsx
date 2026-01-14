/**
 * 공지사항 목록 컴포넌트
 */

import type { Notification } from '@/types/notification';
import { NotificationListItem } from './NotificationListItem';

interface NotificationListProps {
  notifications: Notification[];
  onItemClick: (notification: Notification) => void;
}

export const NotificationList = ({ notifications, onItemClick }: NotificationListProps) => {
  if (notifications.length === 0) {
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
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <p className="text-slate-400">공지사항이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationListItem
          key={notification.id}
          notification={notification}
          onClick={() => onItemClick(notification)}
        />
      ))}
    </div>
  );
};
