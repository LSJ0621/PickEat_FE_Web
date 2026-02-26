/**
 * 사용자 목록 항목 컴포넌트
 */

import type { AdminUserListItem } from '@/types/admin';
import { memo } from 'react';

interface UserListItemProps {
  user: AdminUserListItem;
  onClick: () => void;
}

export const UserListItem = memo(({ user, onClick }: UserListItemProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getSocialTypeBadge = (socialType: AdminUserListItem['socialType']) => {
    if (!socialType) return null;

    const badges = {
      EMAIL: { bg: 'bg-info-bg', text: 'text-info', label: 'EMAIL' },
      KAKAO: { bg: 'bg-warning-bg', text: 'text-warning', label: 'KAKAO' },
      GOOGLE: { bg: 'bg-error-bg', text: 'text-error', label: 'GOOGLE' },
    };

    const badge = badges[socialType];
    return (
      <span className={`rounded-full ${badge.bg} px-3 py-1 text-xs font-medium ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status: AdminUserListItem['status']) => {
    const badges = {
      active: { emoji: '✅', label: '활성', bg: 'bg-success-bg', text: 'text-success' },
      deleted: { emoji: '🚫', label: '탈퇴', bg: 'bg-error-bg', text: 'text-error' },
      deactivated: { emoji: '⛔', label: '비활성화', bg: 'bg-brand-tertiary', text: 'text-brand-primary' },
    };

    const badge = badges[status];
    return (
      <span className={`rounded-full ${badge.bg} px-3 py-1 text-xs font-medium ${badge.text}`}>
        {badge.emoji} {badge.label}
      </span>
    );
  };

  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border border-[var(--border-default)] bg-bg-surface p-4 text-left transition hover:border-[var(--border-default)] hover:bg-bg-hover"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-text-tertiary">ID: {user.id.toString().slice(0, 8)}</span>
            {getSocialTypeBadge(user.socialType)}
            {getStatusBadge(user.status)}
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-text-primary">{user.email}</h3>
            {user.name && <p className="text-sm text-text-tertiary">{user.name}</p>}
          </div>
          <div className="text-xs text-text-placeholder">가입일: {formatDate(user.createdAt)}</div>
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
  );
});
