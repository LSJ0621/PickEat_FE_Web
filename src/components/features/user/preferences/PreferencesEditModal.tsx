import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/Button';
import { ModalCloseButton } from '@/components/common/ModalCloseButton';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

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
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(open);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm ${
        isAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
      }`}
    >
      <div 
        className={`relative w-full max-w-2xl rounded-[32px] border border-white/10 bg-slate-900/95 p-8 shadow-2xl backdrop-blur ${
          isAnimating ? 'modal-content-enter' : 'modal-content-exit'
        }`}
      >
        <ModalCloseButton onClose={onClose} />
        <h2 className="mb-6 text-2xl font-bold text-white">{t('user.preferences.edit')}</h2>

        <div className="space-y-6">
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-200">{t('setup.preferences.likes')}</label>
            <div className="mb-3 flex gap-2">
              <input
                type="text"
                value={newLike}
                onChange={(e) => onNewLikeChange(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    onAddLike();
                  }
                }}
                placeholder={t('setup.preferences.likesPlaceholder')}
                className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
              />
              <Button onClick={onAddLike} size="md">
                {t('setup.preferences.add')}
              </Button>
            </div>
            {likes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {likes.map((like, index) => (
                  <span
                    key={index}
                    data-testid="like-tag"
                    className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm text-green-200"
                  >
                    {like}
                    <button
                      onClick={() => onRemoveLike(like)}
                      className="text-green-300 hover:text-green-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-slate-200">{t('setup.preferences.dislikes')}</label>
            <div className="mb-3 flex gap-2">
              <input
                type="text"
                value={newDislike}
                onChange={(e) => onNewDislikeChange(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    onAddDislike();
                  }
                }}
                placeholder={t('setup.preferences.dislikesPlaceholder')}
                className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-white placeholder-slate-400 transition focus:border-orange-300/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60"
              />
              <Button onClick={onAddDislike} size="md">
                {t('setup.preferences.add')}
              </Button>
            </div>
            {dislikes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {dislikes.map((dislike, index) => (
                  <span
                    key={index}
                    data-testid="dislike-tag"
                    className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm text-red-200"
                  >
                    {dislike}
                    <button
                      onClick={() => onRemoveDislike(dislike)}
                      className="text-red-300 hover:text-red-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleSave}
            isLoading={isSaving}
            size="lg"
            className="w-full"
          >
            {t('user.preferences.save')}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

