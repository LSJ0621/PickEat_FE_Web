import { useAppSelector } from '@/store/hooks';
import { useTranslation } from 'react-i18next';

export const UserMenu = () => {
  const { t } = useTranslation();
  const userName = useAppSelector((state) => state.auth?.user?.name);

  return (
    <span className="flex items-center gap-2 rounded-xl border border-border-default bg-bg-secondary px-3 py-2 text-sm font-semibold text-text-primary">
      {userName && <span className="hidden sm:inline">{userName}{t('user.honorific')}</span>}
    </span>
  );
};
