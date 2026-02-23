/**
 * 마이페이지 - 모바일 설정 앱 스타일
 * Profile Hero + AI 리포트 + 섹션별 네비게이션 리스트 + 로그아웃/계정삭제
 */

import { useMemo, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { formatBirthDate } from '@/utils/format';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Heart,
  MapPin,
  Globe,
  ClipboardList,
  Store,
  Star,
  BookOpen,
  ChevronRight,
  AlertTriangle,
  Settings,
} from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/common/Button';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { ModalCloseButton } from '@/components/common/ModalCloseButton';
import { userService } from '@/api/services/user';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutAsync } from '@/store/slices/authSlice';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { isAdminRole } from '@/utils/role';

interface MenuNavItem {
  icon: React.ElementType;
  label: string;
  path: string | null;
  action: (() => void) | null;
  isLanguageSelector?: boolean;
}

interface MenuNavSection {
  title: string;
  items: MenuNavItem[];
}

export const MyPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth?.user);
  const userRole = user?.role;
  const { handleError } = useErrorHandler();

  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const analysisParagraphs = user?.preferences?.analysisParagraphs;

  const getGenderLabel = (gender?: string) => {
    if (!gender) return '';
    if (gender === 'male') return t('user.gender.male');
    if (gender === 'female') return t('user.gender.female');
    return t('user.gender.other');
  };

  const handleLogout = async () => {
    await dispatch(logoutAsync());
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await userService.deleteAccount();
      await dispatch(logoutAsync());
      navigate('/login');
    } catch (error: unknown) {
      handleError(error, 'MyPage');
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteAccountModal(false);
    }
  };

  const sections: MenuNavSection[] = useMemo(() => {
    const accountSection: MenuNavSection = {
      title: t('user.sections.account'),
      items: [
        { icon: User, label: t('user.tabs.profile'), path: '/mypage/profile', action: null },
        { icon: Heart, label: t('user.tabs.preferences'), path: '/mypage/preferences', action: null },
        { icon: MapPin, label: t('user.tabs.address'), path: '/mypage/address', action: null },
        { icon: Globe, label: t('user.languageSettings'), path: null, action: null, isLanguageSelector: true },
      ],
    };

    const activitySection: MenuNavSection = {
      title: t('user.sections.activity'),
      items: [
        { icon: ClipboardList, label: t('user.menuSelectionHistory'), path: '/menu-selections/history', action: null },
        { icon: Star, label: t('rating.placeRatingHistory'), path: '/ratings/history', action: null },
        { icon: Store, label: t('userPlace.registerTitle'), path: '/user-places', action: null },
      ],
    };

    const supportSection: MenuNavSection = {
      title: t('user.sections.support'),
      items: [
        { icon: AlertTriangle, label: t('navigation.bugReport'), path: '/bug-report', action: null },
        { icon: BookOpen, label: t('onboarding.guide'), path: null, action: () => window.dispatchEvent(new CustomEvent('openOnboarding')) },
      ],
    };

    const adminSection: MenuNavSection = {
      title: t('user.sections.admin'),
      items: [
        { icon: Settings, label: t('navigation.manage'), path: '/admin/dashboard', action: null },
      ],
    };

    return [
      accountSection,
      activitySection,
      supportSection,
      ...(isAdminRole(userRole) ? [adminSection] : []),
    ];
  }, [t, userRole]);

  const renderNavItem = (item: MenuNavItem) => {
    const Icon = item.icon;

    if (item.isLanguageSelector) {
      return (
        <div key={item.label} className="flex items-center justify-between px-4 py-4 min-h-[48px]">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-text-tertiary shrink-0" />
            <span className="text-sm font-medium text-text-primary">
              {item.label}
            </span>
          </div>
          <LanguageSelector />
        </div>
      );
    }

    const handleClick = () => {
      if (item.action) {
        item.action();
      } else if (item.path) {
        navigate(item.path);
      }
    };

    return (
      <button
        key={item.label}
        onClick={handleClick}
        className="flex w-full items-center justify-between px-4 py-4 min-h-[48px] text-left transition-colors hover:bg-bg-hover"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-text-tertiary shrink-0" />
          <span className="text-sm font-medium text-text-primary">
            {item.label}
          </span>
        </div>
        <ChevronRight className="h-5 w-5 text-text-tertiary shrink-0" />
      </button>
    );
  };

  return (
    <PageContainer maxWidth="max-w-3xl">
      <PageHeader title={t('user.mypage')} />

      <div className="space-y-6">
        {/* Profile Hero */}
        <div className="rounded-2xl border border-border-default bg-bg-surface p-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-500 text-xl font-bold text-white shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
              <p className="text-xl font-bold text-text-primary truncate">
                {user?.name || t('user.noName')}
              </p>
              <p className="text-sm text-text-secondary truncate">
                {user?.email || t('user.noEmail')}
              </p>
              {(user?.birthDate || user?.gender) && (
                <p className="text-sm text-text-tertiary">
                  {user?.birthDate && formatBirthDate(user.birthDate, i18n.language)}
                  {user?.birthDate && user?.gender && ' · '}
                  {user?.gender && getGenderLabel(user.gender)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* AI Report Card */}
        {analysisParagraphs ? (
          <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6">
            <p className="mb-3 text-sm font-semibold text-purple-300">
              {t('user.preferences.aiReport')}
            </p>
            <div className="space-y-2">
              <p className="text-sm leading-relaxed text-text-primary">
                {analysisParagraphs.paragraph1}
              </p>
              <p className="text-sm leading-relaxed text-text-primary">
                {analysisParagraphs.paragraph2}
              </p>
              <p className="text-sm leading-relaxed text-text-primary">
                {analysisParagraphs.paragraph3}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6">
            <p className="mb-3 text-sm font-semibold text-purple-300">
              {t('user.preferences.aiReport')}
            </p>
            <p className="mb-4 text-sm text-text-secondary">
              {t('user.preferences.noPreferencesSetup')}
            </p>
            <Button
              size="sm"
              onClick={() => navigate('/mypage/preferences')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/30"
            >
              {t('user.tabs.preferences')}
            </Button>
          </div>
        )}

        {/* Sectioned Navigation List */}
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="px-1 pb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              {section.title}
            </h3>
            <div className="rounded-2xl border border-border-default bg-bg-surface divide-y divide-border-default">
              {section.items.map((item) => renderNavItem(item))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <div className="pt-2">
          <Button
            size="lg"
            className="w-full rounded-xl border border-border-default bg-bg-surface text-text-secondary hover:bg-bg-hover transition-colors"
            onClick={handleLogout}
          >
            {t('auth.logout')}
          </Button>
        </div>

        {/* Delete account */}
        <div className="flex justify-center pb-4">
          <button
            onClick={() => setShowDeleteAccountModal(true)}
            className="text-sm text-text-tertiary underline hover:text-text-secondary transition-colors"
          >
            {t('user.deleteAccount')}
          </button>
        </div>

        {/* Delete account confirmation modal */}
        {showDeleteAccountModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-[32px] border border-border-default bg-bg-surface p-8 shadow-2xl">
              <ModalCloseButton onClose={() => setShowDeleteAccountModal(false)} />
              <h2 className="mb-4 text-2xl font-bold text-text-primary">
                {t('user.deleteAccountTitle')}
              </h2>
              <p className="mb-6 text-text-secondary">
                <Trans i18nKey="user.deleteAccountMessage" components={{ br: <br /> }} />
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDeleteAccountModal(false)}
                  size="md"
                  className="flex-1 border border-border-default bg-transparent text-text-primary hover:bg-bg-hover"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  isLoading={isDeletingAccount}
                  size="md"
                  className="flex-1 bg-red-600 text-text-inverse hover:bg-red-700"
                >
                  {t('user.withdraw')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
