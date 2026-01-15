import { useAppSelector } from '@/store/hooks';

export const UserMenu = () => {
  const userName = useAppSelector((state) => state.auth?.user?.name);

  return (
    <span className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white">
      {userName && <span className="hidden sm:inline">{userName}님</span>}
    </span>
  );
};
