import { AuthPromptModal } from '@/components/common/AuthPromptModal';
import { useAppSelector } from '@/store/hooks';
import type { ReactElement } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: ReactElement;
  requiresAuth?: boolean;
}

const SAFE_AREA_CLASSES = 'h-[88px] sm:h-[104px]';

export const AppFooter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const userRole = useAppSelector((state) => state.auth?.user?.role);
  const [showPrompt, setShowPrompt] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const navItems: NavItem[] = useMemo(() => {
    const baseItems: NavItem[] = [
      {
        label: '홈',
        path: '/',
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l9-7 9 7v7a2 2 0 01-2 2h-4a2 2 0 01-2-2v-3H9v3a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        ),
      },
      {
        label: '에이전트',
        path: '/agent',
        requiresAuth: true,
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        label: '추천 이력',
        path: '/recommendations/history',
        requiresAuth: true,
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2m-6 0a2 2 0 012-2h2a2 2 0 012 2m-6 0a2 2 0 002 2h2a2 2 0 002-2" />
          </svg>
        ),
      },
    ];

    // Admin은 "관리" 탭, 일반 사용자는 "버그 제보" 탭
    if (userRole === 'ADMIN') {
      baseItems.push({
        label: '관리',
        path: '/admin/dashboard',
        requiresAuth: true,
        icon: <Settings className="h-6 w-6" />,
      });
    } else {
      baseItems.push({
        label: '버그 제보',
        path: '/bug-report',
        requiresAuth: true,
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
      });
    }

    baseItems.push({
      label: '마이페이지',
      path: '/mypage',
      requiresAuth: true,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    });

    return baseItems;
  }, [userRole]);

  const handleNavClick = (item: NavItem) => {
    if (item.requiresAuth && !isAuthenticated) {
      setPendingPath(item.path);
      setShowPrompt(true);
      return;
    }
    navigate(item.path);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <>
      <div className={SAFE_AREA_CLASSES} aria-hidden />
      <footer className={`fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-slate-950/90 backdrop-blur ${SAFE_AREA_CLASSES}`}>
        <nav className="mx-auto flex h-full w-full max-w-4xl items-center gap-[min(4vw,16px)] px-6 py-3 text-xs font-semibold text-slate-300">
          {navItems.map((item) => {
            // Admin 경로는 startsWith로 체크, 나머지는 정확히 일치
            const isActive = item.path.startsWith('/admin')
              ? location.pathname.startsWith('/admin')
              : location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 transition ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500/25 via-rose-500/25 to-fuchsia-500/25 text-pink-100 border border-pink-400/30'
                    : 'text-slate-400 hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className={`${isActive ? 'text-pink-300' : 'text-slate-400'}`}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </footer>
      <AuthPromptModal
        open={showPrompt}
        onConfirm={() => {
          setShowPrompt(false);
          navigate('/login', pendingPath ? { state: { redirectTo: pendingPath } } : undefined);
        }}
        onClose={() => {
          setShowPrompt(false);
          setPendingPath(null);
        }}
      />
    </>
  );
};
