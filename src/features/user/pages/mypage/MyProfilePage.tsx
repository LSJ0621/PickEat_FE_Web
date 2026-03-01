/**
 * MyProfilePage - 프로필 수정 페이지
 * 이름/이메일 표시 + 생년월일/성별 수정 모달
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { PageContainer } from '@shared/components/PageContainer';
import { PageHeader } from '@shared/components/PageHeader';
import { ProfileSection } from '@features/user/components/profile/ProfileSection';
import { ProfileEditModal } from '@features/user/components/profile/ProfileEditModal';
import { authService } from '@features/auth/api';
import { shallowEqual } from 'react-redux';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import { updateUser } from '@app/store/slices/authSlice';
import { useToast } from '@shared/hooks/useToast';
import { useErrorHandler } from '@shared/hooks/useErrorHandler';

export function MyProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // Select only the fields used in this component to avoid re-renders on unrelated user changes
  const { name, email, birthDate, gender } = useAppSelector(
    (state) => ({
      name: state.auth?.user?.name,
      email: state.auth?.user?.email,
      birthDate: state.auth?.user?.birthDate,
      gender: state.auth?.user?.gender,
    }),
    shallowEqual
  );
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
            {name || t('user.noName')}
          </p>
        </div>

        {/* Email card */}
        <div className="rounded-[32px] border border-border-default bg-bg-surface p-6 shadow-2xl shadow-black/10">
          <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
            {t('user.email')}
          </p>
          <p className="mt-2 text-lg font-semibold text-text-primary">
            {email || t('user.noEmail')}
          </p>
        </div>

        {/* Profile section (birthDate + gender) */}
        <ProfileSection
          birthDate={birthDate}
          gender={gender}
          onEditClick={() => setShowProfileModal(true)}
        />

        <ProfileEditModal
          open={showProfileModal}
          birthDate={birthDate}
          gender={gender}
          onClose={() => setShowProfileModal(false)}
          onSave={handleSaveProfile}
        />
      </div>
    </PageContainer>
  );
}
