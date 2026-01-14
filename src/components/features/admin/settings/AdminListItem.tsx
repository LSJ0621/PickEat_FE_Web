/**
 * 관리자 목록 아이템 컴포넌트
 */

import { Badge } from '@/components/ui/badge';
import type { AdminUser } from '@/types/admin-settings';
import { formatDateTime } from '@/utils/format';
import { Trash2, UserCheck } from 'lucide-react';

interface AdminListItemProps {
  admin: AdminUser;
  currentUserId?: number;
  onRemove: (admin: AdminUser) => void;
}

export function AdminListItem({ admin, currentUserId, onRemove }: AdminListItemProps) {
  const isCurrentUser = currentUserId === admin.id;

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4 hover:bg-slate-800 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <UserCheck className="h-5 w-5 text-slate-400" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-white truncate">{admin.name || admin.email}</p>
            {admin.role === 'SUPER_ADMIN' && (
              <Badge variant="default" className="bg-purple-600 text-white text-xs">
                슈퍼 관리자
              </Badge>
            )}
            {admin.role === 'ADMIN' && (
              <Badge variant="default" className="bg-blue-600 text-white text-xs">
                관리자
              </Badge>
            )}
            {isCurrentUser && (
              <Badge variant="default" className="bg-slate-600 text-white text-xs">
                본인
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-400">{admin.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-slate-500">
            {admin.lastLoginAt
              ? `마지막 로그인: ${formatDateTime(admin.lastLoginAt)}`
              : '로그인 기록 없음'}
          </p>
          <p className="text-xs text-slate-500">
            가입일: {formatDateTime(admin.createdAt)}
          </p>
        </div>
        <button
          onClick={() => onRemove(admin)}
          disabled={isCurrentUser}
          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={isCurrentUser ? '본인의 권한은 제거할 수 없습니다' : '관리자 권한 제거'}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
