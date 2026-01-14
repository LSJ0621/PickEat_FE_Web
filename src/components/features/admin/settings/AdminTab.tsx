/**
 * 관리자 계정 관리 탭
 */

import { adminSettingsService } from '@/api/services/admin-settings';
import { useToast } from '@/hooks/common/useToast';
import type { AdminRole, AdminUser } from '@/types/admin-settings';
import { extractErrorMessage } from '@/utils/error';
import { useCallback, useEffect, useState } from 'react';
import { AddAdminModal } from './AddAdminModal';
import { AdminList } from './AdminList';
import { RemoveAdminConfirmModal } from './RemoveAdminConfirmModal';
import { SettingsSection } from './SettingsSection';
import { SettingsSkeleton } from './SettingsSkeleton';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminTabProps {
  currentUserId?: number;
}

export function AdminTab({ currentUserId }: AdminTabProps) {
  const { success, error: showError } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      // Backend returns AdminUser[] directly (not wrapped in an object)
      const response = await adminSettingsService.getAdminList();
      setAdmins(response);
    } catch (err) {
      showError(extractErrorMessage(err, '관리자 목록을 불러오는데 실패했습니다.'));
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleAddAdmin = async (userId: number, role: AdminRole) => {
    try {
      setActionLoading(true);
      const response = await adminSettingsService.promoteAdmin({ userId, role });
      success(response.message || '관리자 권한이 부여되었습니다.');
      setShowAddModal(false);
      fetchAdmins();
    } catch (err) {
      showError(extractErrorMessage(err, '관리자 권한 부여에 실패했습니다.'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      setActionLoading(true);
      const response = await adminSettingsService.demoteAdmin(selectedAdmin.id);
      success(response.message || '관리자 권한이 제거되었습니다.');
      setShowRemoveModal(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (err) {
      showError(extractErrorMessage(err, '관리자 권한 제거에 실패했습니다.'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveClick = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setShowRemoveModal(true);
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="관리자 계정 관리"
        description="시스템 관리자 권한을 가진 사용자를 관리합니다. (슈퍼 관리자만 접근 가능)"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-400">
              총 {admins.length}명의 관리자
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              관리자 추가
            </Button>
          </div>
          <AdminList
            admins={admins}
            currentUserId={currentUserId}
            onRemove={handleRemoveClick}
          />
        </div>
      </SettingsSection>

      <AddAdminModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onConfirm={handleAddAdmin}
        isLoading={actionLoading}
      />

      <RemoveAdminConfirmModal
        admin={selectedAdmin}
        isOpen={showRemoveModal}
        onClose={() => {
          setShowRemoveModal(false);
          setSelectedAdmin(null);
        }}
        onConfirm={handleRemoveAdmin}
        isLoading={actionLoading}
      />
    </div>
  );
}
