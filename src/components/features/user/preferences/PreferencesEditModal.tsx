import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/Button';
import { ModalCloseButton } from '@/components/common/ModalCloseButton';
import { useModalAnimation } from '@/hooks/common/useModalAnimation';
import { useModalScrollLock } from '@/hooks/common/useModalScrollLock';
import { useFocusTrap } from '@/hooks/common/useFocusTrap';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface PreferencesEditModalProps {
  open: boolean;
  likes: string[];
  dislikes: string[];
  newLike: string;
  newDislike: string;
  isSaving: boolean;
  onClose: () => void;
  onNewLikeChange: (value: string) => void;
  onNewDislikeChange: (value: string) => void;
  onAddLike: () => void;
  onRemoveLike: (item: string) => void;
  onAddDislike: () => void;
  onRemoveDislike: (item: string) => void;
  onSave: () => Promise<boolean>;
}

export const PreferencesEditModal = ({
  open,
  likes,
  dislikes,
  newLike,
  newDislike,
  isSaving,
  onClose,
  onNewLikeChange,
  onNewDislikeChange,
  onAddLike,
  onRemoveLike,
  onAddDislike,
  onRemoveDislike,
  onSave,
}: PreferencesEditModalProps) => {
  const { t } = useTranslation();
  const { isAnimating, shouldRender } = useModalAnimation(open);
  useModalScrollLock(open);
  const focusTrapRef = useFocusTrap(open);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!shouldRender) {
    return null;
  }

  const handleSave = async () => {
    const success = await onSave();
    if (success) {
      onClose();
    }
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-end md:items-center md:justify-center bg-black/40 backdrop-blur-sm p-4 ${
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={focusTrapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preferences-edit-modal-title"
        className={`relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-t-xl md:rounded-xl bg-bg-surface p-6 md:p-8 shadow-lg md:border md:border-border-default ${
          isAnimating ? 'modal-content-responsive-enter' : 'modal-content-responsive-exit'
        }`}
      >
        <div className="flex justify-center pb-3 md:hidden">
          <div className="h-1 w-12 rounded-full bg-border-default" />
        </div>

        <ModalCloseButton onClose={onClose} />
        <h2 id="preferences-edit-modal-title" className="mb-6 text-xl font-semibold text-text-primary">{t('user.preferences.edit')}</h2>

        <div className="space-y-6">
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-medium text-text-secondary">
              <ThumbsUp className="h-4 w-4 text-brand-primary" />
              {t('setup.preferences.likes')}
            </label>
            <div className="mb-3 flex gap-2">
              <input
                type="text"
                value={newLike}
                onChange={(e) => onNewLikeChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                    onAddLike();
                  }
                }}
                placeholder={t('setup.preferences.likesPlaceholder')}
                className="flex-1 rounded-[var(--radius-md)] border-border-default bg-bg-surface px-4 py-2 text-text-primary placeholder-text-tertiary transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              />
              <Button onClick={onAddLike} size="md" variant="primary">
                {t('setup.preferences.add')}
              </Button>
            </div>
            {likes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {likes.map((like, index) => (
                  <span
                    key={index}
                    data-testid="like-tag"
                    className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-brand-tertiary text-brand-primary border-brand-primary/30 px-3 py-1 text-sm"
                  >
                    {like}
                    <button
                      onClick={() => onRemoveLike(like)}
                      className="text-brand-primary hover:text-brand-secondary"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-tertiary">{t('user.preferences.noPreferences')}</p>
            )}
          </div>

          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-medium text-text-secondary">
              <ThumbsDown className="h-4 w-4 text-error" />
              {t('setup.preferences.dislikes')}
            </label>
            <div className="mb-3 flex gap-2">
              <input
                type="text"
                value={newDislike}
                onChange={(e) => onNewDislikeChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                    onAddDislike();
                  }
                }}
                placeholder={t('setup.preferences.dislikesPlaceholder')}
                className="flex-1 rounded-[var(--radius-md)] border-border-default bg-bg-surface px-4 py-2 text-text-primary placeholder-text-tertiary transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              />
              <Button onClick={onAddDislike} size="md" variant="primary">
                {t('setup.preferences.add')}
              </Button>
            </div>
            {dislikes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {dislikes.map((dislike, index) => (
                  <span
                    key={index}
                    data-testid="dislike-tag"
                    className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-error/10 text-error border-error/30 px-3 py-1 text-sm"
                  >
                    {dislike}
                    <button
                      onClick={() => onRemoveDislike(dislike)}
                      className="text-error hover:text-error/80"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-tertiary">{t('user.preferences.noPreferences')}</p>
            )}
          </div>

          <div className="border-t border-border-light pt-4">
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              size="lg"
              variant="primary"
              className="w-full"
            >
              {t('user.preferences.save')}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
