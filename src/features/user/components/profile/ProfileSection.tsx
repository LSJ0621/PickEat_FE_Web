import { useTranslation } from 'react-i18next';
import { Button } from '@shared/components/Button';
import { formatBirthDate } from '@shared/utils/format';

interface ProfileSectionProps {
  birthDate?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  onEditClick: () => void;
}

const getGenderLabel = (t: (key: string) => string, gender?: 'male' | 'female' | 'other' | null): string => {
  if (!gender) return t('user.profile.notSet');
  const map: Record<string, string> = {
    male: t('user.profile.genderMale'),
    female: t('user.profile.genderFemale'),
    other: t('user.profile.genderOther'),
  };
  return map[gender] ?? t('user.profile.notSet');
};

export const ProfileSection = ({
  birthDate,
  gender,
  onEditClick,
}: ProfileSectionProps) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="rounded-[32px] border border-border-default bg-bg-surface p-6 shadow-2xl shadow-black/10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
            {t('user.profile.title')}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-bg-secondary px-4 py-3">
              <p className="text-xs text-text-tertiary">{t('user.profile.birthDate')}</p>
              <p className="mt-1 text-sm font-semibold text-text-primary">
                {birthDate ? formatBirthDate(birthDate, i18n.language) : t('user.profile.notSet')}
              </p>
            </div>
            <div className="rounded-xl bg-bg-secondary px-4 py-3">
              <p className="text-xs text-text-tertiary">{t('user.profile.gender')}</p>
              <p className="mt-1 text-sm font-semibold text-text-primary">
                {getGenderLabel(t, gender)}
              </p>
            </div>
          </div>
        </div>
        <Button
          size="sm"
          className="shrink-0 bg-gradient-to-r from-brand-primary to-rose-500 px-5 text-text-inverse shadow-md shadow-brand-primary/30"
          onClick={onEditClick}
          aria-label={t('user.profile.edit')}
        >
          {t('user.profile.edit')}
        </Button>
      </div>
    </div>
  );
};
