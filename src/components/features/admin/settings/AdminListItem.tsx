/**
 * 관리자 목록 아이템 컴포넌트
 */

import { Badge } from '@/components/ui/badge';
import type { AdminUser } from '@/types/admin-settings';
import { formatDateTime } from '@/utils/format';
import { isSuperAdmin } from '@/utils/role';
import { Trash2, UserCheck } from 'lucide-react';

interface AdminListItemProps {
  admin: AdminUser;
  currentUserId?: number;
  onRemove: (admin: AdminUser) => void;
}

export function AdminListItem({ admin, currentUserId, onRemove }: AdminListItemProps) {
  const isCurrentUser = currentUserId === admin.id;
  const isSuperAdminUser = isSuperAdmin(admin.role);

  return (
    <div className="flex items-center justify-between rounded-lg border border-border-default bg-bg-surface p-4 hover:bg-bg-hover transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <UserCheck className="h-5 w-5 text-text-tertiary" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-text-primary truncate">{admin.name || admin.email}</p>
            {admin.role === 'SUPER_ADMIN' && (
              <Badge variant="default" className="bg-purple-600 text-text-inverse text-xs">
                슈퍼 관리자
              </Badge>
            )}
            {admin.role === 'ADMIN' && (
              <Badge variant="default" className="bg-brand-primary text-text-inverse text-xs">
                관리자
              </Badge>
            )}
            {isCurrentUser && (
              <Badge variant="default" className="bg-bg-tertiary text-text-secondary text-xs">
                본인
              </Badge>
            )}
          </div>
          <p className="text-sm text-text-tertiary">{admin.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-text-placeholder">
            {admin.lastLoginAt
              ? `마지막 로그인: ${formatDateTime(admin.lastLoginAt)}`
              : '로그인 기록 없음'}
          </p>
          <p className="text-xs text-text-placeholder">
            가입일: {formatDateTime(admin.createdAt)}
          </p>
        </div>
        <button
          onClick={() => onRemove(admin)}
          disabled={isCurrentUser || isSuperAdminUser}
          className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={
            isCurrentUser
              ? '본인의 권한은 제거할 수 없습니다'
              : isSuperAdminUser
              ? '슈퍼 관리자 권한은 제거할 수 없습니다'
              : '관리자 권한 제거'
          }
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
