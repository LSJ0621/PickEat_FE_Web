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
} from '@shared/ui/dialog';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import type { AdminRole } from '@features/admin/types-settings';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { isValidEmail } from '@shared/utils/validation';
import { useToast } from '@shared/hooks/useToast';

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (email: string, role: AdminRole) => void;
  isLoading: boolean;
}

export function AddAdminModal({ isOpen, onClose, onConfirm, isLoading }: AddAdminModalProps) {
  const [email, setEmail] = useState('');
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

    onConfirm(trimmedEmail, 'ADMIN');
  };

  const handleClose = () => {
    setEmail('');
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
                해당 사용자에게 관리자 권한이 부여됩니다.
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
