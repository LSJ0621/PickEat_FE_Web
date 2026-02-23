/**
 * 초기 설정 취향 섹션 컴포넌트
 * 좋아하는 것/싫어하는 것 입력 UI를 제공합니다.
 */

import { Button } from '@shared/components/Button';
import { RemovableBadge } from '@shared/components/RemovableBadge';
import { Input } from '@shared/ui/input';
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

  const handleAddLike = () => {
    const trimmed = newLike.trim();
    if (trimmed && !likes.includes(trimmed)) {
      onLikesChange([...likes, trimmed]);
      setNewLike('');
    }
  };

  const handleRemoveLike = (item: string) => {
    onLikesChange(likes.filter((like) => like !== item));
  };

  const handleAddDislike = () => {
    const trimmed = newDislike.trim();
    if (trimmed && !dislikes.includes(trimmed)) {
      onDislikesChange([...dislikes, trimmed]);
      setNewDislike('');
    }
  };

  const handleRemoveDislike = (item: string) => {
    onDislikesChange(dislikes.filter((dislike) => dislike !== item));
  };

  return (
    <div className="rounded-2xl border border-border-default bg-bg-secondary p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-text-primary">
          {t('setup.preferences.title')}
        </h3>
        <p className="mt-1 text-xs text-text-tertiary">
          {t('setup.preferences.description')}
        </p>
      </div>

      <div className="space-y-5">
        {/* 좋아요 섹션 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">
            {t('setup.preferences.likes')}
          </label>
          <div className="mb-3 flex gap-2">
            <Input
              type="text"
              value={newLike}
              onChange={(e) => setNewLike(e.target.value)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing) return;
                if (e.key === 'Enter') handleAddLike();
              }}
              placeholder={t('setup.preferences.likesPlaceholder')}
              aria-label={t('setup.preferences.likes')}
              className="flex-1 rounded-xl border-border-default bg-bg-surface
                text-text-primary placeholder-text-placeholder
                focus-visible:ring-brand-primary/40 focus-visible:border-border-focus
                h-10"
            />
            <Button onClick={handleAddLike} size="md">
              {t('setup.preferences.add')}
            </Button>
          </div>
          {likes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {likes.map((like, index) => (
                <RemovableBadge
                  key={index}
                  data-testid="like-tag"
                  variant="like"
                  label={like}
                  onRemove={() => handleRemoveLike(like)}
                  removeAriaLabel={`${like} ${t('common.remove')}`}
                  className="text-sm px-3 py-1"
                />
              ))}
            </div>
          )}
        </div>

        {/* 싫어요 섹션 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">
            {t('setup.preferences.dislikes')}
          </label>
          <div className="mb-3 flex gap-2">
            <Input
              type="text"
              value={newDislike}
              onChange={(e) => setNewDislike(e.target.value)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing) return;
                if (e.key === 'Enter') handleAddDislike();
              }}
              placeholder={t('setup.preferences.dislikesPlaceholder')}
              aria-label={t('setup.preferences.dislikes')}
              className="flex-1 rounded-xl border-border-default bg-bg-surface
                text-text-primary placeholder-text-placeholder
                focus-visible:ring-brand-primary/40 focus-visible:border-border-focus
                h-10"
            />
            <Button onClick={handleAddDislike} size="md">
              {t('setup.preferences.add')}
            </Button>
          </div>
          {dislikes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dislikes.map((dislike, index) => (
                <RemovableBadge
                  key={index}
                  data-testid="dislike-tag"
                  variant="dislike"
                  label={dislike}
                  onRemove={() => handleRemoveDislike(dislike)}
                  removeAriaLabel={`${dislike} ${t('common.remove')}`}
                  className="text-sm px-3 py-1"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
