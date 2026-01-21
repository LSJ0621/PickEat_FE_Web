/**
 * 전역 레이아웃 컴포넌트
 * 모든 페이지에 헤더와 푸터를 자동으로 적용합니다.
 */

import { AppFooter } from '@/components/common/AppFooter';
import { AppHeader } from '@/components/common/AppHeader';
import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export const AppLayout = ({ children, showHeader = true, showFooter = true }: AppLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      {showHeader && <AppHeader />}
      <div className="flex flex-1 flex-col">{children}</div>
      {showFooter && <AppFooter />}
    </div>
  );
};

