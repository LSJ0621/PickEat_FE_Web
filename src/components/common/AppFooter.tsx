import { AuthPromptModal } from '@/components/common/AuthPromptModal';
import { useAppSelector } from '@/store/hooks';
import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Clock, ClipboardList, User } from 'lucide-react';
import { shallowEqual } from 'react-redux';

interface NavItem {
  label: string;
  path: string;
  icon: ReactElement;
  requiresAuth?: boolean;
}

const SAFE_AREA_CLASSES = 'h-[88px] sm:h-[104px]';

export const AppFooter = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated, shallowEqual);
  const [showPrompt, setShowPrompt] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const navItems: NavItem[] = useMemo(() => {
    return [
      {
        label: t('navigation.home'),
        path: '/',
        icon: <Home className="h-6 w-6" aria-hidden="true" />,
      },
      {
        label: t('navigation.agent'),
        path: '/agent',
        requiresAuth: true,
        icon: <Clock className="h-6 w-6" aria-hidden="true" />,
      },
      {
        label: t('navigation.history'),
        path: '/recommendations/history',
        requiresAuth: true,
        icon: <ClipboardList className="h-6 w-6" aria-hidden="true" />,
      },
      {
        label: t('navigation.mypage'),
        path: '/mypage',
        requiresAuth: true,
        icon: <User className="h-6 w-6" aria-hidden="true" />,
      },
    ];
  }, [t]);

  const handleNavClick = (item: NavItem) => {
    if (item.requiresAuth && !isAuthenticated) {
      setPendingPath(item.path);
      setShowPrompt(true);
      return;
    }
    navigate(item.path);
  };

  return (
    <>
      <div className={SAFE_AREA_CLASSES} aria-hidden />
      <footer className={`fixed bottom-0 left-0 right-0 z-30 border-t border-border-default bg-bg-surface/90 backdrop-blur ${SAFE_AREA_CLASSES}`}>
        <nav className="mx-auto flex h-full w-full max-w-4xl items-center gap-[min(4vw,16px)] px-6 py-3 text-xs font-semibold text-text-secondary">
          {navItems.map((item) => {
            const isActive = item.path === '/mypage'
              ? location.pathname.startsWith('/mypage')
              : location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item)}
                className={`relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 transition ${
                  isActive
                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/30'
                    : 'text-text-tertiary hover:bg-bg-hover border border-transparent'
                }`}
              >
                <span className={`${isActive ? 'text-brand-primary' : 'text-text-tertiary'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {isActive && (
                  <span
                    className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand-primary"
                    aria-hidden="true"
                  />
                )}
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
