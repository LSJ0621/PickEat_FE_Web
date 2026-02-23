/**
 * 관리자 페이지 상단 헤더
 * 현재 페이지 제목, 관리자 정보, 로그아웃 버튼 표시
 */

import { useAppSelector, useAppDispatch } from '@app/store/hooks';
import { logoutAsync } from '@app/store/slices/authSlice';
import { LogOut } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': '대시보드',
  '/admin/users': '사용자 관리',
  '/admin/bug-reports': '버그 리포트',
};

export function AdminHeader() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth?.user);

  // 현재 경로에 맞는 제목 찾기
  const getPageTitle = (): string => {
    // 정확한 경로 매칭
    if (PAGE_TITLES[location.pathname]) {
      return PAGE_TITLES[location.pathname];
    }

    // 상세 페이지 처리 (예: /admin/users/123)
    if (location.pathname.startsWith('/admin/users/')) {
      return '사용자 상세';
    }
    if (location.pathname.startsWith('/admin/bug-reports/')) {
      return '버그 리포트 상세';
    }

    return '관리자 페이지';
  };

  const handleLogout = () => {
    dispatch(logoutAsync());
  };

  return (
    <header className="h-16 bg-bg-surface border-b border-border-default flex items-center justify-between px-6">
      {/* 페이지 제목 */}
      <h2 className="text-xl font-semibold text-text-primary">{getPageTitle()}</h2>

      {/* 관리자 정보 및 로그아웃 */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-text-tertiary">관리자</p>
          <p className="text-sm font-medium text-text-primary">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-secondary text-text-secondary hover:bg-bg-hover hover:text-text-primary transition"
          aria-label="로그아웃"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">로그아웃</span>
        </button>
      </div>
    </header>
  );
}
