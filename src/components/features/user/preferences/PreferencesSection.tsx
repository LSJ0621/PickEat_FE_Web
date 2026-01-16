import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/Button';

interface PreferencesSectionProps {
  likes: string[];
  dislikes: string[];
  analysis: string | null;
  isLoading: boolean;
  onEditClick: () => void;
}

export const PreferencesSection = ({
  likes,
  dislikes,
  analysis,
  isLoading,
  onEditClick,
}: PreferencesSectionProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-400">{t('user.preferences.title')}</p>
          {isLoading ? (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-orange-500"></div>
              <span className="text-slate-400">{t('user.preferences.loading')}</span>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {likes.length > 0 && (
                <div>
                  <p className="mb-2 text-xs text-slate-400">{t('setup.preferences.likes')}</p>
                  <div className="flex flex-wrap gap-2">
                    {likes.map((like, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm text-green-200"
                      >
                        {like}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {dislikes.length > 0 && (
                <div>
                  <p className="mb-2 text-xs text-slate-400">{t('setup.preferences.dislikes')}</p>
                  <div className="flex flex-wrap gap-2">
                    {dislikes.map((dislike, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm text-red-200"
                      >
                        {dislike}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {analysis && (
                <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4">
                  <p className="mb-2 text-xs font-medium text-purple-200">{t('user.preferences.aiReport')}</p>
                  <p className="text-sm leading-relaxed text-slate-100">{analysis}</p>
                </div>
              )}
              {likes.length === 0 && dislikes.length === 0 && !analysis && (
                <p className="text-sm text-slate-400">{t('user.preferences.noPreferences')}</p>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            className="bg-gradient-to-r from-orange-500 to-rose-500 px-5 text-white shadow-md shadow-orange-500/30"
            onClick={onEditClick}
          >
            {t('user.preferences.edit')}
          </Button>
        </div>
      </div>
    </div>
  );
};

