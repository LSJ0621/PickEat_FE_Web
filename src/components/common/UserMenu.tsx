import { useAppSelector } from '@/store/hooks';
import { useTranslation } from 'react-i18next';

export const UserMenu = () => {
  const { t } = useTranslation();
  const userName = useAppSelector((state) => state.auth?.user?.name);

  return (
    <span className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white">
      {userName && <span className="hidden sm:inline">{userName}{t('user.honorific')}</span>}
    </span>
  );
};
