/**
 * 공통 헤더 컴포넌트
 * 모든 페이지에서 사용되는 헤더
 */

import { Button } from '@/components/common/Button';
import { UserMenu } from '@/components/common/UserMenu';
import { useAppSelector } from '@/store/hooks';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AppHeader = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const userAddress = localStorage.getItem('user_address');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleGoToLogin = () => {
    setShowLoginModal(false);
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
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
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Button variant="secondary" size="sm" onClick={() => navigate('/login')}>
              로그인
            </Button>
          )}
        </div>
      </div>
    </header>

    {showLoginModal && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur">
        <div className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-slate-950/95 p-8 text-white shadow-2xl">
          <button
            onClick={() => setShowLoginModal(false)}
            className="absolute right-5 top-5 text-slate-400 transition hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-pink-500 to-fuchsia-600 text-2xl font-bold text-slate-950 shadow-lg shadow-orange-500/30">
              P
            </div>
            <h3 className="mb-2 text-2xl font-semibold">로그인이 필요합니다</h3>
            <p className="mb-6 text-slate-300">메뉴 추천 기능을 사용하려면 로그인해주세요.</p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setShowLoginModal(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleGoToLogin}
                className="flex-1"
              >
                로그인하기
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

