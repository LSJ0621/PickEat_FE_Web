import { useTranslation } from 'react-i18next';
import { User, ChevronRight } from 'lucide-react';

interface ProfileSectionProps {
  birthDate?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  onEditClick?: () => void;
}

export const ProfileSection = ({
  birthDate,
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
    <div
      className="group cursor-pointer p-4 row-interactive"
      onClick={onEditClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEditClick?.();
        }
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50">
          <User className="h-5 w-5 text-blue-500" />
        </div>
        <div className="flex flex-1 items-center justify-between">
          <span className="text-sm text-text-primary">{t('user.profile.title')}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary">
              {birthDate ? birthDate.replace(/-/g, '.') : t('user.profile.notSet')} · {getGenderLabel(gender)}
            </span>
            <ChevronRight className="h-4 w-4 text-text-tertiary icon-chevron-hover" />
          </div>
        </div>
      </div>
    </div>
  );
};
