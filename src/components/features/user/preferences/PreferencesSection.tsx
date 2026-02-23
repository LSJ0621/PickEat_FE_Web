import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/ui/badge';
import type { AnalysisParagraphs } from '@/types/user';

interface PreferencesSectionProps {
  likes: string[];
  dislikes: string[];
  analysis: string | null;
  analysisParagraphs: AnalysisParagraphs | null;
  isLoading: boolean;
  onEditClick: () => void;
}

export const PreferencesSection = ({
  likes,
  dislikes,
  analysis,
  analysisParagraphs,
  isLoading,
  onEditClick,
}: PreferencesSectionProps) => {
  const { t } = useTranslation();

  const hasData = likes.length > 0 || dislikes.length > 0 || analysisParagraphs || analysis;

  return (
    <div className="rounded-[32px] border border-border-default bg-bg-surface p-6 shadow-2xl shadow-black/10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
            {t('user.preferences.title')}
          </p>

          {isLoading ? (
            <div className="mt-3 flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
              <span className="text-sm text-text-tertiary">{t('user.preferences.loading')}</span>
            </div>
          ) : !hasData ? (
            <p className="mt-3 text-sm text-text-tertiary">{t('user.preferences.noPreferences')}</p>
          ) : (
            <div className="mt-4 space-y-4">
              {likes.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-green-400">{t('setup.preferences.likes')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {likes.map((like, index) => (
                      <Badge key={index} variant="like">{like}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {dislikes.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-red-400">{t('setup.preferences.dislikes')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {dislikes.map((dislike, index) => (
                      <Badge key={index} variant="dislike">{dislike}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {(analysisParagraphs || analysis) && (
                <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4">
                  <p className="mb-2 text-xs font-semibold text-purple-300">
                    {t('user.preferences.aiReport')}
                  </p>
                  {analysisParagraphs ? (
                    <div className="space-y-2">
                      <p className="text-sm leading-relaxed text-text-primary">{analysisParagraphs.paragraph1}</p>
                      <p className="text-sm leading-relaxed text-text-primary">{analysisParagraphs.paragraph2}</p>
                      <p className="text-sm leading-relaxed text-text-primary">{analysisParagraphs.paragraph3}</p>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed text-text-primary">{analysis}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <Button
          size="sm"
          className="shrink-0 bg-gradient-to-r from-brand-primary to-rose-500 px-5 text-text-inverse shadow-md shadow-brand-primary/30"
          onClick={onEditClick}
          aria-label={t('user.preferences.edit')}
        >
          {t('user.preferences.edit')}
        </Button>
      </div>
    </div>
  );
};
