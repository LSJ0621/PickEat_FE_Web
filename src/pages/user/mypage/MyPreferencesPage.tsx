/**
 * MyPreferencesPage - 취향 설정 페이지
 * 취향(좋아요/싫어요) 표시 + AI 분석 + 편집 모달
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { PageHeader } from '@/components/common/PageHeader';
import { PreferencesSection } from '@/components/features/user/preferences/PreferencesSection';
import { PreferencesEditModal } from '@/components/features/user/preferences/PreferencesEditModal';
import { usePreferences } from '@/hooks/user/usePreferences';
import { useAppSelector } from '@/store/hooks';

export function MyPreferencesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth?.user);

  const preferences = usePreferences({
    initialLikes: user?.preferences?.likes,
    initialDislikes: user?.preferences?.dislikes,
    initialAnalysis: user?.preferences?.analysis ?? null,
    initialAnalysisParagraphs: user?.preferences?.analysisParagraphs ?? null,
  });

  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  const handleOpenPreferencesModal = () => {
    preferences.loadPreferences();
    setShowPreferencesModal(true);
  };

  const handleClosePreferencesModal = () => {
    setShowPreferencesModal(false);
    preferences.resetPreferencesModal();
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

      <PageHeader title={t('user.tabs.preferences')} />

      <div className="space-y-4">
        <PreferencesSection
          likes={preferences.likes}
          dislikes={preferences.dislikes}
          analysis={preferences.analysis}
          analysisParagraphs={preferences.analysisParagraphs}
          isLoading={preferences.isLoadingPreferences}
          onEditClick={handleOpenPreferencesModal}
        />

        <PreferencesEditModal
          open={showPreferencesModal}
          likes={preferences.likes}
          dislikes={preferences.dislikes}
          newLike={preferences.newLike}
          newDislike={preferences.newDislike}
          isSaving={preferences.isSavingPreferences}
          onClose={handleClosePreferencesModal}
          onNewLikeChange={preferences.setNewLike}
          onNewDislikeChange={preferences.setNewDislike}
          onAddLike={preferences.handleAddLike}
          onRemoveLike={preferences.handleRemoveLike}
          onAddDislike={preferences.handleAddDislike}
          onRemoveDislike={preferences.handleRemoveDislike}
          onSave={preferences.handleSavePreferences}
        />
      </div>
    </PageContainer>
  );
}
