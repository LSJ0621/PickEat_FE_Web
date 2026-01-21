/**
 * 공통 헤더 컴포넌트
 * 모든 페이지에서 사용되는 헤더
 */

import { Button } from '@/components/common/Button';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { UserMenu } from '@/components/common/UserMenu';
import { useAppSelector } from '@/store/hooks';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { shallowEqual } from 'react-redux';

export const AppHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated, shallowEqual);

  // 인증 관련 페이지에서는 헤더 오른쪽 영역을 숨겨서
  // 로그인 버튼/유저 이름이 보이지 않도록 처리
  const AUTH_PAGES = [
    '/login',
    '/register',
    '/password/reset',
    '/password/reset/request',
    '/re-register',
  ];
  const isAuthPage = AUTH_PAGES.includes(location.pathname);

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
              className="flex cursor-pointer items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-pink-500 to-fuchsia-600 text-lg font-bold text-slate-950 shadow-lg shadow-orange-500/30">
                P
              </div>
              <div>
                <p className="text-xl font-semibold">PickEat</p>
                <p className="text-xs text-slate-400">Recommendation OS</p>
              </div>
            </button>
            {/* 인증 페이지에서는 오른쪽 영역을 렌더링하지 않음 */}
            {!isAuthPage && (
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <LanguageSelector className="hidden sm:flex" />
                {isAuthenticated && <UserMenu />}
                {!isAuthenticated && (
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 to-rose-500 px-5 text-white shadow-md shadow-orange-500/30"
                    onClick={() => navigate('/login')}
                  >
                    {t('auth.login')}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
