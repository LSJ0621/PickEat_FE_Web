/**
 * 관리자 목록 컴포넌트
 */

import { AdminListItem } from './AdminListItem';
import type { AdminUser } from '@/types/admin-settings';

interface AdminListProps {
  admins: AdminUser[];
  currentUserId?: number;
  onRemove: (admin: AdminUser) => void;
}

export function AdminList({ admins, currentUserId, onRemove }: AdminListProps) {
  if (admins.length === 0) {
    return (
      <div className="text-center py-8 text-text-tertiary">등록된 관리자가 없습니다.</div>
    );
  }

  return (
    <div className="space-y-3">
      {admins.map((admin) => (
        <AdminListItem
          key={admin.id}
          admin={admin}
          currentUserId={currentUserId}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
