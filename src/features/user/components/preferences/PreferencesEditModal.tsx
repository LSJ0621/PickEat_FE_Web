import { useTranslation } from 'react-i18next';
import { Button } from '@shared/components/Button';
import { ModalCloseButton } from '@shared/components/ModalCloseButton';
import { RemovableBadge } from '@shared/components/RemovableBadge';
import { createPortal } from 'react-dom';
import { useModalAnimation } from '@shared/hooks/useModalAnimation';
import { useModalScrollLock } from '@shared/hooks/useModalScrollLock';
import { useEscapeKey } from '@shared/hooks/useEscapeKey';
import { useFocusTrap } from '@shared/hooks/useFocusTrap';
import { Z_INDEX } from '@shared/utils/constants';

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

  useEscapeKey(onClose, open);

  if (!shouldRender) return null;

  const handleSave = async () => {
    const success = await onSave();
    if (success) onClose();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preferences-edit-title"
      className={[
        'fixed inset-0 flex p-4 bg-black/40 backdrop-blur-sm',
        'items-end sm:items-center',
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit',
      ].join(' ')}
      style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={focusTrapRef}
        className={[
          'relative w-full max-w-2xl mx-auto bg-bg-surface border border-border-default shadow-2xl',
          'rounded-t-2xl sm:rounded-2xl',
          'p-6 sm:p-8 max-h-[90vh] overflow-y-auto',
          isAnimating ? 'modal-content-enter' : 'modal-content-exit',
        ].join(' ')}
      >
        <ModalCloseButton onClose={onClose} />
        <h2 id="preferences-edit-title" className="mb-6 text-2xl font-bold text-text-primary">
          {t('user.preferences.edit')}
        </h2>

        <div className="space-y-6">
          {/* Likes */}
          <div>
            <label className="mb-3 block text-sm font-medium text-text-primary">
              {t('setup.preferences.likes')}
            </label>
            <div className="mb-3 flex gap-2">
              <input
                type="text"
                value={newLike}
                onChange={(e) => onNewLikeChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing) return;
                  if (e.key === 'Enter') { e.preventDefault(); onAddLike(); }
                }}
                placeholder={t('setup.preferences.likesPlaceholder')}
                className="flex-1 rounded-2xl border border-border-default bg-bg-secondary px-4 py-2 text-text-primary placeholder-text-placeholder transition focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              />
              <Button onClick={onAddLike} size="md">
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
                    onRemove={() => onRemoveLike(like)}
                    removeAriaLabel={`${like} ${t('common.remove')}`}
                    className="text-sm px-3 py-1"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Dislikes */}
          <div>
            <label className="mb-3 block text-sm font-medium text-text-primary">
              {t('setup.preferences.dislikes')}
            </label>
            <div className="mb-3 flex gap-2">
              <input
                type="text"
                value={newDislike}
                onChange={(e) => onNewDislikeChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing) return;
                  if (e.key === 'Enter') { e.preventDefault(); onAddDislike(); }
                }}
                placeholder={t('setup.preferences.dislikesPlaceholder')}
                className="flex-1 rounded-2xl border border-border-default bg-bg-secondary px-4 py-2 text-text-primary placeholder-text-placeholder transition focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              />
              <Button onClick={onAddDislike} size="md">
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
                    onRemove={() => onRemoveDislike(dislike)}
                    removeAriaLabel={`${dislike} ${t('common.remove')}`}
                    className="text-sm px-3 py-1"
                  />
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleSave}
            isLoading={isSaving}
            size="lg"
            className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-text-inverse shadow-md shadow-orange-500/30"
          >
            {t('user.preferences.save')}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
