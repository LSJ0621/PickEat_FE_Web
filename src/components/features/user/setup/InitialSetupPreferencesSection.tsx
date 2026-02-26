/**
 * 초기 설정 취향 섹션 컴포넌트
 * 좋아하는 것/싫어하는 것 입력 UI를 제공합니다.
 */

import { Button } from '@/components/common/Button';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface InitialSetupPreferencesSectionProps {
  likes: string[];
  dislikes: string[];
  onLikesChange: (likes: string[]) => void;
  onDislikesChange: (dislikes: string[]) => void;
}

export const InitialSetupPreferencesSection = ({
  likes,
  dislikes,
  onLikesChange,
  onDislikesChange,
}: InitialSetupPreferencesSectionProps) => {
  const { t } = useTranslation();
  const [newLike, setNewLike] = useState('');
  const [newDislike, setNewDislike] = useState('');

  // 취향 추가/삭제
  const handleAddLike = () => {
    if (newLike.trim() && !likes.includes(newLike.trim())) {
      onLikesChange([...likes, newLike.trim()]);
      setNewLike('');
    }
  };

  const handleRemoveLike = (item: string) => {
    onLikesChange(likes.filter((like) => like !== item));
  };

  const handleAddDislike = () => {
    if (newDislike.trim() && !dislikes.includes(newDislike.trim())) {
      onDislikesChange([...dislikes, newDislike.trim()]);
      setNewDislike('');
    }
  };

  const handleRemoveDislike = (item: string) => {
    onDislikesChange(dislikes.filter((dislike) => dislike !== item));
  };

  return (
    <div className="rounded-[var(--radius-lg)] border-border-default bg-bg-secondary p-6 animate-fade-in-up">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-primary">{t('setup.preferences.title')}</h3>
        <p className="mt-1 text-sm text-text-tertiary">{t('setup.preferences.description')}</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-text-secondary">{t('setup.preferences.likes')}</label>
          <div className="mb-2 flex gap-2">
            <input
              type="text"
              value={newLike}
              onChange={(e) => setNewLike(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddLike();
                }
              }}
              placeholder={t('setup.preferences.likesPlaceholder')}
              className="flex-1 rounded-[var(--radius-md)] border-border-default bg-bg-surface px-4 py-2 text-text-primary placeholder-text-tertiary transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
            <Button onClick={handleAddLike} size="md" variant="primary">
              {t('setup.preferences.add')}
            </Button>
          </div>
          {likes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {likes.map((like, index) => (
                <span
                  key={index}
                  data-testid="like-tag"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-brand-tertiary text-brand-primary border-brand-primary/30 px-3 py-1 text-sm"
                >
                  {like}
                  <button
                    onClick={() => handleRemoveLike(like)}
                    className="text-brand-primary hover:text-brand-secondary"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-secondary">{t('setup.preferences.dislikes')}</label>
          <div className="mb-2 flex gap-2">
            <input
              type="text"
              value={newDislike}
              onChange={(e) => setNewDislike(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddDislike();
                }
              }}
              placeholder={t('setup.preferences.dislikesPlaceholder')}
              className="flex-1 rounded-[var(--radius-md)] border-border-default bg-bg-surface px-4 py-2 text-text-primary placeholder-text-tertiary transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
            <Button onClick={handleAddDislike} size="md" variant="primary">
              {t('setup.preferences.add')}
            </Button>
          </div>
          {dislikes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dislikes.map((dislike, index) => (
                <span
                  key={index}
                  data-testid="dislike-tag"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-status-error/10 text-status-error border-status-error/30 px-3 py-1 text-sm"
                >
                  {dislike}
                  <button
                    onClick={() => handleRemoveDislike(dislike)}
                    className="text-status-error hover:text-status-error/80"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

