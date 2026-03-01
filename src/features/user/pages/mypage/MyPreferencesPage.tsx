/**
 * MyPreferencesPage - 취향 설정 페이지
 * 취향(좋아요/싫어요) 표시 + AI 분석 + 편집 모달
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { PageContainer } from '@shared/components/PageContainer';
import { PageHeader } from '@shared/components/PageHeader';
import {
  PreferencesSection,
  PreferencesEditModal,
  PreferencesGuideSection,
} from '@features/user/components/preferences';
import { usePreferences } from '@features/user/hooks/usePreferences';
import { useAppSelector } from '@app/store/hooks';

export function MyPreferencesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // Narrow subscription to preferences only - avoids re-render on unrelated user field changes
  const userPreferences = useAppSelector((state) => state.auth?.user?.preferences);

  const preferences = usePreferences({
    initialLikes: userPreferences?.likes,
    initialDislikes: userPreferences?.dislikes,
    initialAnalysis: userPreferences?.analysis ?? null,
    initialAnalysisParagraphs: userPreferences?.analysisParagraphs ?? null,
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
        <PreferencesGuideSection />

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
