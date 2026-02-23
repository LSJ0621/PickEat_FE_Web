/**
 * 사용자 목록 항목 컴포넌트
 */

import type { AdminUserListItem } from '@/types/admin';
import { formatDateKorean } from '@/utils/format';
import { memo } from 'react';

interface UserListItemProps {
  user: AdminUserListItem;
  onClick: () => void;
}

export const UserListItem = memo(({ user, onClick }: UserListItemProps) => {

  const getSocialTypeBadge = (socialType: AdminUserListItem['socialType']) => {
    if (!socialType) return null;

    const badges = {
      EMAIL: { bg: 'bg-blue-500/20', text: 'text-blue-600', label: 'EMAIL' },
      KAKAO: { bg: 'bg-yellow-500/20', text: 'text-yellow-600', label: 'KAKAO' },
      GOOGLE: { bg: 'bg-red-500/20', text: 'text-red-600', label: 'GOOGLE' },
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
      active: { emoji: '✅', label: '활성', bg: 'bg-green-500/20', text: 'text-green-600' },
      deleted: { emoji: '🚫', label: '탈퇴', bg: 'bg-red-500/20', text: 'text-red-600' },
      deactivated: { emoji: '⛔', label: '비활성화', bg: 'bg-orange-500/20', text: 'text-brand-primary' },
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
      className="w-full rounded-lg border border-border-default bg-bg-surface p-4 text-left transition hover:border-border-focus hover:bg-bg-hover"
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
          <div className="text-xs text-text-placeholder">가입일: {formatDateKorean(user.createdAt)}</div>
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
