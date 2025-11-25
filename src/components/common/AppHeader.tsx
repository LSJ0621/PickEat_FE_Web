/**
 * 공통 헤더 컴포넌트
 * 모든 페이지에서 사용되는 헤더
 */

import { Button } from '@/components/common/Button';
import { useAppSelector } from '@/store/hooks';
import { useNavigate } from 'react-router-dom';

export const AppHeader = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const userAddress = useAppSelector((state) => state.auth?.user?.address);
  const userName = useAppSelector((state) => state.auth?.user?.name);

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-30">
        <div className="relative left-1/2 w-screen -translate-x-1/2 border-b border-white/10 bg-slate-950/80 backdrop-blur">
          <div className="flex w-full items-center justify-between px-4 py-4 sm:px-6 lg:px-12">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-pink-500 to-fuchsia-600 text-lg font-bold text-slate-950 shadow-lg shadow-orange-500/30">
              P
            </div>
            <div>
              <p className="text-xl font-semibold">PickEat</p>
              <p className="text-xs text-slate-400">Recommendation OS</p>
            </div>
          </button>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            {isAuthenticated && userAddress && (
              <span className="hidden rounded-full border border-white/10 px-3 py-1 text-xs sm:inline-flex">
                📍 {userAddress}
              </span>
            )}
            {isAuthenticated && userName && <span className="text-sm font-semibold text-white">{userName}님</span>}
            {!isAuthenticated && (
              <Button
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-rose-500 px-5 text-white shadow-md shadow-orange-500/30"
                onClick={() => navigate('/login')}
              >
                로그인
              </Button>
            )}
          </div>
          </div>
        </div>
      </header>
    </>
  );
};
