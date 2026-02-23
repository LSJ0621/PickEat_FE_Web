/**
 * 사용자 목록 컴포넌트
 */

import type { AdminUserListItem } from '@features/admin/types';
import { UserListItem } from './UserListItem';

interface UserListProps {
  users: AdminUserListItem[];
  onItemClick: (user: AdminUserListItem) => void;
}

export const UserList = ({ users, onItemClick }: UserListProps) => {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border-default bg-bg-primary py-12">
        <svg
          className="mb-4 h-12 w-12 text-text-placeholder"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <p className="text-text-tertiary">사용자가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <UserListItem key={user.id} user={user} onClick={() => onItemClick(user)} />
      ))}
    </div>
  );
};
