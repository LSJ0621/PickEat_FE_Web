import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutAsync } from '@/store/slices/authSlice';
import { useLanguage } from '@/hooks/common/useLanguage';
import { isAdminRole } from '@/utils/role';
import { Globe, LayoutDashboard, LogOut, User } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface UserMenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserMenuDropdown = ({ isOpen, onClose }: UserMenuDropdownProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userName = useAppSelector((state) => state.auth?.user?.name);
  const userEmail = useAppSelector((state) => state.auth?.user?.email);
  const userRole = useAppSelector((state) => state.auth?.user?.role);
  const { currentLanguage, changeLanguage } = useLanguage();

  const handleOutsideClick = useCallback(
    (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleOutsideClick, handleKeyDown]);

  const handleMypage = () => {
    navigate('/mypage');
    onClose();
  };

  const handleAdminDashboard = () => {
    navigate('/admin/dashboard');
    onClose();
  };

  const handleLanguageToggle = async () => {
    await changeLanguage(currentLanguage === 'ko' ? 'en' : 'ko');
  };

  const handleLogout = async () => {
    await dispatch(logoutAsync());
    navigate('/');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-[var(--border-light)] bg-bg-surface shadow-lg"
      role="menu"
    >
      {/* User info section */}
      <div className="border-b border-[var(--border-light)] px-4 py-3">
        <p className="text-sm font-semibold text-text-primary">
          {userName || t('user.noName')}
        </p>
        <p className="text-xs text-text-tertiary">
          {userEmail || t('user.noEmail')}
        </p>
      </div>

      {/* Menu items */}
      <div className="py-1">
        <button
          onClick={handleMypage}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-primary transition-colors hover:bg-bg-hover"
          role="menuitem"
        >
          <User className="h-4 w-4 text-text-tertiary" />
          {t('user.mypage')}
        </button>

        {isAdminRole(userRole) && (
          <button
            onClick={handleAdminDashboard}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-primary transition-colors hover:bg-bg-hover"
            role="menuitem"
          >
            <LayoutDashboard className="h-4 w-4 text-text-tertiary" />
            {t('user.adminDashboard')}
          </button>
        )}

        <button
          onClick={handleLanguageToggle}
          className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-text-primary transition-colors hover:bg-bg-hover"
          role="menuitem"
        >
          <span className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-text-tertiary" />
            {t('user.languageSettings')}
          </span>
          <span className="text-xs text-text-tertiary">
            {currentLanguage === 'ko' ? 'KOR' : 'ENG'}
          </span>
        </button>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-error transition-colors hover:bg-error-bg"
          role="menuitem"
        >
          <LogOut className="h-4 w-4" />
          {t('auth.logout')}
        </button>
      </div>
    </div>
  );
};
