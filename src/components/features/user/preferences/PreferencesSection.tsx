import { useTranslation } from 'react-i18next';
import { Heart, ChevronRight } from 'lucide-react';
import type { AnalysisParagraphs } from '@/types/user';

interface PreferencesSectionProps {
  likes: string[];
  dislikes: string[];
  analysis?: string | null;
  analysisParagraphs?: AnalysisParagraphs | null;
  isLoading: boolean;
  onEditClick: () => void;
}

export const PreferencesSection = ({
  likes,
  dislikes,
  isLoading,
  onEditClick,
}: PreferencesSectionProps) => {
  const { t } = useTranslation();

  return (
    <button
      onClick={onEditClick}
      className="group w-full p-4 row-interactive text-left"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-tertiary">
          <Heart className="h-5 w-5 text-brand-primary" />
        </div>
        <div className="flex flex-1 items-center justify-between">
          <span className="text-sm text-text-primary">{t('user.preferences.title')}</span>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-brand-primary"></div>
            ) : (
              <span className="text-xs text-text-tertiary text-right max-w-[200px] truncate">
                {likes.length > 0 || dislikes.length > 0
                  ? `${likes.length} likes · ${dislikes.length} dislikes`
                  : t('user.preferences.noPreferences')}
              </span>
            )}
            <ChevronRight className="h-4 w-4 text-text-tertiary icon-chevron-hover" />
          </div>
        </div>
      </div>
    </button>
  );
};
