/**
 * 관리자 권한 제거 확인 모달
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { AdminUser } from '@/types/admin-settings';
import { AlertTriangle } from 'lucide-react';

interface RemoveAdminConfirmModalProps {
  admin: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function RemoveAdminConfirmModal({
  admin,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: RemoveAdminConfirmModalProps) {
  if (!admin) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-bg-surface border-border-default text-text-primary">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <DialogTitle className="text-text-primary">관리자 권한 제거</DialogTitle>
          </div>
          <DialogDescription className="text-text-secondary">
            이 사용자의 관리자 권한을 제거하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          <div className="rounded-lg bg-bg-primary p-4 border border-border-default">
            <p className="text-sm text-text-tertiary mb-2">제거 대상</p>
            <p className="font-medium text-text-primary">{admin.name || admin.email}</p>
            <p className="text-sm text-text-tertiary">{admin.email}</p>
            <p className="text-xs text-text-placeholder mt-2">
              역할: {admin.role === 'SUPER_ADMIN' ? '슈퍼 관리자' : '관리자'}
            </p>
          </div>
          <p className="text-sm text-text-secondary">
            권한이 제거되면 관리자 페이지에 더 이상 접근할 수 없습니다.
          </p>
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            disabled={isLoading}
            variant="outline"
            className="bg-bg-surface border-border-default text-text-secondary hover:bg-bg-hover"
          >
            취소
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-text-inverse"
          >
            {isLoading ? '처리 중...' : '권한 제거'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
