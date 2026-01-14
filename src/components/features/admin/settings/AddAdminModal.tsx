/**
 * 관리자 추가 모달
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AdminRole } from '@/types/admin-settings';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: number, role: AdminRole) => void;
  isLoading: boolean;
}

export function AddAdminModal({ isOpen, onClose, onConfirm, isLoading }: AddAdminModalProps) {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<AdminRole>('ADMIN');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(userId, 10);
    if (isNaN(id) || id <= 0) {
      return;
    }
    onConfirm(id, role);
  };

  const handleClose = () => {
    setUserId('');
    setRole('ADMIN');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <UserPlus className="h-6 w-6 text-blue-400" />
            <DialogTitle className="text-white">관리자 추가</DialogTitle>
          </div>
          <DialogDescription className="text-slate-300">
            사용자 ID를 입력하여 관리자 권한을 부여하세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userId" className="text-white">
                사용자 ID
              </Label>
              <Input
                id="userId"
                type="number"
                placeholder="사용자 ID를 입력하세요"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                required
                min="1"
                disabled={isLoading}
              />
              <p className="text-xs text-slate-400">
                관리자 권한을 부여할 사용자의 ID를 입력해주세요.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-white">
                권한 레벨
              </Label>
              <Select value={role} onValueChange={(value) => setRole(value as AdminRole)} disabled={isLoading}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="ADMIN" className="text-white hover:bg-slate-700">
                    관리자
                  </SelectItem>
                  <SelectItem value="SUPER_ADMIN" className="text-white hover:bg-slate-700">
                    슈퍼 관리자
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-400">
                슈퍼 관리자는 다른 관리자를 추가/제거할 수 있습니다.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              variant="outline"
              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !userId}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? '처리 중...' : '추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
