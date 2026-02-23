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
import { isValidEmail } from '@/utils/validation';
import { useToast } from '@/hooks/common/useToast';

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (email: string, role: AdminRole) => void;
  isLoading: boolean;
}

export function AddAdminModal({ isOpen, onClose, onConfirm, isLoading }: AddAdminModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('ADMIN');
  const { error } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      error('올바른 이메일 형식이 아닙니다.');
      return;
    }

    onConfirm(trimmedEmail, role);
  };

  const handleClose = () => {
    setEmail('');
    setRole('ADMIN');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-bg-surface border-border-default text-text-primary">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <UserPlus className="h-6 w-6 text-brand-primary" />
            <DialogTitle className="text-text-primary">관리자 추가</DialogTitle>
          </div>
          <DialogDescription className="text-text-secondary">
            사용자 이메일을 입력하여 관리자 권한을 부여하세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-text-primary">
                이메일
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-bg-primary border-border-default text-text-primary placeholder:text-text-placeholder"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-text-tertiary">
                관리자 권한을 부여할 사용자의 이메일을 입력해주세요.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-text-primary">
                권한 레벨
              </Label>
              <Select value={role} onValueChange={(value) => setRole(value as AdminRole)} disabled={isLoading}>
                <SelectTrigger className="bg-bg-primary border-border-default text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-bg-surface border-border-default text-text-primary">
                  <SelectItem value="ADMIN" className="text-text-primary hover:bg-bg-hover">
                    관리자
                  </SelectItem>
                  <SelectItem value="SUPER_ADMIN" className="text-text-primary hover:bg-bg-hover">
                    슈퍼 관리자
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-text-tertiary">
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
              className="bg-bg-surface border-border-default text-text-secondary hover:bg-bg-hover"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !email}
              className="bg-brand-primary hover:bg-brand-secondary text-text-inverse"
            >
              {isLoading ? '처리 중...' : '추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
