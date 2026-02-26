/**
 * MyProfilePage - 프로필 수정 페이지
 * 이름/이메일 표시 + 생년월일/성별 수정 모달
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { PageHeader } from '@/components/common/PageHeader';
import { ProfileSection } from '@/components/features/user/profile/ProfileSection';
import { ProfileEditModal } from '@/components/features/user/profile/ProfileEditModal';
import { authService } from '@/api/services/auth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import { useToast } from '@/hooks/common/useToast';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export function MyProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth?.user);
  const { success } = useToast();
  const { handleError } = useErrorHandler();

  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleSaveProfile = async (data: {
    birthDate?: string;
    gender?: 'male' | 'female' | 'other';
  }): Promise<boolean> => {
    try {
      const result = await authService.updateUser(data);
      dispatch(
        updateUser({
          birthDate: result.birthDate,
          gender: result.gender,
        })
      );
      success(t('user.profile.saveSuccess'));
      return true;
    } catch (error: unknown) {
      handleError(error, 'MyProfilePage');
      return false;
    }
  };

  return (
    <PageContainer maxWidth="max-w-3xl">
      <div className="mb-6">
        <button
          onClick={() => navigate('/mypage')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-medium">{t('navigation.back')}</span>
        </button>
      </div>

      <PageHeader title={t('user.tabs.profile')} />

      <div className="space-y-4">
        {/* Name card */}
        <div className="rounded-[32px] border border-border-default bg-bg-surface p-6 shadow-2xl shadow-black/10">
          <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
            {t('user.name')}
          </p>
          <p className="mt-2 text-lg font-semibold text-text-primary">
            {user?.name || t('user.noName')}
          </p>
        </div>

        {/* Email card */}
        <div className="rounded-[32px] border border-border-default bg-bg-surface p-6 shadow-2xl shadow-black/10">
          <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
            {t('user.email')}
          </p>
          <p className="mt-2 text-lg font-semibold text-text-primary">
            {user?.email || t('user.noEmail')}
          </p>
        </div>

        {/* Profile section (birthDate + gender) */}
        <ProfileSection
          birthDate={user?.birthDate}
          gender={user?.gender}
          onEditClick={() => setShowProfileModal(true)}
        />

        <ProfileEditModal
          open={showProfileModal}
          birthDate={user?.birthDate}
          gender={user?.gender}
          onClose={() => setShowProfileModal(false)}
          onSave={handleSaveProfile}
        />
      </div>
    </PageContainer>
  );
}
