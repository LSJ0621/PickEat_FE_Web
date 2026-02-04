import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/Button';

interface ProfileSectionProps {
  birthYear?: number | null;
  gender?: 'male' | 'female' | 'other' | null;
  onEditClick: () => void;
}

export const ProfileSection = ({
  birthYear,
  gender,
  onEditClick,
}: ProfileSectionProps) => {
  const { t } = useTranslation();

  const getGenderLabel = (gender?: 'male' | 'female' | 'other' | null): string => {
    if (!gender) return t('user.profile.notSet');
    switch (gender) {
      case 'male':
        return t('user.profile.genderMale');
      case 'female':
        return t('user.profile.genderFemale');
      case 'other':
        return t('user.profile.genderOther');
      default:
        return t('user.profile.notSet');
    }
  };

  return (
    <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-400">{t('user.profile.title')}</p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{t('user.profile.birthYear')}:</span>
              <span className="text-sm text-slate-200">
                {birthYear ? `${birthYear}년` : t('user.profile.notSet')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{t('user.profile.gender')}:</span>
              <span className="text-sm text-slate-200">{getGenderLabel(gender)}</span>
            </div>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-gradient-to-r from-orange-500 to-rose-500 px-5 text-white shadow-md shadow-orange-500/30"
          onClick={onEditClick}
        >
          {t('user.profile.edit')}
        </Button>
      </div>
    </div>
  );
};
